<script lang="ts">
	import {
		defaultPageContent,
		pageContent,
		type MediaContent,
		type PageContent
	} from '$lib/content/page-content';
	import { savePageContent } from '$lib/firebase/repository';

	type PageKey = keyof PageContent;
	type Field =
		| { kind: 'text'; path: string; label: string; value: string; multiline: boolean }
		| { kind: 'media'; path: string; label: string; value: MediaContent };
	type Section = { title: string; fields: Field[] };

	const pages: Array<{ id: PageKey; label: string; href: string }> = [
		{ id: 'global', label: 'Global', href: '/' },
		{ id: 'home', label: 'Home', href: '/' },
		{ id: 'photography', label: 'Photography', href: '/photography' },
		{ id: 'social', label: 'Social', href: '/social' },
		{ id: 'about', label: 'About', href: '/about' },
		{ id: 'contact', label: 'Contact', href: '/contact' },
		{ id: 'blog', label: 'Blog shell', href: '/blog' }
	];

	let selectedPage = $state<PageKey>('home');
	let draft = $state<PageContent>(structuredClone($pageContent));
	let notice = $state('');
	let imageErrors = $state<Record<string, boolean>>({});

	const currentPage = $derived(pages.find((item) => item.id === selectedPage) ?? pages[1]);
	const sections = $derived(buildSections(draft[selectedPage]));

	function labelFor(key: string) {
		return key
			.replace(/([a-z])([A-Z])/g, '$1 $2')
			.replace(/^\w/, (character) => character.toUpperCase());
	}

	function isMedia(value: unknown): value is MediaContent {
		return Boolean(
			value &&
				typeof value === 'object' &&
				'src' in value &&
				'alt' in value &&
				typeof (value as MediaContent).src === 'string'
		);
	}

	function fieldsFrom(value: unknown, path: string, prefix = ''): Field[] {
		if (isMedia(value)) {
			return [{ kind: 'media', path, label: prefix || 'Image', value }];
		}
		if (typeof value === 'string') {
			return [
				{
					kind: 'text',
					path,
					label: prefix || labelFor(path.split('.').at(-1) ?? path),
					value,
					multiline:
						value.length > 72 ||
						/(intro|text|description|tagline|notice|detail|excerpt)/i.test(path)
				}
			];
		}
		if (Array.isArray(value)) {
			return value.flatMap((item, index) => {
				if (typeof item === 'string') {
					return fieldsFrom(item, `${path}.${index}`, `Item ${index + 1}`);
				}
				if (isMedia(item)) {
					return fieldsFrom(item, `${path}.${index}`, item.caption || `Image ${index + 1}`);
				}
				if (item && typeof item === 'object') {
					return Object.entries(item).flatMap(([key, child]) =>
						fieldsFrom(child, `${path}.${index}.${key}`, `Item ${index + 1} — ${labelFor(key)}`)
					);
				}
				return [];
			});
		}
		if (value && typeof value === 'object') {
			return Object.entries(value).flatMap(([key, child]) =>
				fieldsFrom(child, `${path}.${key}`, labelFor(key))
			);
		}
		return [];
	}

	function buildSections(page: PageContent[PageKey]): Section[] {
		const copy: Field[] = [];
		const images: Field[] = [];
		const groups: Section[] = [];

		for (const [key, value] of Object.entries(page)) {
			if (Array.isArray(value)) {
				groups.push({ title: labelFor(key), fields: fieldsFrom(value, key) });
			} else if (isMedia(value)) {
				images.push(...fieldsFrom(value, key, labelFor(key)));
			} else if (value && typeof value === 'object') {
				groups.push({ title: labelFor(key), fields: fieldsFrom(value, key) });
			} else {
				copy.push(...fieldsFrom(value, key, labelFor(key)));
			}
		}

		return [
			...(copy.length ? [{ title: 'Page copy', fields: copy }] : []),
			...(images.length ? [{ title: 'Images', fields: images }] : []),
			...groups.filter((group) => group.fields.length)
		];
	}

	function setPath(path: string, value: string) {
		const next = structuredClone(draft);
		const keys = path.split('.');
		let target = next[selectedPage] as unknown as Record<string, unknown>;
		for (const key of keys.slice(0, -1)) {
			target = target[key] as Record<string, unknown>;
		}
		target[keys.at(-1) ?? ''] = value;
		draft = next;
		notice = '';
	}

	function setMedia(path: string, key: keyof MediaContent, value: string) {
		setPath(`${path}.${key}`, value);
		if (key === 'src') imageErrors = { ...imageErrors, [path]: false };
	}

	async function save() {
		try {
			await savePageContent(structuredClone(draft));
			$pageContent = structuredClone(draft);
			notice = `${currentPage.label} content saved to Firebase.`;
		} catch (error) {
			notice = error instanceof Error ? error.message : 'Content could not be saved.';
		}
	}

	async function resetCurrentPage() {
		if (!window.confirm(`Reset all ${currentPage.label} content to its original values?`)) return;
		const next = structuredClone(draft);
		next[selectedPage] = structuredClone(defaultPageContent[selectedPage]) as never;
		try {
			await savePageContent(next);
			draft = next;
			$pageContent = structuredClone(next);
			notice = `${currentPage.label} content reset in Firebase.`;
		} catch (error) {
			notice = error instanceof Error ? error.message : 'Content could not be reset.';
		}
	}
</script>

<svelte:head><title>Content - Website Studio</title></svelte:head>

<div class="mx-auto max-w-7xl">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="font-display text-5xl">Content</h1>
			<p class="mt-3 max-w-2xl text-muted">
				Update the words and image URLs used across every public page. Layout and styling stay fixed.
			</p>
		</div>
		<a
			href={currentPage.href}
			target="_blank"
			class="rounded-full border border-line bg-paper px-5 py-3 text-sm hover:border-ink"
		>
			View {currentPage.label} page ↗
		</a>
	</div>

	<div class="mt-8 overflow-x-auto">
		<div class="flex min-w-max gap-2 rounded-full bg-paper p-1.5">
			{#each pages as item}
				<button
					type="button"
					onclick={() => {
						selectedPage = item.id;
						notice = '';
					}}
					class="rounded-full px-5 py-2.5 text-sm transition-colors {selectedPage === item.id
						? 'bg-ink text-paper'
						: 'text-muted hover:bg-mist hover:text-ink'}"
				>
					{item.label}
				</button>
			{/each}
		</div>
	</div>

	{#if notice}
		<p class="mt-5 rounded-2xl bg-mint px-5 py-3 text-sm text-teal">{notice}</p>
	{/if}

	<div class="mt-6 space-y-5">
		{#each sections as section (section.title)}
			<details class="group overflow-hidden rounded-[2rem] border border-line bg-paper" open>
				<summary class="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 md:px-8">
					<div>
						<h2 class="font-display text-2xl">{section.title}</h2>
						<p class="mt-1 text-xs text-muted">{section.fields.length} editable {section.fields.length === 1 ? 'field' : 'fields'}</p>
					</div>
					<span class="text-xl text-muted transition-transform group-open:rotate-45">+</span>
				</summary>
				<div class="grid gap-5 border-t border-line p-6 md:grid-cols-2 md:p-8">
					{#each section.fields as field (field.path)}
						{#if field.kind === 'media'}
							<div class="rounded-3xl bg-mist p-4 md:col-span-2">
								<div class="grid gap-5 md:grid-cols-[10rem_1fr]">
									<div class="aspect-square overflow-hidden rounded-2xl bg-line">
										{#if field.value.src && !imageErrors[field.path]}
											<img
												src={field.value.src}
												alt={field.value.alt}
												class="h-full w-full object-cover"
												onerror={() => (imageErrors = { ...imageErrors, [field.path]: true })}
											/>
										{:else}
											<div class="grid h-full place-items-center p-4 text-center text-xs text-muted">
												Image preview unavailable
											</div>
										{/if}
									</div>
									<div class="space-y-3">
										<p class="text-sm font-semibold">{field.label}</p>
										<label class="block">
											<span class="text-xs text-muted">Image URL</span>
											<input
												value={field.value.src}
												oninput={(event) => setMedia(field.path, 'src', event.currentTarget.value)}
												class="mt-1.5 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-coral"
											/>
										</label>
										<label class="block">
											<span class="text-xs text-muted">Image description</span>
											<input
												value={field.value.alt}
												oninput={(event) => setMedia(field.path, 'alt', event.currentTarget.value)}
												class="mt-1.5 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-coral"
											/>
										</label>
										{#if field.value.caption !== undefined}
											<label class="block">
												<span class="text-xs text-muted">Caption</span>
												<input
													value={field.value.caption}
													oninput={(event) => setMedia(field.path, 'caption', event.currentTarget.value)}
													class="mt-1.5 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-coral"
												/>
											</label>
										{/if}
									</div>
								</div>
							</div>
						{:else}
							<label class="block {field.multiline ? 'md:col-span-2' : ''}">
								<span class="text-xs font-semibold">{field.label}</span>
								{#if field.multiline}
									<textarea
										value={field.value}
										oninput={(event) => setPath(field.path, event.currentTarget.value)}
										rows="3"
										class="mt-2 w-full resize-y rounded-2xl border border-line bg-mist px-4 py-3 text-sm leading-relaxed outline-none focus:border-coral"
									></textarea>
								{:else}
									<input
										value={field.value}
										oninput={(event) => setPath(field.path, event.currentTarget.value)}
										class="mt-2 w-full rounded-2xl border border-line bg-mist px-4 py-3 text-sm outline-none focus:border-coral"
									/>
								{/if}
							</label>
						{/if}
					{/each}
				</div>
			</details>
		{/each}
	</div>

	<div class="sticky bottom-5 mt-7 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-ink px-6 py-4 text-paper shadow-xl">
		<p class="text-xs text-paper/60">Changes go live after they are saved to Firebase.</p>
		<div class="flex gap-2">
			<button type="button" onclick={resetCurrentPage} class="rounded-full px-5 py-2.5 text-xs text-paper/65 hover:bg-paper/10">
				Reset page
			</button>
			<button type="button" onclick={save} class="rounded-full bg-coral px-6 py-2.5 text-xs font-semibold text-paper">
				Save changes
			</button>
		</div>
	</div>
</div>
