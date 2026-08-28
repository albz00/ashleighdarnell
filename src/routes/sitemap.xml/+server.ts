import { publicPaths } from '$lib/content/navigation';
import type { RequestHandler } from './$types';

function escapeXml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

async function publishedPosts() {
	try {
		const response = await fetch(
			'https://firestore.googleapis.com/v1/projects/ashleighdarnell/databases/(default)/documents:runQuery?key=AIzaSyAHDC1UF9pWyI8sxiPQQ6MMSRvQY61sW8A',
			{
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					structuredQuery: {
						from: [{ collectionId: 'posts' }],
						where: {
							fieldFilter: {
								field: { fieldPath: 'status' },
								op: 'EQUAL',
								value: { stringValue: 'published' }
							}
						}
					}
				})
			}
		);
		if (!response.ok) return [];
		const rows = (await response.json()) as Array<{
			document?: {
				updateTime?: string;
				fields?: {
					slug?: { stringValue?: string };
					publishedAt?: { stringValue?: string };
				};
			};
		}>;
		return rows.flatMap((row) => {
			const slug = row.document?.fields?.slug?.stringValue;
			if (!slug) return [];
			return [
				{
					path: `/blog/${encodeURIComponent(slug)}`,
					lastModified:
						row.document?.updateTime ?? row.document?.fields?.publishedAt?.stringValue
				}
			];
		});
	} catch {
		return [];
	}
}

export const GET: RequestHandler = async ({ url }) => {
	const posts = await publishedPosts();
	const entries = [
		...publicPaths.map((path) => ({ path, lastModified: undefined as string | undefined })),
		...posts
	]
		.map(
			(entry) => `  <url>
    <loc>${escapeXml(new URL(entry.path, url.origin).href)}</loc>${
			entry.lastModified ? `\n    <lastmod>${escapeXml(entry.lastModified)}</lastmod>` : ''
		}
  </url>`
		)
		.join('\n');

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`,
		{
			headers: {
				'content-type': 'application/xml; charset=utf-8',
				'cache-control': 'public, max-age=300, s-maxage=3600'
			}
		}
	);
};
