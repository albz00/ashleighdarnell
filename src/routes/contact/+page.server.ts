import { env as privateEnv } from '$env/dynamic/private';
import { fail } from '@sveltejs/kit';
import { loadContactFields } from '$lib/server/contact-fields';
import type { Actions } from './$types';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const FROM_EMAIL = 'info@hostverna.co';
const TO_EMAIL = 'alzimmr1@gmail.com';

type ContactValues = {
	name: string;
	email: string;
	message: string;
};

function formValues(formData: FormData): ContactValues {
	return {
		name: String(formData.get('name') ?? '').trim(),
		email: String(formData.get('email') ?? '').trim(),
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

		const fields = await loadContactFields();
		const customValues = Object.fromEntries(
			fields.map((field) => [
				field.id,
				String(formData.get(`field:${field.id}`) ?? '').trim()
			])
		);
		const invalidCustomField = fields.some((field) => {
			const value = customValues[field.id];
			if (field.required && !value) return true;
			if (!value) return false;
			if (field.type === 'select' && !field.options.includes(value)) return true;
			if (field.type === 'checkbox' && value !== 'yes') return true;
			const maximum = field.type === 'textarea' ? 5000 : field.type === 'phone' ? 40 : 500;
			return value.length > maximum;
		});

		if (
			!values.name ||
			values.name.length > 120 ||
			!values.email ||
			values.email.length > 254 ||
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ||
			!values.message ||
			values.message.length > 5000 ||
			invalidCustomField
		) {
			return fail(400, {
				message: 'Please complete every field with valid information.',
				values,
				customValues
			});
		}

		const apiKey =
			(platform?.env as { resend_api_key?: string } | undefined)?.resend_api_key ??
			privateEnv.resend_api_key;
		if (!apiKey) {
			console.error('The resend_api_key secret is not configured.');
			return fail(503, {
				message: 'The contact form is temporarily unavailable. Please try again later.',
				values,
				customValues
			});
		}

		const customLines = fields.map((field) => {
			const value = customValues[field.id];
			return `${field.label}: ${
				field.type === 'checkbox' ? (value === 'yes' ? 'Yes' : 'No') : value || 'Not provided'
			}`;
		});
		const interest = customValues.interest;
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
				subject: `Website inquiry from ${values.name}${interest ? `: ${interest}` : ''}`,
				text: [
					`Name: ${values.name}`,
					`Email: ${values.email}`,
					...customLines,
					'',
					values.message
				].join('\n')
			})
		});

		if (!response.ok) {
			console.error('Resend rejected a contact form email.', response.status, await response.text());
			return fail(502, {
				message: 'Your message could not be sent. Please try again in a moment.',
				values,
				customValues
			});
		}

		return { success: true };
	}
};
