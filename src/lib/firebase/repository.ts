import { browser } from '$app/environment';
import {
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	limit,
	onSnapshot,
	query,
	setDoc,
	where,
	writeBatch,
	type DocumentData,
	type Query
} from 'firebase/firestore';
import { get, writable, type Writable } from 'svelte/store';
import {
	banners,
	campaigns,
	effectSettings,
	posts,
	selectedTheme,
	subscribers,
	type BlogPost,
	type Campaign,
	type EffectSettings,
	type SiteBanner,
	type Subscriber,
	type ThemeId
} from '$lib/content/site';
import {
	defaultPageContent,
	pageContent,
	type PageContent
} from '$lib/content/page-content';
import { authState, db } from './client';

export const firebaseConnection = writable<{
	ready: boolean;
	syncing: boolean;
	error: string;
}>({ ready: false, syncing: browser, error: '' });

let started = false;
let postUnsubscribe: (() => void) | undefined;
let privateUnsubscribes: Array<() => void> = [];
let seededUser = '';

function reportError(error: unknown) {
	const message =
		error instanceof Error
			? error.message.replace(/Firebase(?:Error)?:?\s*/gi, '').trim()
			: 'The server could not complete the request.';
	firebaseConnection.update((state) => ({ ...state, syncing: false, error: message }));
}

function listenToCollection<T extends { id: string }>(
	source: Query<DocumentData, DocumentData>,
	store: Writable<T[]>,
	preserveFallbackWhenEmpty = false
) {
	return onSnapshot(
		source,
		(snapshot) => {
			const values = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as T);
			if (values.length || !preserveFallbackWhenEmpty) store.set(values);
			firebaseConnection.set({ ready: true, syncing: false, error: '' });
		},
		reportError
	);
}

function startPublicListeners() {
	if (!db) return;

	onSnapshot(
		doc(db, 'site', 'content'),
		(snapshot) => {
			if (snapshot.exists()) pageContent.set(snapshot.data().value as PageContent);
			firebaseConnection.set({ ready: true, syncing: false, error: '' });
		},
		reportError
	);

	onSnapshot(
		doc(db, 'site', 'settings'),
		(snapshot) => {
			if (snapshot.exists()) {
				const data = snapshot.data();
				if (data.theme) selectedTheme.set(data.theme as ThemeId);
				if (data.effects) {
					effectSettings.set({
						enabled: data.effects.enabled ?? true,
						intensity: data.effects.intensity ?? 'medium',
						effect: data.effects.effect ?? 'auto'
					} as EffectSettings);
				}
			}
			firebaseConnection.set({ ready: true, syncing: false, error: '' });
		},
		reportError
	);

	listenToCollection<SiteBanner>(collection(db, 'banners'), banners, true);
}

function startRoleListeners(authenticated: boolean) {
	if (!db) return;
	postUnsubscribe?.();
	privateUnsubscribes.forEach((unsubscribe) => unsubscribe());
	privateUnsubscribes = [];

	const postQuery = authenticated
		? query(collection(db, 'posts'))
		: query(collection(db, 'posts'), where('status', '==', 'published'));
	postUnsubscribe = listenToCollection<BlogPost>(postQuery, posts, true);

	if (authenticated) {
		privateUnsubscribes.push(
			listenToCollection<Subscriber>(collection(db, 'subscribers'), subscribers, true),
			listenToCollection<Campaign>(collection(db, 'campaigns'), campaigns, true)
		);
	}
}

async function seedCollection<T extends { id: string }>(name: string, values: T[]) {
	if (!db || !values.length) return;
	const existing = await getDocs(query(collection(db, name), limit(1)));
	if (!existing.empty) return;
	const batch = writeBatch(db);
	values.forEach((value) => batch.set(doc(db!, name, value.id), value));
	await batch.commit();
}

async function seedEmptyProject() {
	if (!db) return;
	firebaseConnection.update((state) => ({ ...state, syncing: true, error: '' }));

	const contentReference = doc(db, 'site', 'content');
	const contentSnapshot = await getDoc(contentReference);
	if (!contentSnapshot.exists()) {
		await setDoc(contentReference, { value: get(pageContent) || defaultPageContent });
	}

	const settingsReference = doc(db, 'site', 'settings');
	const settingsSnapshot = await getDoc(settingsReference);
	if (!settingsSnapshot.exists()) {
		await setDoc(settingsReference, {
			theme: get(selectedTheme),
			effects: get(effectSettings)
		});
	}

	await Promise.all([
		seedCollection('posts', get(posts)),
		seedCollection('banners', get(banners)),
		seedCollection('campaigns', get(campaigns)),
		seedCollection('subscribers', get(subscribers))
	]);
	firebaseConnection.set({ ready: true, syncing: false, error: '' });
}

export function startFirebaseSync() {
	if (!browser || !db || started) return;
	started = true;
	startPublicListeners();
	authState.subscribe(({ user, loading }) => {
		if (loading) return;
		startRoleListeners(Boolean(user));
		if (user && seededUser !== user.uid) {
			seededUser = user.uid;
			seedEmptyProject().catch(reportError);
		}
	});
}

function requireDatabase() {
	if (!db) throw new Error('Firebase is unavailable in this browser.');
	return db;
}

function requireAdmin() {
	if (!get(authState).user) throw new Error('You must be signed in to save changes.');
}

export async function savePageContent(value: PageContent) {
	requireAdmin();
	await setDoc(doc(requireDatabase(), 'site', 'content'), { value });
}

export async function saveSiteSettings(theme: ThemeId, effects: EffectSettings) {
	requireAdmin();
	await setDoc(doc(requireDatabase(), 'site', 'settings'), { theme, effects });
}

export async function savePost(post: BlogPost) {
	requireAdmin();
	await setDoc(doc(requireDatabase(), 'posts', post.id), post);
}

export async function deletePost(postId: string) {
	requireAdmin();
	await deleteDoc(doc(requireDatabase(), 'posts', postId));
}

export async function saveCampaign(campaign: Campaign) {
	requireAdmin();
	await setDoc(doc(requireDatabase(), 'campaigns', campaign.id), campaign);
}

export async function saveSubscriber(subscriber: Subscriber) {
	requireAdmin();
	await setDoc(doc(requireDatabase(), 'subscribers', subscriber.id), subscriber);
}

export async function deleteSubscriber(subscriberId: string) {
	requireAdmin();
	await deleteDoc(doc(requireDatabase(), 'subscribers', subscriberId));
}

export async function saveBanners(values: SiteBanner[]) {
	requireAdmin();
	const database = requireDatabase();
	const batch = writeBatch(database);
	values.forEach((banner) => batch.set(doc(database, 'banners', banner.id), banner));
	await batch.commit();
}

export async function deleteBanner(bannerId: string) {
	requireAdmin();
	await deleteDoc(doc(requireDatabase(), 'banners', bannerId));
}

async function subscriberId(email: string) {
	const bytes = new TextEncoder().encode(email.trim().toLowerCase());
	const hash = await crypto.subtle.digest('SHA-256', bytes);
	return Array.from(new Uint8Array(hash))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
}

export async function subscribeToNewsletter(name: string, email: string) {
	const database = requireDatabase();
	const cleanEmail = email.trim().toLowerCase();
	const id = await subscriberId(cleanEmail);
	const subscriber: Subscriber = {
		id,
		name: name.trim() || 'Newsletter reader',
		email: cleanEmail,
		joinedAt: new Date().toISOString().slice(0, 10),
		status: 'active'
	};
	await setDoc(doc(database, 'subscribers', id), subscriber);
	return subscriber;
}
