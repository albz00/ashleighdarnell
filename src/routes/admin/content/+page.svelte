<script lang="ts">
	import { onMount } from 'svelte';
	import { getIdToken } from 'firebase/auth';
	import {
		defaultPageContent,
		pageContent,
		type MediaContent,
		type PageContent
	} from '$lib/content/page-content';
	import { savePageContent } from '$lib/firebase/repository';
	import { auth } from '$lib/firebase/client';
	import ImageSourcePicker from '$lib/components/admin/ImageSourcePicker.svelte';

	type PageKey = keyof PageContent;
	type Field =
		| { kind: 'text'; path: string; label: string; value: string; multiline: boolean }
		| { kind: 'media'; path: string; label: string; value: MediaContent };
	type Section = { title: string; fields: Field[] };
	type ArchiveImage = {
		id: string;
		filename: string;
		uploaded: string;
		meta?: { setName?: string; source?: string; orientation?: string };
		variants: string[];
	};
	type UsedImage = MediaContent & { page: PageKey; path: string };

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
	let showArchive = $state(false);
	let draft = $state<PageContent>(structuredClone($pageContent));
	let notice = $state('');
	let imageErrors = $state<Record<string, boolean>>({});
	let archive = $state<ArchiveImage[]>([]);
	let accountHash = $state('');
	let archiveLoading = $state(false);
	let uploading = $state(false);
	let uploadProgress = $state('');
	let setName = $state('Unsorted');
	let setFilter = $state('All sets');
	let urlImports = $state('');
	let selectedImageIds = $state<string[]>([]);
	let fileInput = $state<HTMLInputElement>();
	let saveState = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let saveResetTimer: ReturnType<typeof setTimeout> | undefined;

	const currentPage = $derived(pages.find((item) => item.id === selectedPage) ?? pages[1]);
	const sections = $derived(buildSections(draft[selectedPage]));
	const archiveSets = $derived([
		'All sets',
		...Array.from(new Set(archive.map((image) => image.meta?.setName || 'Unsorted'))).sort()
	]);
	const filteredArchive = $derived(
		setFilter === 'All sets'
			? archive
			: archive.filter((image) => (image.meta?.setName || 'Unsorted') === setFilter)
	);
	const usedImages = $derived(collectUsedImages(draft));

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

	function collectUsedImages(content: PageContent) {
		const output: UsedImage[] = [];
		function visit(value: unknown, page: PageKey, path: string) {
			if (isMedia(value)) {
				output.push({ ...value, page, path });
				return;
			}
			if (Array.isArray(value)) {
				value.forEach((item, index) => visit(item, page, `${path}.${index}`));
				return;
			}
			if (value && typeof value === 'object') {
				Object.entries(value).forEach(([key, child]) =>
					visit(child, page, path ? `${path}.${key}` : key)
				);
			}
		}
		(Object.keys(content) as PageKey[]).forEach((page) => visit(content[page], page, ''));
		return output;
	}

	function archiveUrl(image: ArchiveImage) {
		return (
			image.variants.find((variant) => variant.endsWith('/public')) ||
			image.variants[0] ||
			(accountHash ? `https://imagedelivery.net/${accountHash}/${image.id}/public` : '')
		);
	}

	async function api(path = '', init: RequestInit = {}) {
		const user = auth?.currentUser;
		if (!user) throw new Error('Sign in before managing images.');
		const token = await getIdToken(user);
		const response = await fetch(`/api/admin/images${path}`, {
			...init,
			headers: {
				authorization: `Bearer ${token}`,
				...(init.body instanceof FormData ? {} : { 'content-type': 'application/json' }),
				...init.headers
			}
		});
		const result = await response.json();
		if (!response.ok) throw new Error(result.message || 'The image request failed.');
		return result;
	}

	async function loadArchive() {
		archiveLoading = true;
		try {
			const result = (await api()) as {
				images: ArchiveImage[];
				accountHash: string;
				hasMore: boolean;
			};
			archive = result.images.sort(
				(a, b) => new Date(b.uploaded).getTime() - new Date(a.uploaded).getTime()
			);
			accountHash = result.accountHash;
			if (result.hasMore) notice = 'Showing the newest 1,000 images in this site archive.';
		} catch (error) {
			notice = error instanceof Error ? error.message : 'The image archive could not be loaded.';
		} finally {
			archiveLoading = false;
		}
	}

	async function fileOrientation(file: File) {
		try {
			const bitmap = await createImageBitmap(file);
			const orientation =
				bitmap.width > bitmap.height ? 'landscape' : bitmap.height > bitmap.width ? 'portrait' : 'square';
			bitmap.close();
			return orientation;
		} catch {
			return 'unknown';
		}
	}

	async function uploadFiles(files: FileList | File[]) {
		const images = Array.from(files).filter((file) => file.type.startsWith('image/'));
		if (!images.length) {
			notice = 'Choose one or more image files.';
			return;
		}
		uploading = true;
		notice = '';
		try {
			for (const [index, file] of images.entries()) {
				uploadProgress = `Uploading ${index + 1} of ${images.length}: ${file.name}`;
				const ticket = (await api('', {
					method: 'POST',
					body: JSON.stringify({
						action: 'direct-upload',
						filename: file.name,
						setName,
						orientation: await fileOrientation(file)
					})
				})) as { uploadURL: string };
				const form = new FormData();
				form.set('file', file);
				const response = await fetch(ticket.uploadURL, { method: 'POST', body: form });
				if (!response.ok) throw new Error(`Cloudflare could not upload ${file.name}.`);
			}
			await loadArchive();
			notice = `${images.length} ${images.length === 1 ? 'image' : 'images'} added to ${setName || 'Unsorted'}.`;
			if (fileInput) fileInput.value = '';
		} catch (error) {
			notice = error instanceof Error ? error.message : 'Images could not be uploaded.';
		} finally {
			uploading = false;
			uploadProgress = '';
		}
	}

	async function importUrls() {
		const urls = urlImports
			.split(/\r?\n/)
			.map((value) => value.trim())
			.filter(Boolean);
		if (!urls.length) {
			notice = 'Paste at least one direct image URL.';
			return;
		}
		uploading = true;
		notice = '';
		try {
			for (const [index, url] of urls.entries()) {
				uploadProgress = `Importing ${index + 1} of ${urls.length}`;
				await api('', {
					method: 'POST',
					body: JSON.stringify({ action: 'import-url', url, setName })
				});
			}
			urlImports = '';
			await loadArchive();
			notice = `${urls.length} linked ${urls.length === 1 ? 'image' : 'images'} copied into Cloudflare Images.`;
		} catch (error) {
			notice = error instanceof Error ? error.message : 'Image links could not be imported.';
		} finally {
			uploading = false;
			uploadProgress = '';
		}
	}

	function toggleSelected(imageId: string) {
		selectedImageIds = selectedImageIds.includes(imageId)
			? selectedImageIds.filter((id) => id !== imageId)
			: [...selectedImageIds, imageId];
	}

	function selectVisible() {
		const visibleIds = filteredArchive.map((image) => image.id);
		selectedImageIds = visibleIds.every((id) => selectedImageIds.includes(id)) ? [] : visibleIds;
	}

	function assignPath(content: PageContent, page: PageKey, path: string, value: string) {
		const keys = path.split('.');
		let target = content[page] as unknown as Record<string, unknown>;
		for (const key of keys.slice(0, -1)) target = target[key] as Record<string, unknown>;
		const media = target[keys.at(-1) ?? ''] as MediaContent;
		media.src = value;
	}

	function replaceFromSelection(scope: 'page' | 'all' | 'empty') {
		const selected = archive.filter((image) => selectedImageIds.includes(image.id));
		if (!selected.length) {
			notice = 'Select at least one archive image first.';
			return;
		}
		const slots = usedImages.filter((image) => {
			if (scope === 'page') return image.page === selectedPage;
			if (scope === 'empty') return !image.src;
			return true;
		});
		if (!slots.length) {
			notice = scope === 'empty' ? 'There are no empty image slots.' : 'No image slots were found.';
			return;
		}
		const next = structuredClone($state.snapshot(draft));
		slots.forEach((slot, index) =>
			assignPath(next, slot.page, slot.path, archiveUrl(selected[index % selected.length]))
		);
		draft = next;
		notice = `${slots.length} image ${slots.length === 1 ? 'slot is' : 'slots are'} previewing the selected set. Save changes to publish.`;
	}

	async function removeArchiveImage(image: ArchiveImage) {
		if (
			!window.confirm(
				`Delete ${image.filename} from Cloudflare Images? Any page still using it may show a broken image.`
			)
		)
			return;
		try {
			await api(`?id=${encodeURIComponent(image.id)}`, { method: 'DELETE' });
			selectedImageIds = selectedImageIds.filter((id) => id !== image.id);
			await loadArchive();
			notice = 'Image deleted from Cloudflare Images.';
		} catch (error) {
			notice = error instanceof Error ? error.message : 'The image could not be deleted.';
		}
	}

	onMount(loadArchive);

	function setPath(path: string, value: unknown) {
		const next = structuredClone($state.snapshot(draft));
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

	function addRotationImage(path: string) {
		const next = structuredClone($state.snapshot(draft));
		const keys = path.split('.');
		let target = next[selectedPage] as unknown as Record<string, unknown>;
		for (const key of keys) target = target[key] as Record<string, unknown>;
		const media = target as unknown as MediaContent;
		media.rotation = [...(media.rotation ?? []), ''];
		media.rotationSeconds ??= 8;
		draft = next;
		notice = '';
	}

	function removeRotationImage(path: string, index: number) {
		const field = sections
			.flatMap((section) => section.fields)
			.find((item) => item.kind === 'media' && item.path === path);
		if (!field || field.kind !== 'media') return;
		setPath(
			`${path}.rotation`,
			(field.value.rotation ?? []).filter((_, position) => position !== index)
		);
	}

	async function save() {
		if (saveState === 'saving') return;
		saveState = 'saving';
		if (saveResetTimer) clearTimeout(saveResetTimer);
		try {
			const snapshot = structuredClone($state.snapshot(draft));
			await savePageContent(snapshot);
			$pageContent = snapshot;
			notice = 'Content and image replacements saved to the server.';
			saveState = 'saved';
			saveResetTimer = setTimeout(() => (saveState = 'idle'), 2400);
		} catch (error) {
			notice = error instanceof Error ? error.message : 'Content could not be saved.';
			saveState = 'error';
		}
	}

	function discardChanges() {
		if (!window.confirm('Discard every unsaved content and image change?')) return;
		draft = structuredClone($pageContent);
		imageErrors = {};
		saveState = 'idle';
		notice = 'Unsaved changes discarded.';
	}

	async function resetCurrentPage() {
		if (!window.confirm(`Reset all ${currentPage.label} content to its original values?`)) return;
		const next = structuredClone($state.snapshot(draft));
		next[selectedPage] = structuredClone(defaultPageContent[selectedPage]) as never;
		try {
			await savePageContent(next);
			draft = next;
			$pageContent = structuredClone(next);
			notice = `${currentPage.label} content reset on the server.`;
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
				Update every page or manage the complete Cloudflare image archive. Layout and styling stay fixed.
			</p>
		</div>
		{#if !showArchive}
			<a
				href={currentPage.href}
				target="_blank"
				class="rounded-full border border-line bg-paper px-5 py-3 text-sm hover:border-ink"
			>
				View {currentPage.label} page ↗
			</a>
		{/if}
	</div>

	<div class="mt-8 overflow-x-auto">
		<div class="flex min-w-max gap-2 rounded-full bg-paper p-1.5">
			{#each pages as item}
				<button
					type="button"
					onclick={() => {
						selectedPage = item.id;
						showArchive = false;
						notice = '';
					}}
					class="rounded-full px-5 py-2.5 text-sm transition-colors {!showArchive &&
					selectedPage === item.id
						? 'bg-ink text-paper'
						: 'text-muted hover:bg-mist hover:text-ink'}"
				>
					{item.label}
				</button>
			{/each}
			<button
				type="button"
				onclick={() => {
					showArchive = true;
					notice = '';
				}}
				class="rounded-full px-5 py-2.5 text-sm transition-colors {showArchive
					? 'bg-ink text-paper'
					: 'text-muted hover:bg-mist hover:text-ink'}"
			>
				Image archive
			</button>
		</div>
	</div>

	{#if notice}
		<p class="mt-5 rounded-2xl bg-mint px-5 py-3 text-sm text-teal">{notice}</p>
	{/if}

	{#if showArchive}
		<div class="mt-6 space-y-6">
			<section class="overflow-hidden rounded-[2rem] border border-line bg-paper">
				<div class="border-b border-line px-6 py-5 md:px-8">
					<h2 class="font-display text-3xl">Add images</h2>
					<p class="mt-1 text-sm text-muted">
						Upload files or paste direct links. Every imported image is tagged for this website.
					</p>
				</div>
				<div class="grid gap-5 p-6 md:grid-cols-2 md:p-8">
					<div
						role="button"
						tabindex="0"
						ondragover={(event) => event.preventDefault()}
						ondrop={(event) => {
							event.preventDefault();
							if (event.dataTransfer?.files) uploadFiles(event.dataTransfer.files);
						}}
						onkeydown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') fileInput?.click();
						}}
						onclick={() => fileInput?.click()}
						class="grid min-h-56 cursor-pointer place-items-center rounded-3xl border-2 border-dashed border-line bg-mist p-8 text-center transition-colors hover:border-coral"
					>
						<div>
							<p class="font-display text-2xl">Drop a batch here</p>
							<p class="mt-2 text-sm text-muted">or click to browse for image files</p>
						</div>
						<input
							bind:this={fileInput}
							type="file"
							accept="image/*"
							multiple
							class="sr-only"
							onchange={(event) => {
								if (event.currentTarget.files) uploadFiles(event.currentTarget.files);
							}}
						/>
					</div>
					<div class="rounded-3xl bg-mist p-5">
						<label class="block">
							<span class="text-xs font-semibold">Image set name</span>
							<input
								bind:value={setName}
								placeholder="Example: Autumn portraits"
								class="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-coral"
							/>
						</label>
						<label class="mt-4 block">
							<span class="text-xs font-semibold">Direct image links, one per line</span>
							<textarea
								bind:value={urlImports}
								rows="4"
								placeholder="https://example.com/photo.jpg"
								class="mt-2 w-full resize-y rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-coral"
							></textarea>
						</label>
						<button
							type="button"
							onclick={importUrls}
							disabled={uploading}
							class="mt-4 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-paper disabled:opacity-50"
						>
							Import links into Cloudflare
						</button>
					</div>
				</div>
				{#if uploading}
					<p class="border-t border-line px-8 py-4 text-sm text-muted">{uploadProgress}</p>
				{/if}
			</section>

			<section class="overflow-hidden rounded-[2rem] border border-line bg-paper">
				<div class="flex flex-wrap items-end justify-between gap-4 border-b border-line px-6 py-5 md:px-8">
					<div>
						<h2 class="font-display text-3xl">Cloudflare archive</h2>
						<p class="mt-1 text-sm text-muted">{archive.length} images tagged for this website</p>
					</div>
					<div class="flex flex-wrap gap-2">
						<select
							bind:value={setFilter}
							class="rounded-full border border-line bg-paper px-4 py-2.5 text-xs outline-none focus:border-coral"
						>
							{#each archiveSets as imageSet}<option value={imageSet}>{imageSet}</option>{/each}
						</select>
						<button
							type="button"
							onclick={selectVisible}
							class="rounded-full border border-line px-4 py-2.5 text-xs hover:border-ink"
						>
							Select visible
						</button>
						<button
							type="button"
							onclick={loadArchive}
							disabled={archiveLoading}
							class="rounded-full border border-line px-4 py-2.5 text-xs hover:border-ink disabled:opacity-50"
						>
							Refresh
						</button>
					</div>
				</div>

				<div class="flex flex-wrap gap-2 border-b border-line bg-mist px-6 py-4 md:px-8">
					<span class="mr-2 self-center text-xs text-muted">{selectedImageIds.length} selected</span>
					<button
						type="button"
						onclick={() => replaceFromSelection('page')}
						class="rounded-full bg-paper px-4 py-2 text-xs hover:bg-ink hover:text-paper"
					>
						Replace {currentPage.label} images
					</button>
					<button
						type="button"
						onclick={() => replaceFromSelection('all')}
						class="rounded-full bg-coral px-4 py-2 text-xs font-semibold text-paper"
					>
						Replace every site image
					</button>
					<button
						type="button"
						onclick={() => replaceFromSelection('empty')}
						class="rounded-full bg-paper px-4 py-2 text-xs hover:bg-ink hover:text-paper"
					>
						Fill empty slots
					</button>
				</div>

				{#if archiveLoading}
					<div class="grid min-h-64 place-items-center text-sm text-muted">Loading Cloudflare Images…</div>
				{:else if !filteredArchive.length}
					<div class="grid min-h-64 place-items-center p-8 text-center text-sm text-muted">
						No images in this set yet. Upload files or import links above.
					</div>
				{:else}
					<div class="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 lg:grid-cols-4 md:p-8">
						{#each filteredArchive as image (image.id)}
							<article
								class="group overflow-hidden rounded-3xl border bg-mist transition-colors {selectedImageIds.includes(
									image.id
								)
									? 'border-coral'
									: 'border-line'}"
							>
								<button
									type="button"
									onclick={() => toggleSelected(image.id)}
									class="relative block aspect-[4/3] w-full overflow-hidden bg-line text-left"
								>
									<img
										src={archiveUrl(image)}
										alt={image.filename}
										loading="lazy"
										class="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
									/>
									<span
										class="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full border text-xs {selectedImageIds.includes(
											image.id
										)
											? 'border-coral bg-coral text-paper'
											: 'border-paper/70 bg-ink/50 text-paper'}"
									>
										{selectedImageIds.includes(image.id) ? '✓' : ''}
									</span>
								</button>
								<div class="p-4">
									<p class="truncate text-xs font-semibold" title={image.filename}>{image.filename}</p>
									<div class="mt-2 flex items-center justify-between gap-2">
										<span class="truncate text-[11px] text-muted">{image.meta?.setName || 'Unsorted'}</span>
										<button
											type="button"
											onclick={() => removeArchiveImage(image)}
											class="text-[11px] text-muted hover:text-coral"
										>
											Delete
										</button>
									</div>
								</div>
							</article>
						{/each}
					</div>
				{/if}
			</section>

			<details class="group overflow-hidden rounded-[2rem] border border-line bg-paper">
				<summary class="flex cursor-pointer list-none items-center justify-between px-6 py-5 md:px-8">
					<div>
						<h2 class="font-display text-2xl">Images currently on the site</h2>
						<p class="mt-1 text-xs text-muted">{usedImages.length} placements, including external links</p>
					</div>
					<span class="text-xl text-muted transition-transform group-open:rotate-45">+</span>
				</summary>
				<div class="grid grid-cols-2 gap-4 border-t border-line p-5 sm:grid-cols-3 lg:grid-cols-5 md:p-8">
					{#each usedImages as image (`${image.page}.${image.path}`)}
						<div class="overflow-hidden rounded-2xl bg-mist">
							<img src={image.src} alt={image.alt} loading="lazy" class="aspect-square w-full object-cover" />
							<div class="p-3">
								<p class="truncate text-xs font-semibold">{pages.find((page) => page.id === image.page)?.label}</p>
								<p class="mt-1 truncate text-[10px] text-muted" title={image.path}>{image.path}</p>
							</div>
						</div>
					{/each}
				</div>
			</details>
		</div>
	{:else}
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
											<div>
												<p class="mb-2 text-xs text-muted">Image source</p>
												<ImageSourcePicker
													value={field.value.src}
													onselect={(value) => setMedia(field.path, 'src', value)}
												/>
											</div>
											<label class="block">
												<span class="text-xs text-muted">Image description</span>
												<input
													value={field.value.alt}
													oninput={(event) => setMedia(field.path, 'alt', event.currentTarget.value)}
													class="mt-1.5 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-coral"
												/>
											</label>
											<label class="block">
												<span class="text-xs text-muted">Caption (optional)</span>
												<input
													value={field.value.caption ?? ''}
													oninput={(event) => setMedia(field.path, 'caption', event.currentTarget.value)}
													placeholder="Leave blank to show no caption"
													class="mt-1.5 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-coral"
												/>
											</label>
										</div>
									</div>
									<div class="mt-5 border-t border-line pt-5">
										<div class="flex flex-wrap items-center justify-between gap-3">
											<div>
												<p class="text-xs font-semibold">Rotating images</p>
												<p class="mt-1 text-[11px] text-muted">
													Add alternatives and this image slot will cycle through them automatically.
												</p>
											</div>
											<div class="flex items-center gap-2">
												<label class="text-[11px] text-muted" for="rotation-{selectedPage}-{field.path}">
													Seconds
												</label>
												<input
													id="rotation-{selectedPage}-{field.path}"
													type="number"
													min="2"
													max="300"
													value={field.value.rotationSeconds ?? 8}
													oninput={(event) =>
														setPath(
															`${field.path}.rotationSeconds`,
															Math.max(2, Number(event.currentTarget.value) || 8)
														)}
													class="w-20 rounded-xl border border-line bg-paper px-3 py-2 text-xs outline-none focus:border-coral"
												/>
												<button
													type="button"
													onclick={() => addRotationImage(field.path)}
													class="rounded-full bg-ink px-4 py-2 text-xs text-paper"
												>
													Add image
												</button>
											</div>
										</div>
										{#each field.value.rotation ?? [] as source, index}
											<div class="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
												<ImageSourcePicker
													value={source}
													onselect={(value) => setPath(`${field.path}.rotation.${index}`, value)}
												/>
												<button
													type="button"
													onclick={() => removeRotationImage(field.path, index)}
													class="self-start rounded-full px-4 py-2 text-xs text-coral"
												>
													Remove
												</button>
											</div>
										{/each}
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
	{/if}

	<div class="sticky bottom-5 mt-7 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-ink px-6 py-4 text-paper shadow-xl">
		<p class="text-xs text-paper/60">Image replacements go live only after they are saved.</p>
		<div class="flex gap-2">
			{#if !showArchive}
				<button type="button" onclick={resetCurrentPage} class="rounded-full px-5 py-2.5 text-xs text-paper/65 hover:bg-paper/10">
					Reset page
				</button>
			{/if}
			<button
				type="button"
				onclick={discardChanges}
				disabled={saveState === 'saving'}
				class="rounded-full border border-paper/20 px-5 py-2.5 text-xs text-paper/75 transition-colors hover:bg-paper/10 disabled:opacity-50"
			>
				Discard changes
			</button>
			<button
				type="button"
				onclick={save}
				disabled={saveState === 'saving'}
				class="save-feedback rounded-full px-6 py-2.5 text-xs font-semibold text-paper disabled:cursor-wait {saveState ===
				'saved'
					? 'saved-pop bg-teal'
					: saveState === 'error'
						? 'bg-violet'
						: 'bg-coral'}"
			>
				{saveState === 'saving'
					? 'Saving…'
					: saveState === 'saved'
						? 'Saved ✓'
						: saveState === 'error'
							? 'Try saving again'
							: 'Save content changes'}
			</button>
		</div>
	</div>
</div>

<style>
	.save-feedback {
		transition:
			background-color 180ms ease,
			transform 180ms ease,
			box-shadow 180ms ease;
	}

	.saved-pop {
		animation: saved-pop 520ms ease both;
	}

	@keyframes saved-pop {
		0% {
			transform: scale(1);
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-teal) 65%, transparent);
		}
		45% {
			transform: scale(1.08);
			box-shadow: 0 0 0 10px transparent;
		}
		100% {
			transform: scale(1);
			box-shadow: 0 0 0 0 transparent;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.saved-pop {
			animation: none;
		}
	}
</style>
