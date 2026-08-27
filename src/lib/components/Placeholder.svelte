<script lang="ts">
	let {
		label = 'image',
		src,
		alt,
		ratio = '3/4',
		tint = 'mist',
		class: className = ''
	}: {
		label?: string;
		src?: string;
		alt?: string;
		ratio?: string;
		tint?: 'mist' | 'blush' | 'butter' | 'mint' | 'lilac';
		class?: string;
	} = $props();

	const tints = {
		mist: 'bg-mist',
		blush: 'bg-blush',
		butter: 'bg-butter',
		mint: 'bg-mint',
		lilac: 'bg-lilac'
	};

	const images = [
		'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82',
		'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=82',
		'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=82',
		'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=82',
		'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=82',
		'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=82',
		'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=82',
		'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=1200&q=82',
		'https://images.unsplash.com/photo-1484406566174-9da000fda645?auto=format&fit=crop&w=1200&q=82'
	];

	const index = $derived(
		Math.abs([...label].reduce((total, character) => total + character.charCodeAt(0), 0)) % images.length
	);
</script>

<div
	class="relative overflow-hidden rounded-3xl border border-ink/10 {className}"
	style="aspect-ratio: {ratio};"
>
	<div class="absolute inset-0 {tints[tint]}">
		<img
			src={src || images[index]}
			alt={alt || label}
			loading="lazy"
			decoding="async"
			class="media-zoom h-full w-full object-cover"
		/>
	</div>
</div>
