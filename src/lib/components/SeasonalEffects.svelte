<script lang="ts">
	import {
		effectSettings,
		selectedTheme,
		type EffectId,
		type ThemeId
	} from '$lib/content/site';

	const effects: Partial<
		Record<EffectId, { symbols: string[]; animation: 'fall' | 'rise' | 'float'; label: string }>
	> = {
		snow: { symbols: ['❄', '❅', '❆'], animation: 'fall', label: 'falling snow' },
		pumpkins: { symbols: ['🎃', '🎃', '🦇'], animation: 'rise', label: 'floating pumpkins and bats' },
		thanksgiving: { symbols: ['🦃', '🍂', '🍁'], animation: 'fall', label: 'turkeys and autumn leaves' },
		easter: { symbols: ['🥚', '🐇', '🌷'], animation: 'float', label: 'Easter eggs and spring details' },
		hearts: { symbols: ['♥', '♡', '❤'], animation: 'rise', label: 'floating hearts' },
		summer: { symbols: ['☀', '✦', '🍋'], animation: 'float', label: 'sunshine and citrus' }
	};
	const themeDefaults: Partial<Record<ThemeId, EffectId>> = {
		christmas: 'snow',
		halloween: 'pumpkins',
		thanksgiving: 'thanksgiving',
		easter: 'easter',
		valentine: 'hearts',
		summer: 'summer'
	};

	const particles = Array.from({ length: 32 }, (_, index) => ({
		x: (index * 37 + 7) % 100,
		y: (index * 29 + 11) % 82,
		delay: -((index * 1.7) % 14),
		duration: 9 + (index % 8),
		size: 13 + (index % 5) * 4,
		drift: -35 + ((index * 23) % 70)
	}));

	const selectedEffect = $derived($effectSettings.effect ?? 'auto');
	const effect = $derived(
		selectedEffect === 'none'
			? undefined
			: effects[selectedEffect === 'auto' ? (themeDefaults[$selectedTheme] ?? 'none') : selectedEffect]
	);
	const particleCount = $derived(
		$effectSettings.intensity === 'subtle'
			? 10
			: $effectSettings.intensity === 'celebration'
				? 32
				: 20
	);
</script>

{#if $effectSettings.enabled && effect}
	<div class="seasonal-effects" aria-hidden="true" data-effect={effect.label}>
		{#each particles.slice(0, particleCount) as particle, index}
			<span
				class="seasonal-particle"
				data-animation={effect.animation}
				style:--x={`${particle.x}%`}
				style:--y={`${particle.y}%`}
				style:--delay={`${particle.delay}s`}
				style:--duration={`${particle.duration}s`}
				style:--size={`${particle.size}px`}
				style:--drift={`${particle.drift}px`}
			>
				{effect.symbols[index % effect.symbols.length]}
			</span>
		{/each}
	</div>
{/if}

<style>
	.seasonal-effects {
		position: fixed;
		inset: 0;
		z-index: 45;
		overflow: hidden;
		pointer-events: none;
	}

	.seasonal-particle {
		position: absolute;
		left: var(--x);
		font-size: var(--size);
		line-height: 1;
		filter: drop-shadow(0 2px 3px rgb(0 0 0 / 0.12));
		opacity: 0;
		will-change: transform, opacity;
		animation-delay: var(--delay);
		animation-duration: var(--duration);
		animation-iteration-count: infinite;
		animation-timing-function: linear;
	}

	.seasonal-particle[data-animation='fall'] {
		top: -3rem;
		animation-name: seasonal-fall;
	}

	.seasonal-particle[data-animation='rise'] {
		bottom: -3rem;
		animation-name: seasonal-rise;
	}

	.seasonal-particle[data-animation='float'] {
		top: var(--y);
		animation-name: seasonal-float;
		animation-timing-function: ease-in-out;
	}

	@keyframes seasonal-fall {
		0% {
			opacity: 0;
			transform: translate3d(0, -4rem, 0) rotate(0deg);
		}
		8%,
		88% {
			opacity: 0.8;
		}
		100% {
			opacity: 0;
			transform: translate3d(var(--drift), calc(100vh + 7rem), 0) rotate(420deg);
		}
	}

	@keyframes seasonal-rise {
		0% {
			opacity: 0;
			transform: translate3d(0, 4rem, 0) rotate(-12deg) scale(0.8);
		}
		10%,
		86% {
			opacity: 0.85;
		}
		100% {
			opacity: 0;
			transform: translate3d(var(--drift), calc(-100vh - 7rem), 0) rotate(18deg) scale(1.1);
		}
	}

	@keyframes seasonal-float {
		0%,
		100% {
			opacity: 0.35;
			transform: translate3d(-18px, -10px, 0) rotate(-8deg);
		}
		50% {
			opacity: 0.85;
			transform: translate3d(calc(18px + var(--drift)), 16px, 0) rotate(9deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.seasonal-particle {
			display: none;
		}
	}
</style>
