<script lang="ts">
	import type { BannerTone, SiteBanner } from '$lib/content/site';
	import { banners, newId } from '$lib/content/site';
	import { deleteBanner, saveBanners } from '$lib/firebase/repository';

	const tones: BannerTone[] = ['coral', 'teal', 'violet', 'marigold'];
	let editing = $state<SiteBanner | null>(null);
	let notice = $state('');

	function createBanner() {
		editing = {
			id: newId('banner'),
			message: '',
			linkLabel: 'Learn more',
			link: '/',
			tone: 'coral',
			active: false
		};
	}

	async function save() {
		if (!editing?.message.trim()) {
			notice = 'Add an announcement message first.';
			return;
		}
		const exists = $banners.some((banner) => banner.id === editing?.id);
		let next = exists
			? $banners.map((banner) => (banner.id === editing?.id ? { ...editing } as SiteBanner : banner))
			: [{ ...editing }, ...$banners];
		if (editing.active) next = next.map((banner) => ({ ...banner, active: banner.id === editing?.id }));
		try {
			await saveBanners(next);
			$banners = next;
			editing = null;
			notice = 'Banner saved to Firebase.';
		} catch (error) {
			notice = error instanceof Error ? error.message : 'Banner could not be saved.';
		}
	}

	async function activate(id: string) {
		const next = $banners.map((banner) => ({
			...banner,
			active: banner.id === id ? !banner.active : false
		}));
		try {
			await saveBanners(next);
			$banners = next;
			notice = next.find((banner) => banner.active)
				? 'The selected banner is now live from Firebase.'
				: 'All banners are now hidden.';
		} catch (error) {
			notice = error instanceof Error ? error.message : 'Banner status could not be saved.';
		}
	}

	async function remove(id: string) {
		if (!window.confirm('Delete this banner?')) return;
		try {
			await deleteBanner(id);
			$banners = $banners.filter((item) => item.id !== id);
			notice = 'Banner deleted from Firebase.';
		} catch (error) {
			notice = error instanceof Error ? error.message : 'Banner could not be deleted.';
		}
	}
</script>

<svelte:head><title>Banners - Website Studio</title></svelte:head>

<div class="mx-auto max-w-6xl">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="font-display text-5xl">Site banners</h1>
			<p class="mt-3 text-muted">Promote an update across the top of every public page.</p>
		</div>
		<button onclick={createBanner} class="btn-fun rounded-full bg-violet px-6 py-3 text-sm font-semibold text-paper">+ New banner</button>
	</div>

	{#if notice}<p class="mt-6 rounded-2xl bg-butter px-5 py-3 text-sm">{notice}</p>{/if}

	<div class="mt-8 space-y-5">
		{#each $banners as banner (banner.id)}
			<article class="rounded-[2rem] bg-paper p-6 md:p-8">
				<div class="banner-{banner.tone} rounded-2xl px-6 py-4 text-center text-sm font-semibold">
					{banner.message}
					{#if banner.linkLabel}<span class="ml-2 underline underline-offset-4">{banner.linkLabel}</span>{/if}
				</div>
				<div class="mt-5 flex flex-wrap items-center justify-between gap-4">
					<div>
						<p class="text-sm font-semibold">{banner.active ? 'Live on the website' : 'Not visible'}</p>
						<p class="mt-1 text-xs text-muted">Links to {banner.link}</p>
					</div>
					<div class="flex gap-2">
						<button onclick={() => activate(banner.id)} class="rounded-full px-5 py-2.5 text-xs font-semibold {banner.active ? 'bg-mint text-teal' : 'bg-ink text-paper'}">
							{banner.active ? 'Turn off' : 'Make live'}
						</button>
						<button onclick={() => (editing = { ...banner })} class="rounded-full border border-line px-5 py-2.5 text-xs">Edit</button>
						<button onclick={() => remove(banner.id)} class="rounded-full px-3 py-2 text-xs text-coral">Delete</button>
					</div>
				</div>
			</article>
		{/each}
	</div>
</div>

{#if editing}
	<div class="fixed inset-0 z-50 overflow-y-auto bg-ink/55 p-4 md:p-8">
		<div class="mx-auto max-w-xl rounded-[2rem] bg-paper p-6 shadow-2xl md:p-9">
			<div class="flex items-center justify-between">
				<h2 class="font-display text-3xl">Banner details</h2>
				<button onclick={() => (editing = null)} class="grid h-10 w-10 place-items-center rounded-full bg-mist text-xl">×</button>
			</div>
			<div class="mt-7 space-y-5">
				<label class="block"><span class="text-xs font-semibold">Message</span><input bind:value={editing.message} class="mt-2 w-full rounded-2xl border border-line bg-mist px-4 py-3 outline-none focus:border-violet" /></label>
				<div class="grid gap-5 sm:grid-cols-2">
					<label class="block"><span class="text-xs font-semibold">Link label</span><input bind:value={editing.linkLabel} class="mt-2 w-full rounded-2xl border border-line bg-mist px-4 py-3 outline-none focus:border-violet" /></label>
					<label class="block"><span class="text-xs font-semibold">Link destination</span><input bind:value={editing.link} class="mt-2 w-full rounded-2xl border border-line bg-mist px-4 py-3 outline-none focus:border-violet" /></label>
				</div>
				<div>
					<p class="text-xs font-semibold">Color</p>
					<div class="mt-3 flex gap-3">
						{#each tones as tone}
							<button onclick={() => { if (editing) editing.tone = tone; }} class="banner-{tone} h-10 w-10 rounded-full ring-offset-2 ring-offset-paper {editing.tone === tone ? 'ring-2 ring-ink' : ''}" aria-label="{tone} banner"></button>
						{/each}
					</div>
				</div>
				<label class="flex items-center gap-3 rounded-2xl bg-mist p-4"><input type="checkbox" bind:checked={editing.active} class="accent-violet" /><span class="text-sm">Make this the active website banner</span></label>
			</div>
			<div class="mt-7 flex justify-end"><button onclick={save} class="rounded-full bg-violet px-6 py-3 text-sm font-semibold text-paper">Save banner</button></div>
		</div>
	</div>
{/if}
