<script lang="ts">
	import { getIdToken } from 'firebase/auth';
	import { auth } from '$lib/firebase/client';

	type ArchiveImage = {
		id: string;
		filename: string;
		uploaded: string;
		meta?: { setName?: string; source?: string; orientation?: string };
		variants: string[];
	};

	let {
		value,
		onselect
	}: {
		value: string;
		onselect: (value: string, image?: ArchiveImage) => void;
	} = $props();

	let mode = $state<'link' | 'library'>('link');
	let initialized = $state(false);
	let open = $state(false);
	let loading = $state(false);
	let errorMessage = $state('');
	let images = $state<ArchiveImage[]>([]);
	let accountHash = $state('');
	let selectedSet = $state('All sets');

	const sets = $derived([
		'All sets',
		...Array.from(new Set(images.map((image) => image.meta?.setName || 'Unsorted'))).sort()
	]);
	const visibleImages = $derived(
		selectedSet === 'All sets'
			? images
			: images.filter((image) => (image.meta?.setName || 'Unsorted') === selectedSet)
	);

	$effect(() => {
		if (!initialized) {
			mode = value.includes('imagedelivery.net') ? 'library' : 'link';
			initialized = true;
		}
	});

	function imageUrl(image: ArchiveImage) {
		return (
			image.variants.find((variant) => variant.endsWith('/public')) ||
			image.variants[0] ||
			(accountHash ? `https://imagedelivery.net/${accountHash}/${image.id}/public` : '')
		);
	}

	async function loadImages() {
		open = true;
		if (images.length || loading) return;
		const user = auth?.currentUser;
		if (!user) {
			errorMessage = 'Sign in before opening the image library.';
			return;
		}
		loading = true;
		errorMessage = '';
		try {
			const token = await getIdToken(user);
			const response = await fetch('/api/admin/images', {
				headers: { authorization: `Bearer ${token}` }
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.message || 'The image library could not be loaded.');
			images = result.images;
			accountHash = result.accountHash;
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'The image library could not be loaded.';
		} finally {
			loading = false;
		}
	}

	function choose(image: ArchiveImage) {
		onselect(imageUrl(image), image);
		open = false;
	}
</script>

<div>
	<div class="flex w-fit rounded-full bg-line/60 p-1">
		<button
			type="button"
			onclick={() => {
				mode = 'link';
				open = false;
			}}
			class="rounded-full px-4 py-2 text-xs transition-colors {mode === 'link'
				? 'bg-paper text-ink shadow-sm'
				: 'text-muted'}"
		>
			Image link
		</button>
		<button
			type="button"
			onclick={() => {
				mode = 'library';
				loadImages();
			}}
			class="rounded-full px-4 py-2 text-xs transition-colors {mode === 'library'
				? 'bg-paper text-ink shadow-sm'
				: 'text-muted'}"
		>
			Cloudflare library
		</button>
	</div>

	{#if mode === 'link'}
		<input
			{value}
			oninput={(event) => onselect(event.currentTarget.value)}
			placeholder="https://example.com/image.jpg"
			class="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-coral"
		/>
	{:else}
		<div class="mt-2 flex items-center gap-2">
			<input
				{value}
				readonly
				placeholder="Choose an image from Cloudflare"
				class="min-w-0 flex-1 truncate rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-muted outline-none"
			/>
			<button
				type="button"
				onclick={loadImages}
				class="shrink-0 rounded-full border border-line bg-paper px-4 py-3 text-xs hover:border-ink"
			>
				Browse
			</button>
		</div>
	{/if}

	{#if open && mode === 'library'}
		<div class="mt-3 rounded-3xl border border-line bg-paper p-4">
			<div class="flex items-center justify-between gap-3">
				<p class="text-xs font-semibold">Choose from this site’s Cloudflare images</p>
				<div class="flex gap-2">
					{#if images.length}
						<select
							bind:value={selectedSet}
							class="max-w-40 rounded-full border border-line bg-paper px-3 py-2 text-[11px] outline-none"
						>
							{#each sets as set}<option value={set}>{set}</option>{/each}
						</select>
					{/if}
					<button type="button" onclick={() => (open = false)} class="px-2 text-xs text-muted">Close</button>
				</div>
			</div>
			{#if loading}
				<p class="py-8 text-center text-xs text-muted">Loading image library…</p>
			{:else if errorMessage}
				<p class="py-6 text-center text-xs text-coral">{errorMessage}</p>
			{:else if !visibleImages.length}
				<p class="py-8 text-center text-xs text-muted">
					No Cloudflare images are available in this set. Add them from Content → Image archive.
				</p>
			{:else}
				<div class="mt-4 grid max-h-80 grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">
					{#each visibleImages as image (image.id)}
						<button
							type="button"
							onclick={() => choose(image)}
							class="group overflow-hidden rounded-2xl border text-left transition-colors {value ===
							imageUrl(image)
								? 'border-coral'
								: 'border-line hover:border-ink'}"
						>
							<img
								src={imageUrl(image)}
								alt={image.filename}
								loading="lazy"
								class="aspect-square w-full object-cover transition-transform group-hover:scale-[1.03]"
							/>
							<p class="truncate px-3 py-2 text-[10px]" title={image.filename}>{image.filename}</p>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
