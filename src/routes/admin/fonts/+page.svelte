<script lang="ts">
	import {
		cursorSettings,
		effectSettings,
		fontPairOptions,
		fontSettings,
		selectedTheme,
		type FontPairId
	} from '$lib/content/site';
	import { saveSiteSettings } from '$lib/firebase/repository';

	let selected = $state<FontPairId>($fontSettings.pair);
	let saving = $state(false);
	let notice = $state('');

	async function saveFonts() {
		saving = true;
		notice = '';
		try {
			await saveSiteSettings($selectedTheme, $effectSettings, $cursorSettings, {
				pair: selected
			});
			$fontSettings = { pair: selected };
			notice = 'Font pairing saved and applied across the website.';
		} catch (error) {
			notice = error instanceof Error ? error.message : 'The font pairing could not be saved.';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head><title>Fonts - Website Studio</title></svelte:head>

<div class="mx-auto max-w-6xl">
	<div class="flex flex-wrap items-end justify-between gap-5">
		<div>
			<h1 class="font-display text-5xl">Fonts</h1>
			<p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
				Choose a complete photography and marketing font pairing for headlines, body copy, and handwritten accents.
			</p>
		</div>
		<button
			type="button"
			onclick={saveFonts}
			disabled={saving || selected === $fontSettings.pair}
			class="rounded-full bg-coral px-7 py-3.5 text-xs font-semibold text-paper disabled:opacity-40"
		>
			{saving ? 'Saving…' : 'Save fonts'}
		</button>
	</div>

	{#if notice}
		<p class="mt-6 rounded-2xl bg-butter px-5 py-3 text-sm">{notice}</p>
	{/if}

	<div class="mt-8 grid gap-5 lg:grid-cols-2">
		{#each fontPairOptions as pairing}
			<button
				type="button"
				onclick={() => {
					selected = pairing.id;
					notice = '';
				}}
				data-font-pair={pairing.id}
				class="rounded-[2rem] border-2 bg-paper p-6 text-left transition-all {selected === pairing.id ? 'border-coral shadow-lg' : 'border-transparent hover:border-line'}"
			>
				<div class="flex items-start justify-between gap-4">
					<div>
						<h2 class="text-xl font-semibold">{pairing.name}</h2>
						<p class="font-display mt-4 text-4xl leading-none">Stories worth remembering</p>
						<p class="font-cursive mt-2 text-4xl leading-none text-coral">Behind the lens</p>
					</div>
					<span class="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-xs {selected === pairing.id ? 'bg-coral text-paper' : ''}">
						{selected === pairing.id ? '✓' : ''}
					</span>
				</div>
				<p class="mt-6 text-sm leading-relaxed text-muted">{pairing.description}</p>
				<div class="mt-5 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
					<span class="rounded-full bg-mist px-3 py-1.5">{pairing.display}</span>
					<span class="rounded-full bg-mist px-3 py-1.5">{pairing.body}</span>
					<span class="rounded-full bg-mist px-3 py-1.5">{pairing.script}</span>
				</div>
				{#if $fontSettings.pair === pairing.id}
					<p class="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-teal">Current live pairing</p>
				{/if}
			</button>
		{/each}
	</div>
</div>
