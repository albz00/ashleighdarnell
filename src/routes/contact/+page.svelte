<script lang="ts">
	import { enhance } from '$app/forms';
	import Reveal from '$lib/components/Reveal.svelte';
	import { pageContent } from '$lib/content/page-content';
	import { subscribeToNewsletter } from '$lib/firebase/repository';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
	let newsletterMessage = $state('');
	const contact = $derived($pageContent.contact);
</script>

<svelte:head>
	<title>{contact.seoTitle}</title>
</svelte:head>

<section class="bg-paper" data-content-section="contact.main" data-content-label="Contact → Page & form">
	<div
		class="mx-auto grid max-w-6xl gap-16 px-5 pt-20 pb-24 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:pt-28 md:pb-32"
	>
		<Reveal>
			<div>
				<h1 class="page-display font-display">
					{contact.titleBefore} <span class="font-cursive text-[1.4em] leading-none text-coral">{contact.titleAccent}</span> {contact.titleAfter}
				</h1>
				<p class="mt-6 max-w-sm leading-relaxed text-muted">
					{contact.intro}
				</p>

				<div class="mt-10 space-y-3 border-t border-line pt-6 text-sm text-muted">
					<p><a href="mailto:{contact.email}">{contact.email}</a></p>
					<p>{contact.locations}</p>
				</div>
			</div>
		</Reveal>

		<Reveal delay={120}>
			<form
				method="POST"
				class="space-y-6 rounded-[2.5rem] bg-mist p-6 md:p-8"
				data-content-section="contact.form"
				data-content-label="Contact → Inquiry form"
				use:enhance={({ formData }) => {
					const newsletterConsent = formData.get('newsletterConsent') === 'yes';
					const subscriberName = String(formData.get('name') ?? '');
					const subscriberEmail = String(formData.get('email') ?? '');
					submitting = true;
					return async ({ result, update }) => {
						newsletterMessage = '';
						if (result.type === 'success' && newsletterConsent) {
							try {
								await subscribeToNewsletter(
									subscriberName,
									subscriberEmail,
									'contact-form'
								);
								newsletterMessage = 'You’ve also been added to the newsletter.';
							} catch (error: unknown) {
								const code =
									error && typeof error === 'object' && 'code' in error
										? String(error.code)
										: '';
								newsletterMessage =
									code === 'permission-denied'
										? 'You’re already on the newsletter list.'
										: 'Your message was sent, but the newsletter signup could not be completed.';
							}
						}
						await update({ reset: result.type === 'success' });
						submitting = false;
					};
				}}
			>
				<label class="hidden" aria-hidden="true">
					Website
					<input name="website" tabindex="-1" autocomplete="off" />
				</label>
				<div class="grid gap-6 sm:grid-cols-2">
					<label class="block">
						<span class="text-[11px] uppercase tracking-[0.2em] text-muted">{contact.nameLabel}</span>
						<input
							type="text"
							name="name"
							required
							maxlength="120"
							autocomplete="name"
							value={form?.values?.name ?? ''}
							class="mt-2 w-full rounded-2xl border border-line bg-mist/60 px-4 py-3 outline-none transition-all duration-200 focus:border-coral focus:bg-paper focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-coral)_18%,transparent)]"
							placeholder={contact.namePlaceholder}
						/>
					</label>
					<label class="block">
						<span class="text-[11px] uppercase tracking-[0.2em] text-muted">{contact.emailLabel}</span>
						<input
							type="email"
							name="email"
							required
							maxlength="254"
							autocomplete="email"
							value={form?.values?.email ?? ''}
							class="mt-2 w-full rounded-2xl border border-line bg-mist/60 px-4 py-3 outline-none transition-all duration-200 focus:border-coral focus:bg-paper focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-coral)_18%,transparent)]"
							placeholder={contact.emailPlaceholder}
						/>
					</label>
				</div>

				{#each contact.fields as field (field.id)}
					{#if field.type === 'checkbox'}
						<label class="flex cursor-pointer items-start gap-3 rounded-2xl bg-paper/70 px-4 py-3.5">
							<input
								type="checkbox"
								name="field:{field.id}"
								value="yes"
								required={field.required}
								checked={form?.customValues?.[field.id] === 'yes'}
								class="mt-0.5 h-4 w-4 shrink-0 accent-coral"
							/>
							<span class="text-sm leading-relaxed text-muted">
								{field.label}{field.required ? ' *' : ''}
							</span>
						</label>
					{:else}
						<label class="block">
							<span class="text-[11px] uppercase tracking-[0.2em] text-muted">
								{field.label}{field.required ? ' *' : ''}
							</span>
							{#if field.type === 'select'}
								<select
									name="field:{field.id}"
									required={field.required}
									class="mt-2 w-full rounded-2xl border border-line bg-mist/60 px-4 py-3 outline-none transition-all duration-200 focus:border-coral focus:bg-paper focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-coral)_18%,transparent)]"
								>
									{#if !field.required}
										<option value="">Choose an option</option>
									{/if}
									{#each field.options as option}
										<option
											value={option}
											selected={form?.customValues?.[field.id] === option}
										>{option}</option>
									{/each}
								</select>
							{:else if field.type === 'textarea'}
								<textarea
									name="field:{field.id}"
									required={field.required}
									maxlength="5000"
									rows="4"
									placeholder={field.placeholder}
									class="mt-2 w-full resize-y rounded-2xl border border-line bg-mist/60 px-4 py-3 outline-none transition-all duration-200 focus:border-coral focus:bg-paper focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-coral)_18%,transparent)]"
								>{form?.customValues?.[field.id] ?? ''}</textarea>
							{:else}
								<input
									type={field.type === 'phone' ? 'tel' : 'text'}
									name="field:{field.id}"
									required={field.required}
									maxlength={field.type === 'phone' ? 40 : 500}
									autocomplete={field.type === 'phone' ? 'tel' : 'off'}
									inputmode={field.type === 'phone' ? 'tel' : undefined}
									value={form?.customValues?.[field.id] ?? ''}
									placeholder={field.placeholder}
									class="mt-2 w-full rounded-2xl border border-line bg-mist/60 px-4 py-3 outline-none transition-all duration-200 focus:border-coral focus:bg-paper focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-coral)_18%,transparent)]"
								/>
							{/if}
						</label>
					{/if}
				{/each}

				<label class="block">
					<span class="text-[11px] uppercase tracking-[0.2em] text-muted">{contact.messageLabel}</span>
					<textarea
						name="message"
						required
						maxlength="5000"
						rows="5"
						class="mt-2 w-full resize-none rounded-2xl border border-line bg-mist/60 px-4 py-3 outline-none transition-all duration-200 focus:border-coral focus:bg-paper focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-coral)_18%,transparent)]"
						placeholder={contact.messagePlaceholder}
					>{form?.values?.message ?? ''}</textarea>
				</label>

				<label class="flex cursor-pointer items-start gap-3 rounded-2xl bg-paper/70 px-4 py-3.5">
					<input
						type="checkbox"
						name="newsletterConsent"
						value="yes"
						class="mt-0.5 h-4 w-4 shrink-0 accent-coral"
					/>
					<span class="text-sm leading-relaxed text-muted">
						Yes, I’d like to receive occasional stories, photographs, and creative updates by email.
					</span>
				</label>

				<button
					type="submit"
					disabled={submitting}
					class="btn-fun inline-flex items-center gap-2 rounded-full border border-violet bg-violet px-9 py-4 text-[12px] uppercase tracking-[0.2em] text-paper hover:border-ink hover:bg-ink"
				>
					{submitting ? 'Sending…' : contact.sendButton}
				</button>
				{#if form?.success || form?.message || newsletterMessage}
					<p
						class:text-coral={form?.success}
						class="text-xs text-muted"
						aria-live="polite"
					>
						{form?.success ? 'Thanks! Your message has been sent.' : form?.message}
						{#if newsletterMessage}
							<span class="mt-1 block">{newsletterMessage}</span>
						{/if}
					</p>
				{/if}
			</form>
		</Reveal>
	</div>
</section>
