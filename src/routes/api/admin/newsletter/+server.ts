import { env as privateEnv } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import { requireFirebaseUser } from '$lib/server/cloudflare-images';
import type { RequestHandler } from './$types';

const RESEND_BATCH_ENDPOINT = 'https://api.resend.com/emails/batch';
const FROM_EMAIL = 'Ashleigh Darnell <info@ashleighdarnell.com>';
const REPLY_EMAIL = 'info@ashleighdarnell.com';

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

export const POST: RequestHandler = async ({ request, platform }) => {
	await requireFirebaseUser(request);
	const body = (await request.json()) as {
		subject?: string;
		preview?: string;
		message?: string;
		recipients?: unknown[];
	};
	const subject = body.subject?.trim() ?? '';
	const preview = body.preview?.trim() ?? '';
	const message = body.message?.trim() ?? '';
	const recipients = [
		...new Set(
			(body.recipients ?? [])
				.filter((recipient): recipient is string => typeof recipient === 'string')
				.map((recipient) => recipient.trim().toLowerCase())
				.filter((recipient) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient))
		)
	].slice(0, 500);

	if (!subject || subject.length > 200 || !message || message.length > 20_000) {
		return json({ message: 'Add a valid subject and message before sending.' }, { status: 400 });
	}
	if (!recipients.length) {
		return json({ message: 'There are no active newsletter readers to contact.' }, { status: 400 });
	}

	const apiKey =
		(platform?.env as { resend_api_key?: string } | undefined)?.resend_api_key ??
		privateEnv.resend_api_key;
	if (!apiKey) {
		return json({ message: 'The newsletter email service is not configured.' }, { status: 503 });
	}

	const messageHtml = escapeHtml(message).replaceAll('\n', '<br />');
	const previewHtml = escapeHtml(preview);
	let sent = 0;

	for (let index = 0; index < recipients.length; index += 100) {
		const batch = recipients.slice(index, index + 100).map((recipient) => ({
			from: FROM_EMAIL,
			to: [recipient],
			reply_to: REPLY_EMAIL,
			subject,
			text: `${message}\n\n—\nYou are receiving this because you joined Ashleigh Darnell’s newsletter. Reply “unsubscribe” to leave the list.`,
			html: `<div style="display:none;max-height:0;overflow:hidden">${previewHtml}</div><div style="font-family:Arial,sans-serif;line-height:1.7;color:#1e3b2f;max-width:640px;margin:auto">${messageHtml}<hr style="margin:32px 0;border:0;border-top:1px solid #d9e4da"><p style="font-size:12px;color:#5c7267">You are receiving this because you joined Ashleigh Darnell’s newsletter. Reply “unsubscribe” to leave the list.</p></div>`,
			headers: {
				'List-Unsubscribe': `<mailto:${REPLY_EMAIL}?subject=unsubscribe>`
			}
		}));
		const response = await fetch(RESEND_BATCH_ENDPOINT, {
			method: 'POST',
			headers: {
				authorization: `Bearer ${apiKey}`,
				'content-type': 'application/json'
			},
			body: JSON.stringify(batch)
		});

		if (!response.ok) {
			console.error('Resend rejected a newsletter batch.', response.status, await response.text());
			return json(
				{
					message: sent
						? `${sent} emails were sent before the remaining batch failed. Do not resend the campaign without checking delivery first.`
						: 'The newsletter could not be sent. Please try again in a moment.',
					sent
				},
				{ status: 502 }
			);
		}
		sent += batch.length;
	}

	return json({ sent });
};
