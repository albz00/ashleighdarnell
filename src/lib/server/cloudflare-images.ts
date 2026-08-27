import { env as privateEnv } from '$env/dynamic/private';
import { error, type RequestEvent } from '@sveltejs/kit';

export const IMAGE_SITE_ID = 'ashleighdarnell';

type CloudflareEnvironment = {
	CLOUDFLARE_IMAGES_API_TOKEN?: string;
	CLOUDFLARE_ACCOUNT_ID?: string;
	CLOUDFLARE_IMAGES_ACCOUNT_HASH?: string;
};

export type CloudflareImage = {
	id: string;
	filename: string;
	uploaded: string;
	meta?: {
		site?: string;
		setName?: string;
		orientation?: string;
		source?: string;
	};
	variants: string[];
};

export function cloudflareEnvironment(platform: App.Platform | undefined): Required<CloudflareEnvironment> {
	const runtime = (platform?.env ?? {}) as CloudflareEnvironment;
	const values = {
		CLOUDFLARE_IMAGES_API_TOKEN:
			runtime.CLOUDFLARE_IMAGES_API_TOKEN ?? privateEnv.CLOUDFLARE_IMAGES_API_TOKEN,
		CLOUDFLARE_ACCOUNT_ID: runtime.CLOUDFLARE_ACCOUNT_ID ?? privateEnv.CLOUDFLARE_ACCOUNT_ID,
		CLOUDFLARE_IMAGES_ACCOUNT_HASH:
			runtime.CLOUDFLARE_IMAGES_ACCOUNT_HASH ?? privateEnv.CLOUDFLARE_IMAGES_ACCOUNT_HASH
	};

	if (
		!values.CLOUDFLARE_IMAGES_API_TOKEN ||
		!values.CLOUDFLARE_ACCOUNT_ID ||
		!values.CLOUDFLARE_IMAGES_ACCOUNT_HASH
	) {
		throw error(503, 'Cloudflare Images variables are not configured for this deployment.');
	}

	return values as Required<CloudflareEnvironment>;
}

export async function requireFirebaseUser(request: Request) {
	const authorization = request.headers.get('authorization');
	const idToken = authorization?.match(/^Bearer (.+)$/i)?.[1];
	if (!idToken) throw error(401, 'Sign in before managing images.');

	const response = await fetch(
		'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyAHDC1UF9pWyI8sxiPQQ6MMSRvQY61sW8A',
		{
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ idToken })
		}
	);
	if (!response.ok) throw error(401, 'Your administrator session has expired.');

	const result = (await response.json()) as { users?: Array<{ localId: string; email?: string }> };
	const user = result.users?.[0];
	if (!user) throw error(401, 'Your administrator session is invalid.');

	const administrator = await fetch(
		`https://firestore.googleapis.com/v1/projects/ashleighdarnell/databases/(default)/documents/admins/${encodeURIComponent(user.localId)}`,
		{ headers: { authorization: `Bearer ${idToken}` } }
	);
	if (!administrator.ok) {
		throw error(403, 'This account does not have administrator access.');
	}
	return user;
}

export async function cloudflareRequest<T>(
	event: Pick<RequestEvent, 'platform'>,
	path: string,
	init: RequestInit = {}
) {
	const configuration = cloudflareEnvironment(event.platform);
	const response = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${configuration.CLOUDFLARE_ACCOUNT_ID}${path}`,
		{
			...init,
			headers: {
				authorization: `Bearer ${configuration.CLOUDFLARE_IMAGES_API_TOKEN}`,
				...init.headers
			}
		}
	);
	const payload = (await response.json()) as {
		success: boolean;
		result: T;
		errors?: Array<{ message: string }>;
	};
	if (!response.ok || !payload.success) {
		throw error(
			response.status >= 400 ? response.status : 502,
			payload.errors?.map((item) => item.message).join(', ') || 'Cloudflare Images request failed.'
		);
	}
	return payload.result;
}

export function imageMetadata(setName: string, source: 'upload' | 'url', orientation?: string) {
	return JSON.stringify({
		site: IMAGE_SITE_ID,
		setName: setName.trim() || 'Unsorted',
		source,
		...(orientation ? { orientation } : {})
	});
}

export function imageId(filename: string) {
	const basename =
		filename
			.toLowerCase()
			.replace(/\.[^.]+$/, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '')
			.slice(0, 60) || 'image';
	return `${IMAGE_SITE_ID}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${basename}`;
}
