<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		class: className = '',
		delay = 0
	}: {
		children: Snippet;
		class?: string;
		delay?: number;
	} = $props();

	let el = $state<HTMLElement | undefined>();
	let visible = $state(false);

	$effect(() => {
		if (!el) return;

		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) {
			visible = true;
			return;
		}

		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					visible = true;
					io.disconnect();
				}
			},
			{ threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
		);

		io.observe(el);
		return () => io.disconnect();
	});
</script>

<div
	bind:this={el}
	class="reveal {visible ? 'is-visible' : ''} {className}"
	style="--reveal-delay: {delay}ms"
>
	{@render children()}
</div>
