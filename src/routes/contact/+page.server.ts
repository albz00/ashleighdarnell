import { env as privateEnv } from '$env/dynamic/private';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const FROM_EMAIL = 'info@hostverna.co';
const TO_EMAIL = 'alzimmr1@gmail.com';

type ContactValues = {
	name: string;
	email: string;
	interest: string;
	message: string;
};

function formValues(formData: FormData): ContactValues {
	return {
		name: String(formData.get('name') ?? '').trim(),
		email: String(formData.get('email') ?? '').trim(),
		interest: String(formData.get('interest') ?? '').trim(),
		message: String(formData.get('message') ?? '').trim()
	};
}

export const actions: Actions = {
	default: async ({ request, platform }) => {
		const formData = await request.formData();
		const values = formValues(formData);

		// Silently accept submissions filled by bots.
		if (String(formData.get('website') ?? '').trim()) {
			return { success: true };
		}

		if (
			!values.name ||
			values.name.length > 120 ||
			!values.email ||
			values.email.length > 254 ||
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ||
			!values.interest ||
			values.interest.length > 120 ||
			!values.message ||
			values.message.length > 5000
		) {
			return fail(400, {
				message: 'Please complete every field with valid information.',
				values
			});
		}

		const apiKey =
			(platform?.env as { resend_api_key?: string } | undefined)?.resend_api_key ??
			privateEnv.resend_api_key;
		if (!apiKey) {
			console.error('The resend_api_key secret is not configured.');
			return fail(503, {
				message: 'The contact form is temporarily unavailable. Please try again later.',
				values
			});
		}

		const response = await fetch(RESEND_ENDPOINT, {
			method: 'POST',
			headers: {
				authorization: `Bearer ${apiKey}`,
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				from: FROM_EMAIL,
				to: [TO_EMAIL],
				reply_to: values.email,
				subject: `Website inquiry from ${values.name}: ${values.interest}`,
				text: [
					`Name: ${values.name}`,
					`Email: ${values.email}`,
					`Interest: ${values.interest}`,
					'',
					values.message
				].join('\n')
			})
		});

		if (!response.ok) {
			console.error('Resend rejected a contact form email.', response.status, await response.text());
			return fail(502, {
				message: 'Your message could not be sent. Please try again in a moment.',
				values
			});
		}

		return { success: true };
	}
};
