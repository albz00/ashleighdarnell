<script lang="ts">
	let {
		src,
		alt,
		ratio = '4/5',
		class: className = '',
		loading = 'lazy'
	}: {
		src: string;
		alt: string;
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
		{loading}
		decoding="async"
		class="media-zoom h-full w-full object-cover opacity-0 transition-opacity duration-500 {loaded
			? 'opacity-100'
			: ''}"
		onload={() => (loaded = true)}
	/>
</div>
