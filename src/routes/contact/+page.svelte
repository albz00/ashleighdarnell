<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import SectionLabel from '$lib/components/SectionLabel.svelte';
</script>

<svelte:head>
	<title>Contact - Ashleigh Darnell</title>
</svelte:head>

<section class="relative overflow-x-clip">
	<div
		class="animate-drift pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet/15 blur-3xl"
	></div>
	<div
		class="animate-drift-slow pointer-events-none absolute bottom-0 -left-24 h-80 w-80 rounded-full bg-coral/15 blur-3xl"
	></div>
	<div
		class="relative mx-auto grid max-w-6xl gap-16 px-5 pt-16 pb-24 md:grid-cols-[1fr_1.2fr] md:px-8 md:pt-24"
	>
		<Reveal>
			<div>
				<SectionLabel text="Contact" accent="violet" />
				<h1 class="font-display mt-6 text-4xl leading-tight tracking-tight md:text-6xl">
					Lorem ipsum <span class="text-coral italic">dolor sit</span> amet
				</h1>
				<p class="mt-6 max-w-sm leading-relaxed text-muted">
					Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
					aliqua.
				</p>

				<div class="mt-10 space-y-4 text-sm">
					<p class="flex items-center gap-3 text-muted">
						<span class="inline-flex animate-spin-slow text-violet">
							<Icon name="at" size={16} />
						</span>
						lorem@ipsum.dolor
					</p>
					<p class="flex items-center gap-3 text-muted">
						<span class="inline-flex animate-float-spin text-marigold">
							<Icon name="spark" size={16} class="animate-spin-wobble" />
						</span>
						@loremipsum · @doloramet
					</p>
				</div>
			</div>
		</Reveal>

		<Reveal delay={120}>
			<form class="space-y-6" onsubmit={(e) => e.preventDefault()}>
				<div class="grid gap-6 sm:grid-cols-2">
					<label class="block">
						<span class="text-[11px] uppercase tracking-[0.2em] text-muted">Name</span>
						<input
							type="text"
							class="mt-2 w-full rounded-2xl border border-line bg-mist/60 px-4 py-3 outline-none transition-all duration-200 focus:border-coral focus:bg-paper focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-coral)_18%,transparent)]"
							placeholder="Lorem ipsum"
						/>
					</label>
					<label class="block">
						<span class="text-[11px] uppercase tracking-[0.2em] text-muted">Email</span>
						<input
							type="email"
							class="mt-2 w-full rounded-2xl border border-line bg-mist/60 px-4 py-3 outline-none transition-all duration-200 focus:border-coral focus:bg-paper focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-coral)_18%,transparent)]"
							placeholder="dolor@sit.amet"
						/>
					</label>
				</div>

				<label class="block">
					<span class="text-[11px] uppercase tracking-[0.2em] text-muted">I'm interested in</span>
					<select
						class="mt-2 w-full rounded-2xl border border-line bg-mist/60 px-4 py-3 outline-none transition-all duration-200 focus:border-coral focus:bg-paper focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-coral)_18%,transparent)]"
					>
						<option>Photography</option>
						<option>Social Media</option>
						<option>Something else</option>
					</select>
				</label>

				<label class="block">
					<span class="text-[11px] uppercase tracking-[0.2em] text-muted">Message</span>
					<textarea
						rows="5"
						class="mt-2 w-full resize-none rounded-2xl border border-line bg-mist/60 px-4 py-3 outline-none transition-all duration-200 focus:border-coral focus:bg-paper focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-coral)_18%,transparent)]"
						placeholder="Consectetur adipiscing elit, sed do eiusmod tempor incididunt..."
					></textarea>
				</label>

				<button
					type="submit"
					class="btn-fun inline-flex items-center gap-2 rounded-full border border-violet bg-violet px-9 py-4 text-[12px] uppercase tracking-[0.2em] text-paper hover:border-ink hover:bg-ink"
				>
					Send <Icon name="arrow" size={14} />
				</button>
				<p class="text-xs text-muted">Forma non conecta ad backend adhuc</p>
			</form>
		</Reveal>
	</div>
</section>
