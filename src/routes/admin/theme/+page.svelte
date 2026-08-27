<script lang="ts">
	import type {
		EffectId,
		EffectIntensity,
		EffectSettings,
		ThemeId
	} from '$lib/content/site';
	import { effectSettings, selectedTheme, themeOptions } from '$lib/content/site';
	import { saveSiteSettings } from '$lib/firebase/repository';

	let preview = $state<ThemeId>($selectedTheme);
	let notice = $state('');
	let activeTab = $state<'themes' | 'effects'>('themes');
	let effectDraft = $state<EffectSettings>({
		...$effectSettings,
		effect: $effectSettings.effect ?? 'auto'
	});

	const effectPreviews: Array<{ id: EffectId; name: string; symbols: string; description: string }> = [
		{ id: 'auto', name: 'Match the theme', symbols: '✦', description: 'Automatically use the effect paired with the current seasonal theme.' },
		{ id: 'none', name: 'No effect', symbols: '—', description: 'Keep the site still, even when a seasonal theme is active.' },
		{ id: 'snow', name: 'Christmas snow', symbols: '❄ ❅ ❆', description: 'Soft snowflakes drift down the page.' },
		{ id: 'pumpkins', name: 'Halloween night', symbols: '🎃 🦇 🎃', description: 'Pumpkins and bats float up through the site.' },
		{ id: 'thanksgiving', name: 'Thanksgiving harvest', symbols: '🦃 🍂 🍁', description: 'Turkeys and autumn leaves fall gently.' },
		{ id: 'easter', name: 'Easter garden', symbols: '🥚 🐇 🌷', description: 'Eggs, rabbits, and tulips softly wander.' },
		{ id: 'hearts', name: 'Valentine hearts', symbols: '♥ ♡ ❤', description: 'Hearts rise across the page.' },
		{ id: 'summer', name: 'Summer citrus', symbols: '☀ ✦ 🍋', description: 'Sunshine and citrus details gently float.' }
	];

	async function applyTheme() {
		try {
			await saveSiteSettings(preview, $effectSettings);
			$selectedTheme = preview;
			notice = 'Theme saved to Firebase and applied across the website.';
		} catch (error) {
			notice = error instanceof Error ? error.message : 'Theme could not be saved.';
		}
	}

	function setIntensity(intensity: EffectIntensity) {
		effectDraft = { ...effectDraft, intensity };
		notice = '';
	}

	async function saveEffects() {
		try {
			await saveSiteSettings($selectedTheme, effectDraft);
			$effectSettings = { ...effectDraft };
			notice = 'Seasonal effects saved to Firebase and applied to the website.';
		} catch (error) {
			notice = error instanceof Error ? error.message : 'Effects could not be saved.';
		}
	}
</script>

<svelte:head><title>Site theme - Website Studio</title></svelte:head>

<div class="mx-auto max-w-6xl">
	<div>
		<h1 class="font-display text-5xl">Site theme</h1>
		<p class="mt-3 max-w-2xl text-muted">
			Choose a complete color story. Typography, spacing, and photographs stay consistent.
		</p>
	</div>

	{#if notice}<p class="mt-6 rounded-2xl bg-butter px-5 py-3 text-sm">{notice}</p>{/if}

	<div class="mt-8 inline-flex rounded-full bg-paper p-1.5">
		<button
			onclick={() => (activeTab = 'themes')}
			class="rounded-full px-6 py-2.5 text-sm {activeTab === 'themes' ? 'bg-ink text-paper' : 'text-muted'}"
		>
			Themes
		</button>
		<button
			onclick={() => (activeTab = 'effects')}
			class="rounded-full px-6 py-2.5 text-sm {activeTab === 'effects' ? 'bg-ink text-paper' : 'text-muted'}"
		>
			Effects
		</button>
	</div>

	{#if activeTab === 'themes'}
		<div class="mt-7 grid gap-5 md:grid-cols-2">
			{#each themeOptions as theme}
				<button
					onclick={() => (preview = theme.id)}
					class="rounded-[2rem] border-2 bg-paper p-6 text-left transition-all {preview === theme.id
						? 'border-coral shadow-lg'
						: 'border-transparent hover:border-line'}"
				>
					<div class="flex items-start justify-between gap-4">
						<div>
							<h2 class="font-display text-3xl">{theme.name}</h2>
							<p class="mt-2 max-w-md text-sm leading-relaxed text-muted">{theme.description}</p>
						</div>
						<span class="grid h-6 w-6 place-items-center rounded-full border border-line text-xs {preview === theme.id ? 'bg-coral text-paper' : ''}">{preview === theme.id ? '✓' : ''}</span>
					</div>
					<div class="mt-6 flex overflow-hidden rounded-full">
						{#each theme.colors as color}
							<span class="h-9 flex-1" style="background-color: {color}"></span>
						{/each}
					</div>
					{#if $selectedTheme === theme.id}
						<p class="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-teal">Current live theme</p>
					{/if}
				</button>
			{/each}
		</div>

		<section class="mt-8 overflow-hidden rounded-[2.5rem] bg-paper shadow-sm" data-theme={preview}>
			<div class="grid md:grid-cols-[0.9fr_1.1fr]">
				<div class="bg-blush p-8 md:p-10">
					<h2 class="font-display text-5xl leading-[0.95]">Wild places,<br /><span class="font-cursive text-coral">good stories.</span></h2>
					<p class="mt-5 max-w-md text-sm leading-relaxed text-muted">See how text, surfaces, accents, and buttons work together before applying a theme.</p>
					<button class="mt-7 rounded-full bg-coral px-6 py-3 text-xs font-semibold text-paper">Sample button</button>
				</div>
				<img src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=82" alt="Mountain landscape preview" class="h-full min-h-72 w-full object-cover" />
			</div>
		</section>

		<div class="sticky bottom-5 mt-8 flex items-center justify-between gap-4 rounded-full bg-ink px-6 py-4 text-paper shadow-xl">
			<p class="text-sm">Previewing <strong>{themeOptions.find((theme) => theme.id === preview)?.name}</strong></p>
			<button onclick={applyTheme} class="rounded-full bg-coral px-6 py-3 text-xs font-semibold text-paper">Apply to website</button>
		</div>
	{:else}
		<section class="mt-7 rounded-[2rem] bg-paper p-6 md:p-8">
			<div class="flex flex-wrap items-center justify-between gap-5">
				<div>
					<h2 class="font-display text-3xl">Seasonal effects</h2>
					<p class="mt-2 max-w-xl text-sm leading-relaxed text-muted">
						Choose an effect independently from the site theme, or let it match automatically.
					</p>
				</div>
				<button
					onclick={() => {
						effectDraft = { ...effectDraft, enabled: !effectDraft.enabled };
						notice = '';
					}}
					class="relative h-8 w-14 rounded-full transition-colors {effectDraft.enabled ? 'bg-teal' : 'bg-line'}"
					aria-label="Toggle seasonal effects"
				>
					<span class="absolute top-1 h-6 w-6 rounded-full bg-paper shadow transition-all {effectDraft.enabled ? 'left-7' : 'left-1'}"></span>
				</button>
			</div>

			<div class="mt-8 border-t border-line pt-7">
				<p class="text-sm font-semibold">Effect intensity</p>
				<div class="mt-3 flex flex-wrap gap-2">
					{#each [
						{ id: 'subtle' as const, label: 'Subtle' },
						{ id: 'medium' as const, label: 'Medium' },
						{ id: 'celebration' as const, label: 'Celebration' }
					] as intensity}
						<button
							onclick={() => setIntensity(intensity.id)}
							class="rounded-full px-5 py-2.5 text-sm {effectDraft.intensity === intensity.id
								? 'bg-ink text-paper'
								: 'bg-mist text-muted'}"
						>
							{intensity.label}
						</button>
					{/each}
				</div>
			</div>
		</section>

		<div class="mt-5 grid gap-4 md:grid-cols-2">
			{#each effectPreviews as item}
				<button
					onclick={() => {
						effectDraft = { ...effectDraft, effect: item.id };
						notice = '';
					}}
					class="rounded-[2rem] border bg-paper p-6 text-left transition-all {effectDraft.effect === item.id
						? 'border-coral ring-2 ring-coral'
						: 'border-line hover:border-ink/25'}"
				>
					<div class="flex items-start justify-between gap-4">
						<div>
							<h3 class="font-display text-2xl">{item.name}</h3>
							<p class="mt-2 text-sm text-muted">{item.description}</p>
						</div>
						<div class="whitespace-nowrap rounded-2xl bg-mist px-4 py-3 text-xl">{item.symbols}</div>
					</div>
					<p class="mt-5 text-xs {effectDraft.effect === item.id ? 'font-semibold text-coral' : 'text-muted'}">
						{effectDraft.effect === item.id ? 'Selected — save to apply' : 'Select effect'}
					</p>
				</button>
			{/each}
		</div>

		<div class="mt-6 rounded-2xl bg-butter px-5 py-4 text-sm text-ink/70">
			Visitors who prefer reduced motion will not see animated effects.
		</div>

		<div class="sticky bottom-5 mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-ink px-6 py-4 text-paper shadow-xl">
			<p class="text-sm text-paper/65">Changes do not go live until you save them.</p>
			<button onclick={saveEffects} class="rounded-full bg-coral px-7 py-3 text-xs font-semibold text-paper">
				Save effects
			</button>
		</div>
	{/if}
</div>
