import { browser } from '$app/environment';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
	browserLocalPersistence,
	browserSessionPersistence,
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
	retryable: boolean;
};

export const authState = writable<FirebaseAuthState>({
	user: null,
	loading: browser,
	error: '',
	retryable: false
});

export const firebaseApp: FirebaseApp | null = browser
	? getApps().length
		? getApp()
		: initializeApp(firebaseConfig)
	: null;

export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
export const db: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;

function errorCode(error: unknown) {
	return error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
}

function delay(milliseconds: number) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function readAdminAccess(user: User) {
	if (!db) throw new Error('Firebase is unavailable in this browser.');
	const administrator = await getDoc(doc(db, 'admins', user.uid));
	return administrator.exists();
}

export async function hasAdminAccess(user: User) {
	let lastError: unknown;
	for (let attempt = 0; attempt < 3; attempt += 1) {
		try {
			return await readAdminAccess(user);
		} catch (error) {
			lastError = error;
			if (errorCode(error).includes('permission-denied')) throw error;
			if (attempt < 2) await delay(300 * (attempt + 1));
		}
	}
	throw lastError;
}

let authSequence = 0;
let verifiedUser: User | null = null;

async function initializeAuth(authInstance: Auth) {
	let persistenceWarning = '';
	try {
		await setPersistence(authInstance, browserLocalPersistence);
	} catch {
		try {
			await setPersistence(authInstance, browserSessionPersistence);
			persistenceWarning =
				'This browser could only keep the administrator session for the current tab.';
		} catch (error) {
			persistenceWarning =
				error instanceof Error ? error.message : 'The administrator session could not be persisted.';
		}
	}

	try {
		await authInstance.authStateReady();
	} catch (error) {
		authState.set({
			user: null,
			loading: false,
			error: error instanceof Error ? error.message : 'The administrator session could not be restored.',
			retryable: true
		});
		return;
	}

	onAuthStateChanged(
		authInstance,
		async (user) => {
			const sequence = ++authSequence;
			if (!user) {
				verifiedUser = null;
				authState.set({
					user: null,
					loading: false,
					error: persistenceWarning,
					retryable: false
				});
				return;
			}

			const previouslyVerified = verifiedUser?.uid === user.uid ? verifiedUser : null;
			authState.set({
				user: previouslyVerified,
				loading: true,
				error: persistenceWarning,
				retryable: false
			});
			try {
				for (let retry = 0; retry < 5; retry += 1) {
					if (
						sequence !== authSequence ||
						authInstance.currentUser?.uid !== user.uid
					) {
						return;
					}
					try {
						const allowed = await readAdminAccess(user);
						if (sequence !== authSequence) return;
						if (allowed) {
							verifiedUser = user;
							authState.set({
								user,
								loading: false,
								error: persistenceWarning,
								retryable: false
							});
							return;
						}
						verifiedUser = null;
						authState.set({
							user: null,
							loading: false,
							error: 'This account does not have administrator access.',
							retryable: false
						});
						await signOut(authInstance);
						return;
					} catch (error) {
						if (sequence !== authSequence) return;
						if (errorCode(error).includes('permission-denied')) throw error;
						if (retry < 4) {
							authState.set({
								user: previouslyVerified,
								loading: true,
								error: 'Connection interrupted. Rechecking administrator access…',
								retryable: false
							});
							await delay(Math.min(1000 * (retry + 1), 5000));
						}
					}
				}

				authState.set({
					user: previouslyVerified,
					loading: false,
					error: 'Administrator access could not be rechecked. Check your connection and retry.',
					retryable: true
				});
			} catch (error: unknown) {
				if (sequence !== authSequence) return;
				verifiedUser = null;
				authState.set({
					user: null,
					loading: false,
					error: error instanceof Error ? error.message : 'Administrator access could not be verified.',
					retryable: false
				});
				await signOut(authInstance);
			}
		},
		(error) => {
			authSequence += 1;
			const currentUser = authInstance.currentUser;
			authState.set({
				user: verifiedUser?.uid === currentUser?.uid ? verifiedUser : null,
				loading: false,
				error: error.message,
				retryable: Boolean(currentUser)
			});
		}
	);
}

if (auth) void initializeAuth(auth);
