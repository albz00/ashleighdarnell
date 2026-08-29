<script lang="ts">
	import type {
		ContactCustomField,
		ContactFieldType
	} from '$lib/content/page-content';

	let {
		fields,
		onchange
	}: {
		fields: ContactCustomField[];
		onchange: (fields: ContactCustomField[]) => void;
	} = $props();

	const fieldTypes: Array<{ id: ContactFieldType; label: string }> = [
		{ id: 'text', label: 'Short text' },
		{ id: 'textarea', label: 'Long text' },
		{ id: 'phone', label: 'Phone number' },
		{ id: 'select', label: 'Dropdown' },
		{ id: 'checkbox', label: 'Checkbox' }
	];

	function update(index: number, patch: Partial<ContactCustomField>) {
		onchange(fields.map((field, position) => (position === index ? { ...field, ...patch } : field)));
	}

	function addField() {
		onchange([
			...fields,
			{
				id: `field-${crypto.randomUUID().slice(0, 8)}`,
				type: 'text',
				label: 'New field',
				placeholder: '',
				required: false,
				options: []
			}
		]);
	}

	function removeField(index: number) {
		onchange(fields.filter((_, position) => position !== index));
	}

	function moveField(index: number, direction: -1 | 1) {
		const destination = index + direction;
		if (destination < 0 || destination >= fields.length) return;
		const next = [...fields];
		[next[index], next[destination]] = [next[destination], next[index]];
		onchange(next);
	}

	function addOption(index: number) {
		update(index, { options: [...fields[index].options, `Option ${fields[index].options.length + 1}`] });
	}

	function updateOption(fieldIndex: number, optionIndex: number, value: string) {
		update(fieldIndex, {
			options: fields[fieldIndex].options.map((option, index) =>
				index === optionIndex ? value : option
			)
		});
	}

	function removeOption(fieldIndex: number, optionIndex: number) {
		update(fieldIndex, {
			options: fields[fieldIndex].options.filter((_, index) => index !== optionIndex)
		});
	}
</script>

<div class="space-y-4 md:col-span-2">
	<div class="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-blush p-5">
		<div>
			<p class="text-sm font-semibold">Custom form fields</p>
			<p class="mt-1 max-w-xl text-xs leading-relaxed text-muted">
				Name, email, message, and newsletter consent stay protected. Add any extra questions below.
			</p>
		</div>
		<button
			type="button"
			onclick={addField}
			class="rounded-full bg-coral px-5 py-3 text-xs font-semibold text-paper"
		>
			Add field
		</button>
	</div>

	{#each fields as field, index (field.id)}
		<article class="rounded-3xl border border-line bg-mist p-5">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div class="flex items-center gap-2">
					<span class="grid h-7 w-7 place-items-center rounded-full bg-paper text-xs font-semibold">
						{index + 1}
					</span>
					<p class="text-sm font-semibold">{field.label || 'Untitled field'}</p>
				</div>
				<div class="flex items-center gap-1">
					<button
						type="button"
						onclick={() => moveField(index, -1)}
						disabled={index === 0}
						class="grid h-9 w-9 place-items-center rounded-full bg-paper text-sm disabled:opacity-35"
						aria-label="Move field up"
					>↑</button>
					<button
						type="button"
						onclick={() => moveField(index, 1)}
						disabled={index === fields.length - 1}
						class="grid h-9 w-9 place-items-center rounded-full bg-paper text-sm disabled:opacity-35"
						aria-label="Move field down"
					>↓</button>
					<button
						type="button"
						onclick={() => removeField(index)}
						class="rounded-full px-3 py-2 text-xs text-coral"
					>
						Remove
					</button>
				</div>
			</div>

			<div class="mt-5 grid gap-4 md:grid-cols-2">
				<label class="block">
					<span class="text-xs font-semibold">Field label</span>
					<input
						value={field.label}
						oninput={(event) => update(index, { label: event.currentTarget.value })}
						maxlength="120"
						class="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-coral"
					/>
				</label>

				<label class="block">
					<span class="text-xs font-semibold">Field type</span>
					<select
						value={field.type}
						onchange={(event) =>
							update(index, {
								type: event.currentTarget.value as ContactFieldType,
								options:
									event.currentTarget.value === 'select' && !field.options.length
										? ['Option 1']
										: field.options
							})}
						class="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-coral"
					>
						{#each fieldTypes as type}
							<option value={type.id}>{type.label}</option>
						{/each}
					</select>
				</label>

				{#if field.type !== 'checkbox' && field.type !== 'select'}
					<label class="block md:col-span-2">
						<span class="text-xs font-semibold">Placeholder text</span>
						<input
							value={field.placeholder}
							oninput={(event) => update(index, { placeholder: event.currentTarget.value })}
							maxlength="160"
							placeholder="Optional hint shown inside the field"
							class="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-coral"
						/>
					</label>
				{/if}
			</div>

			{#if field.type === 'select'}
				<div class="mt-5 rounded-2xl bg-paper p-4">
					<div class="flex items-center justify-between gap-3">
						<p class="text-xs font-semibold">Dropdown choices</p>
						<button
							type="button"
							onclick={() => addOption(index)}
							class="rounded-full bg-ink px-4 py-2 text-xs text-paper"
						>
							Add choice
						</button>
					</div>
					<div class="mt-3 space-y-2">
						{#each field.options as option, optionIndex}
							<div class="flex gap-2">
								<input
									value={option}
									oninput={(event) => updateOption(index, optionIndex, event.currentTarget.value)}
									maxlength="120"
									class="min-w-0 flex-1 rounded-xl border border-line bg-mist px-3 py-2 text-sm outline-none focus:border-coral"
								/>
								<button
									type="button"
									onclick={() => removeOption(index, optionIndex)}
									disabled={field.options.length === 1}
									class="rounded-full px-3 text-xs text-coral disabled:opacity-30"
									aria-label="Remove dropdown choice"
								>×</button>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<label class="mt-5 flex cursor-pointer items-center gap-3">
				<input
					type="checkbox"
					checked={field.required}
					onchange={(event) => update(index, { required: event.currentTarget.checked })}
					class="h-4 w-4 accent-coral"
				/>
				<span class="text-sm font-semibold">Required field</span>
			</label>
		</article>
	{:else}
		<div class="rounded-3xl border border-dashed border-line p-8 text-center">
			<p class="text-sm font-semibold">No custom fields</p>
			<p class="mt-1 text-xs text-muted">The protected name, email, and message fields will still appear.</p>
		</div>
	{/each}
</div>
