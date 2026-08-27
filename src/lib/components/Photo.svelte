<script lang="ts">
	import { rotateMedia } from '$lib/actions/rotate-media';

	let {
		src,
		alt,
		rotation = [],
		rotationSeconds = 8,
		ratio = '4/5',
		class: className = '',
		loading = 'lazy'
	}: {
		src: string;
		alt: string;
		rotation?: string[];
		rotationSeconds?: number;
		ratio?: string;
		class?: string;
		loading?: 'lazy' | 'eager';
	} = $props();

	let loaded = $state(false);
</script>

<div
	class="photo-frame relative overflow-hidden bg-mist {className}"
	style="aspect-ratio: {ratio};"
>
	<div class="absolute inset-0 animate-pulse bg-line/50 transition-opacity {loaded ? 'opacity-0' : ''}"></div>
	<img
		{src}
		{alt}
		use:rotateMedia={{ media: { src, alt, rotation, rotationSeconds } }}
		{loading}
		decoding="async"
		class="media-zoom h-full w-full object-cover opacity-0 transition-opacity duration-500 {loaded
			? 'opacity-100'
			: ''}"
		onload={() => (loaded = true)}
	/>
</div>
