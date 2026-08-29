<script lang="ts">
	import { enhance } from '$app/forms';
	import Reveal from '$lib/components/Reveal.svelte';
	import { pageContent } from '$lib/content/page-content';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
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
				use:enhance={() => {
					submitting = true;
					return async ({ result, update }) => {
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

				<label class="block">
					<span class="text-[11px] uppercase tracking-[0.2em] text-muted">{contact.interestLabel}</span>
					<select
						name="interest"
						required
						class="mt-2 w-full rounded-2xl border border-line bg-mist/60 px-4 py-3 outline-none transition-all duration-200 focus:border-coral focus:bg-paper focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-coral)_18%,transparent)]"
					>
						{#each contact.interestOptions as option}
							<option selected={form?.values?.interest === option}>{option}</option>
						{/each}
					</select>
				</label>

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

				<button
					type="submit"
					disabled={submitting}
					class="btn-fun inline-flex items-center gap-2 rounded-full border border-violet bg-violet px-9 py-4 text-[12px] uppercase tracking-[0.2em] text-paper hover:border-ink hover:bg-ink"
				>
					{submitting ? 'Sending…' : contact.sendButton}
				</button>
				{#if form?.success || form?.message}
					<p
						class:text-coral={form?.success}
						class="text-xs text-muted"
						aria-live="polite"
					>
						{form.success ? 'Thanks! Your message has been sent.' : form.message}
					</p>
				{/if}
			</form>
		</Reveal>
	</div>
</section>
