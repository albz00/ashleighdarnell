import { json } from '@sveltejs/kit';
import {
	IMAGE_SITE_ID,
	cloudflareEnvironment,
	cloudflareRequest,
	imageId,
	imageMetadata,
	requireFirebaseUser,
	type CloudflareImage
} from '$lib/server/cloudflare-images';
import type { RequestHandler } from './$types';

type ImageList = {
	images?: CloudflareImage[];
	continuation_token?: string;
};

export const GET: RequestHandler = async ({ request, platform }) => {
	await requireFirebaseUser(request);
	const parameters = new URLSearchParams({
		'meta.site[eq:string]': IMAGE_SITE_ID,
		per_page: '1000'
	});
	const result = await cloudflareRequest<ImageList>(
		{ platform },
		`/images/v2?${parameters.toString()}`
	);
	const configuration = cloudflareEnvironment(platform);

	return json({
		images: result.images ?? [],
		accountHash: configuration.CLOUDFLARE_IMAGES_ACCOUNT_HASH,
		hasMore: Boolean(result.continuation_token)
	});
};

export const POST: RequestHandler = async ({ request, platform }) => {
	const user = await requireFirebaseUser(request);
	const body = (await request.json()) as {
		action?: 'direct-upload' | 'import-url';
		filename?: string;
		url?: string;
		setName?: string;
		orientation?: string;
	};
	const setName = body.setName?.trim() || 'Unsorted';

	if (body.action === 'direct-upload') {
		const filename = body.filename?.trim() || 'image';
		const form = new FormData();
		form.set('id', imageId(filename));
		form.set('creator', user.localId);
		form.set('requireSignedURLs', 'false');
		form.set('metadata', imageMetadata(setName, 'upload', body.orientation));
		const result = await cloudflareRequest<{ id: string; uploadURL: string }>(
			{ platform },
			'/images/v2/direct_upload',
			{ method: 'POST', body: form }
		);
		return json(result);
	}

	if (body.action === 'import-url') {
		let source: URL;
		try {
			source = new URL(body.url ?? '');
		} catch {
			return json({ message: 'Enter a valid image URL.' }, { status: 400 });
		}
		if (!['http:', 'https:'].includes(source.protocol)) {
			return json({ message: 'Only HTTP and HTTPS image URLs are supported.' }, { status: 400 });
		}

		const filename = source.pathname.split('/').at(-1) || 'imported-image';
		const form = new FormData();
		form.set('url', source.toString());
		form.set('id', imageId(filename));
		form.set('requireSignedURLs', 'false');
		form.set('metadata', imageMetadata(setName, 'url'));
		const result = await cloudflareRequest<CloudflareImage>({ platform }, '/images/v1', {
			method: 'POST',
			body: form
		});
		return json(result);
	}

	return json({ message: 'Unsupported image action.' }, { status: 400 });
};

export const DELETE: RequestHandler = async ({ request, platform, url }) => {
	await requireFirebaseUser(request);
	const setName = url.searchParams.get('set');
	if (setName) {
		if (setName === 'All sets' || setName.length > 120) {
			return json({ message: 'Choose one valid image set to delete.' }, { status: 400 });
		}

		let deleted = 0;
		for (let pass = 0; pass < 20; pass += 1) {
			const parameters = new URLSearchParams({
				'meta.site[eq:string]': IMAGE_SITE_ID,
				'meta.setName[eq:string]': setName,
				per_page: '1000'
			});
			const result = await cloudflareRequest<ImageList>(
				{ platform },
				`/images/v2?${parameters.toString()}`
			);
			const images = result.images ?? [];
			if (!images.length) break;

			for (let index = 0; index < images.length; index += 10) {
				await Promise.all(
					images.slice(index, index + 10).map((image) =>
						cloudflareRequest(
							{ platform },
							`/images/v1/${encodeURIComponent(image.id)}`,
							{ method: 'DELETE' }
						)
					)
				);
			}
			deleted += images.length;
		}
		return json({ success: true, deleted });
	}

	const imageId = url.searchParams.get('id');
	if (!imageId?.startsWith(`${IMAGE_SITE_ID}/`)) {
		return json({ message: 'This image does not belong to the site archive.' }, { status: 400 });
	}
	await cloudflareRequest({ platform }, `/images/v1/${encodeURIComponent(imageId)}`, {
		method: 'DELETE'
	});
	return json({ success: true });
};
