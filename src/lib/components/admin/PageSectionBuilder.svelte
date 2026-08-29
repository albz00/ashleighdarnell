<script lang="ts">
	import type {
		PageSectionBlock,
		PageSectionItem,
		PageSectionType,
		SectionSurface
	} from '$lib/content/page-content';

	let {
		sections,
		sectionOrder,
		page,
		onchange,
		onorderchange,
		onselect
	}: {
		sections: PageSectionBlock[];
		sectionOrder: string[];
		page: 'photography' | 'social';
		onchange: (sections: PageSectionBlock[]) => void;
		onorderchange: (order: string[]) => void;
		onselect: (sectionId: string, scroll?: boolean) => void;
	} = $props();

	let addMenuOpen = $state(false);

	const surfaces: Array<{ id: SectionSurface; label: string }> = [
		{ id: 'paper', label: 'Paper' },
		{ id: 'mist', label: 'Soft gray' },
		{ id: 'blush', label: 'Blush' },
		{ id: 'butter', label: 'Butter' },
		{ id: 'mint', label: 'Mint' },
		{ id: 'lilac', label: 'Lilac' }
	];

	function updateSection(index: number, patch: Partial<PageSectionBlock>) {
		onchange(
			sections.map((section, position) =>
				position === index ? { ...section, ...patch } : section
			)
		);
	}

	function addSection(type: PageSectionType) {
		const id = `${page}-${type}-${crypto.randomUUID().slice(0, 8)}`;
		addMenuOpen = false;
		const finalCallout = sectionOrder.indexOf('cta');
		const nextOrder = [...sectionOrder];
		nextOrder.splice(finalCallout < 0 ? nextOrder.length : finalCallout, 0, id);
		onorderchange(nextOrder);
		onchange([
			...sections,
			{
				id,
				type,
				enabled: true,
				surface: 'paper',
				title: type === 'pricing' ? 'Pricing' : 'New section',
				intro: '',
				buttonLabel: type === 'pricing' ? 'Ask for a quote' : '',
				items: [
					{
						id: `${id}-item-1`,
						title: type === 'pricing' ? 'Custom package' : 'New card',
						text: '',
						price: type === 'pricing' ? 'Custom quote' : '',
						features: []
					}
				]
			}
		]);
		onselect(`${page}.sections.${id}`, true);
	}

	function removeSection(index: number) {
		if (!window.confirm('Remove this section?')) return;
		onorderchange(sectionOrder.filter((id) => id !== sections[index].id));
		onchange(sections.filter((_, position) => position !== index));
	}

	function moveSection(id: string, direction: -1 | 1) {
		const index = sectionOrder.indexOf(id);
		const destination = index + direction;
		if (index < 0 || destination < 0 || destination >= sectionOrder.length) return;
		const next = [...sectionOrder];
		[next[index], next[destination]] = [next[destination], next[index]];
		onorderchange(next);
	}

	function updateItem(sectionIndex: number, itemIndex: number, patch: Partial<PageSectionItem>) {
		updateSection(sectionIndex, {
			items: sections[sectionIndex].items.map((item, position) =>
				position === itemIndex ? { ...item, ...patch } : item
			)
		});
	}

	function addItem(sectionIndex: number) {
		const section = sections[sectionIndex];
		const id = `${section.id}-item-${crypto.randomUUID().slice(0, 8)}`;
		updateSection(sectionIndex, {
			items: [
				...section.items,
				{
					id,
					title: section.type === 'pricing' ? 'Custom package' : 'New card',
					text: '',
					price: section.type === 'pricing' ? 'Custom quote' : '',
					features: []
				}
			]
		});
	}

	function removeItem(sectionIndex: number, itemIndex: number) {
		updateSection(sectionIndex, {
			items: sections[sectionIndex].items.filter((_, position) => position !== itemIndex)
		});
	}

	function moveItem(sectionIndex: number, itemIndex: number, direction: -1 | 1) {
		const destination = itemIndex + direction;
		const items = [...sections[sectionIndex].items];
		if (destination < 0 || destination >= items.length) return;
		[items[itemIndex], items[destination]] = [items[destination], items[itemIndex]];
		updateSection(sectionIndex, { items });
	}

	function moveItemToSection(sectionIndex: number, itemIndex: number, destinationIndex: number) {
		if (
			destinationIndex === sectionIndex ||
			destinationIndex < 0 ||
			sections[destinationIndex].items.length >= 12
		) {
			return;
		}
		const item = sections[sectionIndex].items[itemIndex];
		onchange(
			sections.map((section, index) => {
				if (index === sectionIndex) {
					return {
						...section,
						items: section.items.filter((_, position) => position !== itemIndex)
					};
				}
				if (index === destinationIndex) {
					return { ...section, items: [...section.items, item] };
				}
				return section;
			})
		);
	}

	function addFeature(sectionIndex: number, itemIndex: number) {
		const item = sections[sectionIndex].items[itemIndex];
		updateItem(sectionIndex, itemIndex, {
			features: [...item.features, 'New feature']
		});
	}

	function updateFeature(
		sectionIndex: number,
		itemIndex: number,
		featureIndex: number,
		value: string
	) {
		const item = sections[sectionIndex].items[itemIndex];
		updateItem(sectionIndex, itemIndex, {
			features: item.features.map((feature, index) => (index === featureIndex ? value : feature))
		});
	}

	function removeFeature(sectionIndex: number, itemIndex: number, featureIndex: number) {
		const item = sections[sectionIndex].items[itemIndex];
		updateItem(sectionIndex, itemIndex, {
			features: item.features.filter((_, index) => index !== featureIndex)
		});
	}
</script>

<div class="contents">
	<div class="relative flex justify-end" style:order="-1">
		<button
			type="button"
			onclick={() => (addMenuOpen = !addMenuOpen)}
			disabled={sections.length >= 12}
			class="rounded-full bg-coral px-6 py-3 text-xs font-semibold text-paper disabled:opacity-35"
		>
			+ Add section
		</button>
		{#if addMenuOpen}
			<div class="absolute right-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-paper p-2 shadow-xl">
				<button
					type="button"
					onclick={() => addSection('normal')}
					class="w-full rounded-xl px-4 py-3 text-left hover:bg-mist"
				>
					<span class="block text-sm font-semibold">Normal section</span>
					<span class="mt-1 block text-[11px] text-muted">Title, introduction, cards, and an optional button.</span>
				</button>
				<button
					type="button"
					onclick={() => addSection('pricing')}
					class="w-full rounded-xl px-4 py-3 text-left hover:bg-mist"
				>
					<span class="block text-sm font-semibold">Pricing section</span>
					<span class="mt-1 block text-[11px] text-muted">Packages, prices, descriptions, and features.</span>
				</button>
			</div>
		{/if}
	</div>

	{#each sections as section, sectionIndex (section.id)}
		<details
			class="group scroll-mt-28 overflow-hidden rounded-[2rem] border border-line bg-paper"
			data-editor-section={`${page}.sections.${section.id}`}
			style:order={sectionOrder.indexOf(section.id) + 2}
		>
			<summary
				class="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 md:px-8"
				onclick={() => onselect(`${page}.sections.${section.id}`)}
			>
				<div class="flex items-center gap-3">
					<span class="grid h-8 w-8 place-items-center rounded-full bg-mist text-xs font-semibold">
						{sectionIndex + 1}
					</span>
					<div>
						<p class="font-display text-2xl">{section.title || 'Untitled section'}</p>
						<p class="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
							{section.type === 'pricing' ? 'Pricing section' : 'Normal section'}
						</p>
					</div>
				</div>
				<span class="text-xl text-muted transition-transform group-open:rotate-45">+</span>
			</summary>

			<div class="space-y-5 border-t border-line bg-mist p-5 md:p-6">
				<div class="flex items-center gap-1">
					<button
						type="button"
						onclick={() => updateSection(sectionIndex, { enabled: !section.enabled })}
						class="rounded-full px-4 py-2 text-xs font-semibold {section.enabled ? 'bg-mint text-teal' : 'bg-paper text-muted'}"
					>
						{section.enabled ? 'Visible' : 'Hidden'}
					</button>
					<button
						type="button"
						onclick={() => moveSection(section.id, -1)}
						disabled={sectionOrder.indexOf(section.id) <= 0}
						class="rounded-full bg-paper px-4 py-2 text-xs font-semibold disabled:opacity-35"
						aria-label="Move section up"
					>↑ Move up</button>
					<button
						type="button"
						onclick={() => moveSection(section.id, 1)}
						disabled={sectionOrder.indexOf(section.id) === sectionOrder.length - 1}
						class="rounded-full bg-paper px-4 py-2 text-xs font-semibold disabled:opacity-35"
						aria-label="Move section down"
					>↓ Move down</button>
					<button
						type="button"
						onclick={() => removeSection(sectionIndex)}
						class="rounded-full px-3 py-2 text-xs text-coral"
					>
						Remove
					</button>
				</div>
				<div class="grid gap-4 md:grid-cols-2">
					<label class="block">
						<span class="text-xs font-semibold">Section title</span>
						<input
							value={section.title}
							oninput={(event) => updateSection(sectionIndex, { title: event.currentTarget.value })}
							maxlength="160"
							class="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-coral"
						/>
					</label>
					<label class="block">
						<span class="text-xs font-semibold">Background</span>
						<select
							value={section.surface}
							onchange={(event) =>
								updateSection(sectionIndex, {
									surface: event.currentTarget.value as SectionSurface
								})}
							class="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-coral"
						>
							{#each surfaces as surface}
								<option value={surface.id}>{surface.label}</option>
							{/each}
						</select>
					</label>
					<label class="block md:col-span-2">
						<span class="text-xs font-semibold">Introduction</span>
						<textarea
							value={section.intro}
							oninput={(event) => updateSection(sectionIndex, { intro: event.currentTarget.value })}
							rows="3"
							maxlength="1200"
							class="mt-2 w-full resize-y rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-coral"
						></textarea>
					</label>
					<label class="block md:col-span-2">
						<span class="text-xs font-semibold">Contact button label (optional)</span>
						<input
							value={section.buttonLabel}
							oninput={(event) =>
								updateSection(sectionIndex, { buttonLabel: event.currentTarget.value })}
							maxlength="80"
							placeholder="Leave blank to hide the button"
							class="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-coral"
						/>
					</label>
				</div>

				<div class="flex items-center justify-between gap-3 border-t border-line pt-5">
					<div>
						<p class="text-sm font-semibold">
							{section.type === 'pricing' ? 'Packages' : 'Content cards'}
						</p>
						<p class="mt-1 text-xs text-muted">{section.items.length} items</p>
					</div>
					<button
						type="button"
						onclick={() => addItem(sectionIndex)}
						disabled={section.items.length >= 12}
						class="rounded-full bg-paper px-4 py-2.5 text-xs font-semibold disabled:opacity-35"
					>
						Add {section.type === 'pricing' ? 'package' : 'card'}
					</button>
				</div>

				<div class="grid gap-4 xl:grid-cols-2">
					{#each section.items as item, itemIndex (item.id)}
						<div class="rounded-3xl bg-paper p-4">
							<div class="flex flex-wrap items-center justify-between gap-3">
								<p class="text-xs font-semibold">
									{section.type === 'pricing' ? 'Package' : 'Card'} {itemIndex + 1}
								</p>
								<div class="flex flex-wrap items-center gap-1">
									<button
										type="button"
										onclick={() => moveItem(sectionIndex, itemIndex, -1)}
										disabled={itemIndex === 0}
										class="grid h-8 w-8 place-items-center rounded-full bg-mist text-xs disabled:opacity-35"
										aria-label="Move item up"
									>↑</button>
									<button
										type="button"
										onclick={() => moveItem(sectionIndex, itemIndex, 1)}
										disabled={itemIndex === section.items.length - 1}
										class="grid h-8 w-8 place-items-center rounded-full bg-mist text-xs disabled:opacity-35"
										aria-label="Move item down"
									>↓</button>
									<select
										value=""
										onchange={(event) => {
											const value = event.currentTarget.value;
											const destination = Number(value);
											if (value !== '' && Number.isInteger(destination)) {
												moveItemToSection(sectionIndex, itemIndex, destination);
											}
										}}
										disabled={!sections.some(
											(candidate, index) =>
												index !== sectionIndex && candidate.items.length < 12
										)}
										aria-label="Move item to another section"
										class="rounded-full border border-line bg-mist px-3 py-2 text-[11px] disabled:opacity-35"
									>
										<option value="" disabled>Move to…</option>
										{#each sections as destination, destinationIndex (destination.id)}
											{#if destinationIndex !== sectionIndex && destination.items.length < 12}
												<option value={destinationIndex}>
													{destination.title || `Section ${destinationIndex + 1}`}
												</option>
											{/if}
										{/each}
									</select>
									<button
										type="button"
										onclick={() => removeItem(sectionIndex, itemIndex)}
										class="px-2 text-xs text-coral"
									>
										Remove
									</button>
								</div>
							</div>
							<div class="mt-4 space-y-3">
								<label class="block">
									<span class="text-[11px] text-muted">Title</span>
									<input
										value={item.title}
										oninput={(event) =>
											updateItem(sectionIndex, itemIndex, { title: event.currentTarget.value })}
										maxlength="120"
										class="mt-1.5 w-full rounded-xl border border-line bg-mist px-3 py-2.5 text-sm outline-none focus:border-coral"
									/>
								</label>
								{#if section.type === 'pricing'}
									<label class="block">
										<span class="text-[11px] text-muted">Price or pricing note</span>
										<input
											value={item.price}
											oninput={(event) =>
												updateItem(sectionIndex, itemIndex, {
													price: event.currentTarget.value
												})}
											maxlength="80"
											placeholder="Starting at $300 or Custom quote"
											class="mt-1.5 w-full rounded-xl border border-line bg-mist px-3 py-2.5 text-sm outline-none focus:border-coral"
										/>
									</label>
								{/if}
								<label class="block">
									<span class="text-[11px] text-muted">Description</span>
									<textarea
										value={item.text}
										oninput={(event) =>
											updateItem(sectionIndex, itemIndex, { text: event.currentTarget.value })}
										rows="3"
										maxlength="1200"
										class="mt-1.5 w-full resize-y rounded-xl border border-line bg-mist px-3 py-2.5 text-sm outline-none focus:border-coral"
									></textarea>
								</label>

								{#if section.type === 'pricing'}
									<div class="border-t border-line pt-3">
										<div class="flex items-center justify-between gap-3">
											<span class="text-[11px] font-semibold text-muted">Features</span>
											<button
												type="button"
												onclick={() => addFeature(sectionIndex, itemIndex)}
												disabled={item.features.length >= 12}
												class="text-[11px] font-semibold text-teal disabled:opacity-35"
											>
												Add feature
											</button>
										</div>
										<div class="mt-2 space-y-2">
											{#each item.features as feature, featureIndex}
												<div class="flex gap-2">
													<input
														value={feature}
														oninput={(event) =>
															updateFeature(
																sectionIndex,
																itemIndex,
																featureIndex,
																event.currentTarget.value
															)}
														maxlength="160"
														class="min-w-0 flex-1 rounded-xl border border-line bg-mist px-3 py-2 text-xs outline-none focus:border-coral"
													/>
													<button
														type="button"
														onclick={() =>
															removeFeature(sectionIndex, itemIndex, featureIndex)}
														class="px-2 text-coral"
														aria-label="Remove feature"
													>×</button>
												</div>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</details>
	{/each}
</div>
