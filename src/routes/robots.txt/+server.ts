import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	return new Response(
		`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: ${new URL('/sitemap.xml', url.origin).href}
`,
		{
			headers: {
				'content-type': 'text/plain; charset=utf-8',
				'cache-control': 'public, max-age=3600'
			}
		}
	);
};
