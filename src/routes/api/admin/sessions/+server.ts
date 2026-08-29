import { json } from '@sveltejs/kit';
import { requireFirebaseUser } from '$lib/server/cloudflare-images';
import type { RequestHandler } from './$types';

const COLLECTION_URL =
	'https://firestore.googleapis.com/v1/projects/ashleighdarnell/databases/(default)/documents/adminSessions';

type FirestoreValue = {
	stringValue?: string;
	timestampValue?: string;
	nullValue?: null;
};

type FirestoreDocument = {
	name: string;
	fields?: Record<string, FirestoreValue>;
};

function stringField(document: FirestoreDocument, field: string) {
	return document.fields?.[field]?.stringValue ?? '';
}

async function firestoreRequest(url: string, idToken: string, init?: RequestInit) {
	const response = await fetch(url, {
		...init,
		headers: {
			authorization: `Bearer ${idToken}`,
			'content-type': 'application/json',
			...init?.headers
		}
	});
	if (!response.ok) {
		console.error('Admin session log request failed.', response.status, await response.text());
		throw new Error('Session logs could not be updated.');
	}
	return response;
}

export const GET: RequestHandler = async ({ request }) => {
	const user = await requireFirebaseUser(request);
	const parameters = new URLSearchParams({
		pageSize: '100',
		orderBy: 'startedAt desc'
	});
	const response = await firestoreRequest(`${COLLECTION_URL}?${parameters}`, user.idToken);
	const result = (await response.json()) as { documents?: FirestoreDocument[] };
	const sessions = (result.documents ?? []).map((document) => ({
		id: document.name.split('/').at(-1) ?? '',
		email: stringField(document, 'email'),
		ip: stringField(document, 'ip'),
		userAgent: stringField(document, 'userAgent'),
		startedAt: document.fields?.startedAt?.timestampValue ?? '',
		lastSeenAt: document.fields?.lastSeenAt?.timestampValue ?? '',
		endedAt: document.fields?.endedAt?.timestampValue ?? '',
		status: stringField(document, 'status'),
		path: stringField(document, 'path')
	}));
	return json({ sessions });
};

export const POST: RequestHandler = async ({ request }) => {
	const user = await requireFirebaseUser(request);
	const body = (await request.json()) as {
		action?: 'start' | 'touch' | 'end';
		sessionId?: string;
		path?: string;
	};
	const sessionId = body.sessionId?.trim() ?? '';
	if (!/^[a-zA-Z0-9-]{12,80}$/.test(sessionId)) {
		return json({ message: 'Invalid session identifier.' }, { status: 400 });
	}
	if (!['start', 'touch', 'end'].includes(body.action ?? '')) {
		return json({ message: 'Invalid session action.' }, { status: 400 });
	}

	const now = new Date().toISOString();
	const documentUrl = `${COLLECTION_URL}/${encodeURIComponent(sessionId)}`;
	if (body.action === 'start') {
		const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
		const ip =
			request.headers.get('cf-connecting-ip') ??
			forwarded ??
			request.headers.get('x-real-ip') ??
			'Unavailable';
		await firestoreRequest(documentUrl, user.idToken, {
			method: 'PATCH',
			body: JSON.stringify({
				fields: {
					uid: { stringValue: user.localId },
					email: { stringValue: user.email ?? 'Unknown administrator' },
					ip: { stringValue: ip.slice(0, 100) },
					userAgent: {
						stringValue: (request.headers.get('user-agent') ?? 'Unavailable').slice(0, 500)
					},
					startedAt: { timestampValue: now },
					lastSeenAt: { timestampValue: now },
					endedAt: { nullValue: null },
					status: { stringValue: 'active' },
					path: { stringValue: (body.path ?? '/admin').slice(0, 300) }
				}
			})
		});
		return json({ sessionId, startedAt: now });
	}

	const status = body.action === 'end' ? 'ended' : 'active';
	const updateMask = new URLSearchParams();
	updateMask.append('updateMask.fieldPaths', 'lastSeenAt');
	updateMask.append('updateMask.fieldPaths', 'status');
	updateMask.append('updateMask.fieldPaths', 'path');
	if (body.action === 'end') updateMask.append('updateMask.fieldPaths', 'endedAt');
	await firestoreRequest(`${documentUrl}?${updateMask}`, user.idToken, {
		method: 'PATCH',
		body: JSON.stringify({
			fields: {
				lastSeenAt: { timestampValue: now },
				status: { stringValue: status },
				path: { stringValue: (body.path ?? '/admin').slice(0, 300) },
				...(body.action === 'end' ? { endedAt: { timestampValue: now } } : {})
			}
		})
	});
	return json({ sessionId, status });
};
