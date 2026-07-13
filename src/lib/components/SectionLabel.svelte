<script lang="ts">
	import Icon from './Icon.svelte';

	let {
		text,
		accent = 'coral'
	}: { text: string; accent?: 'coral' | 'marigold' | 'teal' | 'violet' } = $props();

	const accents = {
		coral: 'text-coral',
		marigold: 'text-marigold',
		teal: 'text-teal',
		violet: 'text-violet'
	};
</script>

<p class="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.25em] text-muted">
	<span class="inline-flex animate-spin-wobble">
		<Icon name="asterisk" size={12} class={accents[accent]} />
	</span>
	{text}
</p>
