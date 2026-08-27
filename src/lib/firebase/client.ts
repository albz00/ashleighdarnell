import { browser } from '$app/environment';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
	browserLocalPersistence,
	getAuth,
	onAuthStateChanged,
	setPersistence,
	signOut,
	type Auth,
	type User
} from 'firebase/auth';
import { doc, getDoc, getFirestore, type Firestore } from 'firebase/firestore';
import { writable } from 'svelte/store';

const firebaseConfig = {
	apiKey: 'AIzaSyAHDC1UF9pWyI8sxiPQQ6MMSRvQY61sW8A',
	authDomain: 'ashleighdarnell.firebaseapp.com',
	projectId: 'ashleighdarnell',
	storageBucket: 'ashleighdarnell.firebasestorage.app',
	messagingSenderId: '784208687175',
	appId: '1:784208687175:web:6735094f05610e56dd0162'
};

export type FirebaseAuthState = {
	user: User | null;
	loading: boolean;
	error: string;
};

export const authState = writable<FirebaseAuthState>({
	user: null,
	loading: browser,
	error: ''
});

export const firebaseApp: FirebaseApp | null = browser
	? getApps().length
		? getApp()
		: initializeApp(firebaseConfig)
	: null;

export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
export const db: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;

export async function hasAdminAccess(user: User) {
	if (!db) return false;
	const administrator = await getDoc(doc(db, 'admins', user.uid));
	return administrator.exists();
}

if (auth) {
	setPersistence(auth, browserLocalPersistence).catch((error: unknown) => {
		authState.update((state) => ({
			...state,
			error: error instanceof Error ? error.message : 'Could not persist the admin session.'
		}));
	});

	onAuthStateChanged(
		auth,
		async (user) => {
			if (!user) {
				authState.set({ user: null, loading: false, error: '' });
				return;
			}
			try {
				if (await hasAdminAccess(user)) {
					authState.set({ user, loading: false, error: '' });
				} else {
					authState.set({
						user: null,
						loading: false,
						error: 'This account does not have administrator access.'
					});
					await signOut(auth);
				}
			} catch (error: unknown) {
				authState.set({
					user: null,
					loading: false,
					error: error instanceof Error ? error.message : 'Administrator access could not be verified.'
				});
			}
		},
		(error) => authState.set({ user: null, loading: false, error: error.message })
	);
}
