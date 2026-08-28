<script lang="ts">
	import { rotateMedia } from '$lib/actions/rotate-media';

	let {
		src,
		alt,
		rotation = [],
		rotationSeconds = 8,
		ratio = '4/5',
		class: className = '',
		loading = 'lazy',
		fetchpriority = 'auto',
		builderInfo = ''
	}: {
		src: string;
		alt: string;
		rotation?: string[];
		rotationSeconds?: number;
		ratio?: string;
		class?: string;
		loading?: 'lazy' | 'eager';
		fetchpriority?: 'high' | 'low' | 'auto';
		builderInfo?: string;
	} = $props();

	let loaded = $state(false);
	let dimensions = $state('');
	const sourceLabel = $derived(src.includes('imagedelivery.net') ? 'Cloudflare' : 'External');
	const builderMetadata = $derived(
		[
			dimensions || 'Loading dimensions',
			sourceLabel,
			rotation.length ? `${rotation.length + 1} rotating` : 'Single image',
			builderInfo
		]
			.filter(Boolean)
			.join(' · ')
	);

	function imageLoaded(event: Event) {
		const image = event.currentTarget as HTMLImageElement;
		loaded = true;
		dimensions = `${image.naturalWidth}×${image.naturalHeight}`;
	}
</script>

<div
	class="photo-frame relative overflow-hidden bg-mist {className}"
	data-builder-media={builderMetadata}
	style="aspect-ratio: {ratio};"
>
	<div class="absolute inset-0 animate-pulse bg-line/50 transition-opacity {loaded ? 'opacity-0' : ''}"></div>
	<img
		{src}
		{alt}
		use:rotateMedia={{ media: { src, alt, rotation, rotationSeconds } }}
		{loading}
		{fetchpriority}
		decoding="async"
		class="media-zoom h-full w-full object-cover opacity-0 transition-opacity duration-500 {loaded
			? 'opacity-100'
			: ''}"
		onload={imageLoaded}
	/>
</div>
