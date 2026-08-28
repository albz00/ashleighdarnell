import { siteNavigation } from '$lib/content/navigation';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	const origin = url.origin;
	const pages = [
		`- [Home](${origin}/): Portfolio introduction and featured work`,
		...siteNavigation.map((item) => `- [${item.label}](${origin}${item.href})`)
	].join('\n');

	return new Response(
		`# Ashleigh Darnell

> Photography and creative storytelling by Ashleigh Darnell, based in Nashville, Tennessee, with roots in West Virginia.

## Main pages

${pages}

## Site information

- [Sitemap](${origin}/sitemap.xml): Index of public pages and published posts
- Administrative pages and private audience data are not public resources.
`,
		{
			headers: {
				'content-type': 'text/plain; charset=utf-8',
				'cache-control': 'public, max-age=3600'
			}
		}
	);
};
