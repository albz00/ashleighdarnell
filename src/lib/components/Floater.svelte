<script lang="ts">
	import Icon from './Icon.svelte';

	let {
		icon = 'spark',
		tint = 'butter',
		motion = 'float-spin',
		spin = 'spin-slow',
		size = 'md',
		class: className = '',
		style = undefined
	}: {
		icon?: 'spark' | 'asterisk' | 'camera' | 'at';
		tint?: 'blush' | 'butter' | 'mint' | 'lilac' | 'paper';
		motion?: 'float' | 'float-spin';
		spin?: 'spin-slow' | 'spin-slower' | 'spin-wobble' | 'none';
		size?: 'sm' | 'md' | 'lg';
		class?: string;
		style?: string;
	} = $props();

	const tints = {
		blush: 'border-coral/40 bg-blush text-coral',
		butter: 'border-marigold/50 bg-butter text-marigold',
		mint: 'border-teal/40 bg-mint text-teal',
		lilac: 'border-violet/40 bg-lilac text-violet',
		paper: 'border-line bg-paper text-muted'
	};

	const sizes = {
		sm: 'h-12 w-12',
		md: 'h-20 w-20',
		lg: 'h-24 w-24'
	};

	const iconSize = { sm: 16, md: 22, lg: 28 }[size];

	const motions = {
		float: 'animate-float',
		'float-spin': 'animate-float-spin'
	};

	const spins = {
		'spin-slow': 'animate-spin-slow',
		'spin-slower': 'animate-spin-slower',
		'spin-wobble': 'animate-spin-wobble',
		none: ''
	};
</script>

<div
	class="pointer-events-none absolute z-10 flex items-center justify-center rounded-full border {sizes[size]} {tints[tint]} {motions[motion]} {className}"
	{style}
	aria-hidden="true"
>
	<Icon name={icon} size={iconSize} class={spins[spin]} />
</div>
