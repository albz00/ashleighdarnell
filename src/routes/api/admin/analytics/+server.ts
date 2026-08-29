import { env as privateEnv } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import { requireFirebaseUser } from '$lib/server/cloudflare-images';
import type { RequestHandler } from './$types';

const MATOMO_ENDPOINT = 'https://raven-10.hostverna.com/index.php';
const SITE_ID = '8';

type MatomoSummary = {
	nb_visits?: number;
	nb_uniq_visitors?: number;
	nb_actions?: number;
	bounce_rate?: string;
	avg_time_on_site?: number;
};

type MatomoRow = {
	label?: string;
	nb_visits?: number;
	nb_hits?: number;
	nb_actions?: number;
};

function matomoToken(platform: App.Platform | undefined) {
	const runtime = (platform?.env ?? {}) as {
		matomo_api_token?: string;
		MATOMO_API_TOKEN?: string;
		matomo_api_key?: string;
		MATOMO_API_KEY?: string;
	};
	return (
		runtime.matomo_api_token ??
		runtime.MATOMO_API_TOKEN ??
		runtime.matomo_api_key ??
		runtime.MATOMO_API_KEY ??
		privateEnv.matomo_api_token ??
		privateEnv.MATOMO_API_TOKEN ??
		privateEnv.matomo_api_key ??
		privateEnv.MATOMO_API_KEY
	);
}

async function matomoRequest<T>(token: string, entries: Array<[string, string]>) {
	const body = new URLSearchParams({
		module: 'API',
		idSite: SITE_ID,
		format: 'JSON',
		token_auth: token
	});
	entries.forEach(([key, value]) => body.append(key, value));
	const response = await fetch(MATOMO_ENDPOINT, {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body
	});
	const payload = (await response.json()) as T | { result?: string; message?: string };
	const isError =
		typeof payload === 'object' &&
		payload !== null &&
		'result' in payload &&
		payload.result === 'error';
	if (!response.ok || isError) {
		throw new Error((payload as { message?: string }).message || 'Matomo reporting request failed.');
	}
	return payload as T;
}

function report<T>(token: string, method: string, extras: Record<string, string> = {}) {
	return matomoRequest<T>(token, [
		['method', method],
		['period', 'range'],
		['date', 'last30'],
		...Object.entries(extras)
	]);
}

export const GET: RequestHandler = async ({ request, platform }) => {
	await requireFirebaseUser(request);
	const token = matomoToken(platform);
	if (!token) {
		return json({ message: 'The Matomo API token is not configured.' }, { status: 503 });
	}

	try {
		const [summary, pages, referrers] = await Promise.all([
			report<MatomoSummary>(token, 'VisitsSummary.get'),
			report<MatomoRow[]>(token, 'Actions.getPageUrls', {
				flat: '1',
				filter_limit: '5',
				filter_sort_column: 'nb_hits',
				filter_sort_order: 'desc'
			}),
			report<MatomoRow[]>(token, 'Referrers.getAll', {
				filter_limit: '5',
				filter_sort_column: 'nb_visits',
				filter_sort_order: 'desc'
			})
		]);

		return json({
			period: 'Last 30 days',
			summary: {
				visits: Number(summary.nb_visits ?? 0),
				visitors: Number(summary.nb_uniq_visitors ?? 0),
				pageviews: Number(summary.nb_actions ?? 0),
				bounceRate: summary.bounce_rate ?? '0%',
				averageVisitSeconds: Number(summary.avg_time_on_site ?? 0)
			},
			pages: pages.map((page) => ({
				label: page.label || 'Unknown page',
				views: Number(page.nb_hits ?? page.nb_actions ?? 0)
			})),
			referrers: referrers.map((referrer) => ({
				label: referrer.label || 'Direct entry',
				visits: Number(referrer.nb_visits ?? 0)
			}))
		});
	} catch (error) {
		console.error('Matomo analytics request failed.', error);
		return json(
			{ message: 'Analytics could not be loaded from Matomo. Check the API token permissions.' },
			{ status: 502 }
		);
	}
};

export const POST: RequestHandler = async ({ request, platform }) => {
	await requireFirebaseUser(request);
	const token = matomoToken(platform);
	if (!token) {
		return json({ message: 'The Matomo API token is not configured.' }, { status: 503 });
	}

	const body = (await request.json()) as {
		enabled?: boolean;
		email?: string;
		frequency?: string;
		hour?: number;
	};
	const email = body.email?.trim() ?? '';
	const frequency = body.frequency;
	const hour = Number(body.hour);
	if (
		body.enabled !== true ||
		!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
		!['day', 'week', 'month'].includes(frequency ?? '') ||
		!Number.isInteger(hour) ||
		hour < 0 ||
		hour > 23
	) {
		return json({ message: 'Enter a valid report schedule and recipient.' }, { status: 400 });
	}

	try {
		await matomoRequest<number>(token, [
			['method', 'ScheduledReports.addReport'],
			['description', 'Ashleigh website analytics'],
			['period', frequency!],
			['hour', String(hour)],
			['reportType', 'email'],
			['reportFormat', 'html'],
			['reports[]', 'VisitsSummary_get'],
			['reports[]', 'Actions_getPageUrls'],
			['reports[]', 'Referrers_getAll'],
			['parameters[emailMe]', '0'],
			['parameters[additionalEmails][]', email],
			['parameters[displayFormat]', '1'],
			['parameters[evolutionGraph]', '1']
		]);
		return json({ success: true });
	} catch (error) {
		console.error('Matomo scheduled report request failed.', error);
		return json(
			{ message: 'The report could not be scheduled. Check that the Matomo token has view access to site 8.' },
			{ status: 502 }
		);
	}
};
