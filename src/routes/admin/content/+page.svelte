<script lang="ts">
	import { onMount } from 'svelte';
	import { getIdToken } from 'firebase/auth';
	import {
		defaultPageContent,
		normalizePageContent,
		pageContent,
		type MediaContent,
		type PageContent
	} from '$lib/content/page-content';
	import { photoFilters } from '$lib/content/photography';
	import { savePageContent } from '$lib/firebase/repository';
	import { auth } from '$lib/firebase/client';
	import ContactFormBuilder from '$lib/components/admin/ContactFormBuilder.svelte';
	import ImageSourcePicker from '$lib/components/admin/ImageSourcePicker.svelte';
	import PageSectionBuilder from '$lib/components/admin/PageSectionBuilder.svelte';

	type PageKey = keyof PageContent;
	type Field =
		| { kind: 'text'; path: string; label: string; value: string; multiline: boolean }
		| { kind: 'media'; path: string; label: string; value: MediaContent };
	type Section = {
		id: string;
		title: string;
		description: string;
		location: string;
		fields: Field[];
	};
	type SectionDefinition = Omit<Section, 'fields'> & { keys: string[] };
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
	const sectionDefinitions: Record<PageKey, SectionDefinition[]> = {
		global: [
			{
				id: 'global.header',
				title: 'Header identity',
				description: 'The name and home label shown in the site header.',
				location: 'Global → Header',
				keys: ['firstName', 'lastName', 'homeLabel']
			},
			{
				id: 'global.footer',
				title: 'Footer',
				description: 'Footer introduction, links, newsletter form, and admin link wording.',
				location: 'Global → Footer',
				keys: [
					'footerTagline',
					'footerCtaLabel',
					'footerExploreTitle',
					'newsletterTitle',
					'newsletterDescription',
					'newsletterPlaceholder',
					'newsletterButton',
					'newsletterInvalid',
					'newsletterExisting',
					'newsletterSuccess',
					'adminLabel'
				]
			}
		],
		home: [
			{
				id: 'home.seo',
				title: 'Search listing',
				description: 'The page title and description used by search engines and browser tabs.',
				location: 'Home → Search & browser',
				keys: ['seoTitle', 'seoDescription']
			},
			{
				id: 'home.hero',
				title: 'Hero',
				description: 'The first section visitors see, including its heading, buttons, and layered images.',
				location: 'Home → Hero',
				keys: ['background', 'heroLines', 'intro', 'primaryCta', 'secondaryCta', 'backdrops', 'gallery']
			},
			{
				id: 'home.services',
				title: 'Featured services',
				description: 'The photography and social media cards directly below the hero.',
				location: 'Home → Featured services',
				keys: ['createTitle', 'services']
			},
			{
				id: 'home.about',
				title: 'About preview',
				description: 'The short introduction and portrait that lead visitors to the About page.',
				location: 'Home → About preview',
				keys: ['aboutTitle', 'aboutText', 'aboutLink', 'aboutImage']
			},
			{
				id: 'home.contact',
				title: 'Contact callout',
				description: 'The final invitation and button at the bottom of the home page.',
				location: 'Home → Contact callout',
				keys: ['contactTitle', 'contactButton']
			}
		],
		photography: [
			{
				id: 'photography.seo',
				title: 'Search listing',
				description: 'The browser and search result title for the photography page.',
				location: 'Photography → Search & browser',
				keys: ['seoTitle']
			},
			{
				id: 'photography.hero',
				title: 'Hero',
				description: 'The page heading, introduction, and large background image.',
				location: 'Photography → Hero',
				keys: ['background', 'title', 'intro']
			},
			{
				id: 'photography.gallery',
				title: 'Photography gallery',
				description: 'Every photograph, caption, filter assignment, and rotation setting.',
				location: 'Photography → Gallery',
				keys: ['shots']
			},
			{
				id: 'photography.cta',
				title: 'Contact callout',
				description: 'The booking invitation below the photography gallery.',
				location: 'Photography → Contact callout',
				keys: ['ctaTitle', 'ctaText', 'ctaButton']
			}
		],
		social: [
			{
				id: 'social.seo',
				title: 'Search listing',
				description: 'The browser and search result title for the social media page.',
				location: 'Social → Search & browser',
				keys: ['seoTitle']
			},
			{
				id: 'social.hero',
				title: 'Hero',
				description: 'The page heading, introduction, and large background image.',
				location: 'Social → Hero',
				keys: ['background', 'title', 'intro']
			},
			{
				id: 'social.background',
				title: 'Background & experience',
				description: 'The rows explaining experience and approach.',
				location: 'Social → Background',
				keys: ['backgroundTitle', 'backgroundItems']
			},
			{
				id: 'social.reels',
				title: 'Reels',
				description: 'The image and video reels displayed in the social gallery.',
				location: 'Social → Reels',
				keys: ['contentTitle', 'reels']
			},
			{
				id: 'social.services',
				title: 'Services',
				description: 'The list of available social media services.',
				location: 'Social → Services',
				keys: ['servicesTitle', 'services']
			},
			{
				id: 'social.cta',
				title: 'Contact callout',
				description: 'The final invitation below social media services.',
				location: 'Social → Contact callout',
				keys: ['ctaTitle', 'ctaText', 'ctaButton']
			}
		],
		about: [
			{
				id: 'about.seo',
				title: 'Search listing',
				description: 'The browser and search result title for the About page.',
				location: 'About → Search & browser',
				keys: ['seoTitle']
			},
			{
				id: 'about.hero',
				title: 'Introduction',
				description: 'The opening portrait, name, introduction, and background image.',
				location: 'About → Hero',
				keys: ['background', 'portrait', 'titlePrefix', 'titleName', 'intro']
			},
			{
				id: 'about.story',
				title: 'Story, facts & gear',
				description: 'The main biography, fact cards, and equipment note.',
				location: 'About → Story & facts',
				keys: ['sectionTitle', 'sectionText', 'facts', 'gearTitle', 'gearText']
			},
			{
				id: 'about.cta',
				title: 'Contact callout',
				description: 'The final invitation at the bottom of the About page.',
				location: 'About → Contact callout',
				keys: ['ctaTitle', 'ctaButton']
			}
		],
		contact: [
			{
				id: 'contact.seo',
				title: 'Search listing',
				description: 'The browser and search result title for the Contact page.',
				location: 'Contact → Search & browser',
				keys: ['seoTitle']
			},
			{
				id: 'contact.main',
				title: 'Contact introduction',
				description: 'The page heading, introduction, email address, and service locations.',
				location: 'Contact → Introduction',
				keys: ['titleBefore', 'titleAccent', 'titleAfter', 'intro', 'email', 'locations']
			},
			{
				id: 'contact.form',
				title: 'Inquiry form',
				description: 'Labels, placeholders, options, button, and notice in the contact form.',
				location: 'Contact → Inquiry form',
				keys: [
					'nameLabel',
					'namePlaceholder',
					'emailLabel',
					'emailPlaceholder',
					'messageLabel',
					'messagePlaceholder',
					'sendButton',
					'formNotice'
				]
			}
		],
		blog: [
			{
				id: 'blog.seo',
				title: 'Search listing',
				description: 'The Blog page title and description used by search engines.',
				location: 'Blog → Search & browser',
				keys: ['seoTitle', 'seoDescription']
			},
			{
				id: 'blog.hero',
				title: 'Blog introduction',
				description: 'The heading and introduction above all blog posts.',
				location: 'Blog → Hero',
				keys: ['titleBefore', 'titleAccent', 'intro']
			},
			{
				id: 'blog.featured',
				title: 'Post labels',
				description: 'Labels used on featured posts and individual article pages.',
				location: 'Blog → Featured & article labels',
				keys: ['featuredLabel', 'readLabel', 'backLabel', 'relatedTitle']
			},
			{
				id: 'blog.recent',
				title: 'Recent posts',
				description: 'The heading above the recent post grid.',
				location: 'Blog → Recent posts',
				keys: ['recentTitle']
			},
			{
				id: 'blog.not-found',
				title: 'Missing article message',
				description: 'The message shown when a blog link cannot be found.',
				location: 'Blog → Missing article',
				keys: ['notFoundTitle', 'notFoundText', 'notFoundButton']
			}
		]
	};

	let selectedPage = $state<PageKey>('home');
	let showArchive = $state(false);
	let draft = $state<PageContent>(structuredClone($pageContent));
	let notice = $state('');
	let imageErrors = $state<Record<string, boolean>>({});
	let archive = $state<ArchiveImage[]>([]);
	let accountHash = $state('');
	let archiveLoading = $state(false);
	let deletingSet = $state(false);
	let uploading = $state(false);
	let uploadProgress = $state('');
	let setName = $state('Unsorted');
	let setFilter = $state('All sets');
	let urlImports = $state('');
	let newPhotographyFilter = $state('');
	let selectedImageIds = $state<string[]>([]);
	let fileInput = $state<HTMLInputElement>();
	let saveState = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let saveResetTimer: ReturnType<typeof setTimeout> | undefined;
	let contentSearch = $state('');
	let previewOpen = $state(true);
	let previewDevice = $state<'desktop' | 'tablet' | 'mobile'>('desktop');
	let previewInspect = $state(true);
	let previewFrame = $state<HTMLIFrameElement>();
	let selectedSection = $state('home.hero');

	const currentPage = $derived(pages.find((item) => item.id === selectedPage) ?? pages[1]);
	const sections = $derived(buildSections(draft[selectedPage]));
	const visibleSections = $derived(filterSections(sections, contentSearch));
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
	const photographyFilters = $derived(
		draft.photography.categories.filter((category) => category !== 'All')
	);
	const hasUnsavedChanges = $derived(
		JSON.stringify(draft) !== JSON.stringify($pageContent)
	);
	const showSaveBar = $derived(hasUnsavedChanges || saveState !== 'idle');

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

	function itemLabel(path: string, index: number) {
		const collection = path.split('.').at(-1) ?? path;
		const names: Record<string, string> = {
			heroLines: 'Heading line',
			backdrops: 'Backdrop image',
			gallery: 'Gallery image',
			services: 'Service',
			shots: 'Photograph',
			backgroundItems: 'Experience row',
			reels: 'Reel',
			intro: 'Paragraph',
			facts: 'Fact card',
			interestOptions: 'Interest option'
		};
		return `${names[collection] ?? 'Item'} ${index + 1}`;
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
				const label = itemLabel(path, index);
				if (typeof item === 'string') {
					return fieldsFrom(item, `${path}.${index}`, label);
				}
				if (isMedia(item)) {
					return fieldsFrom(item, `${path}.${index}`, item.caption || label);
				}
				if (item && typeof item === 'object') {
					return Object.entries(item).flatMap(([key, child]) =>
						fieldsFrom(child, `${path}.${index}.${key}`, `${label} → ${labelFor(key)}`)
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
		const values = page as unknown as Record<string, unknown>;
		return sectionDefinitions[selectedPage]
			.map(({ keys, ...section }) => ({
				...section,
				fields: keys.flatMap((key) => fieldsFrom(values[key], key, labelFor(key)))
			}))
			.filter((section) => section.fields.length);
	}

	function filterSections(source: Section[], query: string) {
		const normalized = query.trim().toLowerCase();
		if (!normalized) return source;
		return source
			.map((section) => ({
				...section,
				fields: section.fields.filter((field) => {
					const value =
						field.kind === 'text'
							? field.value
							: `${field.value.alt} ${field.value.caption ?? ''} ${field.value.src}`;
					return `${section.title} ${section.location} ${section.description} ${field.label} ${field.path} ${value}`
						.toLowerCase()
						.includes(normalized);
				})
			}))
			.filter((section) => section.fields.length);
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

	function addPhotographyFilter() {
		const value = newPhotographyFilter.trim();
		if (!value) return;
		if (
			draft.photography.categories.some(
				(category) => category.toLowerCase() === value.toLowerCase()
			)
		) {
			notice = 'That photography filter already exists.';
			return;
		}
		draft.photography.categories = [...draft.photography.categories, value];
		newPhotographyFilter = '';
		saveState = 'idle';
		notice = '';
	}

	function addPhotographyShot() {
		draft.photography.shots = [
			...draft.photography.shots,
			{
				src: '',
				alt: '',
				caption: '',
				mediaType: 'image',
				metadata: { filters: [] }
			}
		];
		saveState = 'idle';
		notice = 'New photography slot added. Choose an image and assign its filters.';
	}

	function addSocialReel() {
		draft.social.reels = [
			...draft.social.reels,
			{ src: '', alt: '', caption: '', mediaType: 'image' }
		];
		saveState = 'idle';
		notice = 'New reel added. Choose an image or switch it to a video link.';
	}

	function removeMediaItem(path: string) {
		const [group, indexValue] = path.split('.');
		const index = Number(indexValue);
		if (!Number.isInteger(index)) return;
		const label = group === 'shots' ? 'photograph' : 'reel';
		if (!window.confirm(`Remove this ${label} from the page?`)) return;
		if (selectedPage === 'photography' && group === 'shots') {
			draft.photography.shots = draft.photography.shots.filter(
				(_, position) => position !== index
			);
		} else if (selectedPage === 'social' && group === 'reels') {
			draft.social.reels = draft.social.reels.filter((_, position) => position !== index);
		}
		saveState = 'idle';
		notice = `${label[0].toUpperCase()}${label.slice(1)} removed. Save changes to publish.`;
	}

	function setReelType(path: string, mediaType: 'image' | 'video') {
		const field = sections
			.flatMap((section) => section.fields)
			.find((item) => item.kind === 'media' && item.path === path);
		if (!field || field.kind !== 'media') return;
		setPath(path, {
			...field.value,
			mediaType,
			...(mediaType === 'video' ? { rotation: [] } : {})
		});
	}

	function renamePhotographyFilter(current: string, replacement: string) {
		const value = replacement.trim();
		if (!value || value === current) return;
		const categories = [...draft.photography.categories];
		draft.photography.shots = draft.photography.shots.map((photo) => ({
			...photo,
			metadata: {
				...(photo.metadata ?? {}),
				filters: photoFilters(photo, categories).map((filter) =>
					filter === current ? value : filter
				)
			}
		}));
		draft.photography.categories = categories.map((category) =>
			category === current ? value : category
		);
		saveState = 'idle';
		notice = '';
	}

	function removePhotographyFilter(filter: string) {
		if (!window.confirm(`Remove the “${filter}” photography filter?`)) return;
		const categories = [...draft.photography.categories];
		draft.photography.shots = draft.photography.shots.map((photo) => ({
			...photo,
			metadata: {
				...(photo.metadata ?? {}),
				filters: photoFilters(photo, categories).filter((value) => value !== filter)
			}
		}));
		draft.photography.categories = categories.filter((category) => category !== filter);
		saveState = 'idle';
		notice = '';
	}

	function togglePhotoFilter(path: string, filter: string, checked: boolean) {
		const field = sections
			.flatMap((section) => section.fields)
			.find((item) => item.kind === 'media' && item.path === path);
		if (!field || field.kind !== 'media') return;
		const current = photoFilters(field.value, draft.photography.categories);
		setPath(
			`${path}.metadata`,
			{
				...(field.value.metadata ?? {}),
				filters: checked
					? Array.from(new Set([...current, filter]))
					: current.filter((value) => value !== filter)
			}
		);
	}

	function setPhotoMetadata(
		path: string,
		key: 'location' | 'capturedAt' | 'keywords',
		value: string
	) {
		const field = sections
			.flatMap((section) => section.fields)
			.find((item) => item.kind === 'media' && item.path === path);
		if (!field || field.kind !== 'media') return;
		setPath(`${path}.metadata`, {
			...(field.value.metadata ?? {}),
			[key]:
				key === 'keywords'
					? value
							.split(',')
							.map((keyword) => keyword.trim())
							.filter(Boolean)
					: value
		});
	}

	function selectMedia(
		path: string,
		value: string,
		image?: ArchiveImage
	) {
		setMedia(path, 'src', value);
		const field = sections
			.flatMap((section) => section.fields)
			.find((item) => item.kind === 'media' && item.path === path);
		if (!field || field.kind !== 'media') return;
		const metadata = { ...(field.value.metadata ?? {}) };
		if (image) {
			metadata.cloudflareId = image.id;
			metadata.setName = image.meta?.setName ?? 'Unsorted';
			metadata.orientation = image.meta?.orientation ?? 'Unknown';
			metadata.source = image.meta?.source ?? 'Cloudflare';
			if (
				selectedPage === 'photography' &&
				path.startsWith('shots.') &&
				image.meta?.setName &&
				photographyFilters.includes(image.meta.setName)
			) {
				metadata.filters = Array.from(
					new Set([...(metadata.filters ?? []), image.meta.setName])
				);
			}
		} else {
			delete metadata.cloudflareId;
			delete metadata.setName;
			delete metadata.orientation;
			delete metadata.source;
		}
		setPath(`${path}.metadata`, metadata);
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
		saveState = 'idle';
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

	async function deleteImageSet() {
		if (setFilter === 'All sets') return;
		const images = filteredArchive;
		const urls = new Set(images.map(archiveUrl));
		const placements = usedImages.filter((image) => urls.has(image.src)).length;
		const warning = placements
			? ` ${placements} current site ${placements === 1 ? 'placement uses' : 'placements use'} images from this set and may break until replaced.`
			: '';
		if (
			!window.confirm(
				`Permanently delete all ${images.length} images in “${setFilter}” from Cloudflare?${warning}`
			)
		)
			return;

		deletingSet = true;
		try {
			const result = (await api(`?set=${encodeURIComponent(setFilter)}`, {
				method: 'DELETE'
			})) as { deleted: number };
			const deletedIds = new Set(images.map((image) => image.id));
			selectedImageIds = selectedImageIds.filter((id) => !deletedIds.has(id));
			setFilter = 'All sets';
			await loadArchive();
			notice = `${result.deleted} ${result.deleted === 1 ? 'image' : 'images'} deleted from the set.`;
		} catch (error) {
			notice = error instanceof Error ? error.message : 'The image set could not be deleted.';
		} finally {
			deletingSet = false;
		}
	}

	function defaultSectionFor(page: PageKey) {
		return sectionDefinitions[page].find((section) => !section.id.endsWith('.seo'))?.id ?? '';
	}

	function choosePage(page: PageKey) {
		selectedPage = page;
		selectedSection = defaultSectionFor(page);
		showArchive = false;
		contentSearch = '';
		notice = '';
	}

	function postToPreview(message: Record<string, unknown>) {
		previewFrame?.contentWindow?.postMessage(message, window.location.origin);
	}

	function syncPreview() {
		postToPreview({
			type: 'ashleigh:preview-content',
			content: structuredClone($state.snapshot(draft))
		});
		postToPreview({
			type: 'ashleigh:preview-inspect',
			enabled: previewInspect
		});
		if (selectedSection) {
			postToPreview({
				type: 'ashleigh:preview-focus',
				sectionId: selectedSection
			});
		}
	}

	function selectEditorSection(sectionId: string, scroll = false) {
		selectedSection = sectionId;
		postToPreview({ type: 'ashleigh:preview-focus', sectionId });
		if (!scroll) return;
		setTimeout(() => {
			const editor = document.querySelector<HTMLElement>(
				`[data-editor-section="${sectionId}"]`
			);
			if (!editor) return;
			if (editor instanceof HTMLDetailsElement) editor.open = true;
			editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	}

	onMount(() => {
		void loadArchive();
		function receivePreviewMessage(event: MessageEvent) {
			if (
				event.origin !== window.location.origin ||
				event.source !== previewFrame?.contentWindow
			) {
				return;
			}
			if (event.data?.type === 'ashleigh:preview-ready') syncPreview();
			if (event.data?.type === 'ashleigh:preview-section') {
				selectEditorSection(String(event.data.sectionId ?? ''), true);
			}
		}
		window.addEventListener('message', receivePreviewMessage);
		return () => window.removeEventListener('message', receivePreviewMessage);
	});

	$effect(() => {
		$state.snapshot(draft);
		selectedSection;
		previewInspect;
		if (previewFrame) syncPreview();
	});

	function setPath(path: string, value: unknown) {
		const next = structuredClone($state.snapshot(draft));
		const keys = path.split('.');
		let target = next[selectedPage] as unknown as Record<string, unknown>;
		for (const key of keys.slice(0, -1)) {
			target = target[key] as Record<string, unknown>;
		}
		target[keys.at(-1) ?? ''] = value;
		draft = next;
		saveState = 'idle';
		notice = '';
	}

	function moveBuiltInSection(sectionId: string, direction: -1 | 1) {
		if (selectedPage !== 'photography' && selectedPage !== 'social') return;
		const key = sectionId.split('.')[1];
		const order = [...draft[selectedPage].sectionOrder];
		const index = order.indexOf(key);
		const destination = index + direction;
		if (index < 0 || destination < 0 || destination >= order.length) return;
		[order[index], order[destination]] = [order[destination], order[index]];
		setPath('sectionOrder', order);
	}

	function sectionOrderFor(page: PageKey) {
		if (page === 'photography') return draft.photography.sectionOrder;
		if (page === 'social') return draft.social.sectionOrder;
		return [];
	}

	function editorSectionOrder(sectionId: string) {
		if (sectionId.endsWith('.seo')) return 0;
		if (sectionId.endsWith('.hero')) return 1;
		const index = sectionOrderFor(selectedPage).indexOf(sectionId.split('.')[1]);
		return index < 0 ? 2 : index + 2;
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
		saveState = 'idle';
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
			const snapshot = normalizePageContent(structuredClone($state.snapshot(draft)));
			await savePageContent(snapshot);
			draft = structuredClone(snapshot);
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

<div
	class="content-editor-shell mx-auto max-w-7xl"
	class:editor-with-preview={previewOpen && !showArchive}
>
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="font-display text-5xl">Content</h1>
			<p class="mt-3 max-w-2xl text-muted">
				Choose a page and section, edit it, then confirm the result in the live preview.
			</p>
		</div>
		{#if !showArchive}
			<div class="flex flex-wrap gap-2">
				<button
					type="button"
					onclick={() => (previewOpen = !previewOpen)}
					class="rounded-full border border-line bg-paper px-5 py-3 text-sm hover:border-ink"
				>
					{previewOpen ? 'Hide live preview' : 'Show live preview'}
				</button>
				<a
					href={currentPage.href}
					target="_blank"
					class="rounded-full border border-line bg-paper px-5 py-3 text-sm hover:border-ink"
				>
					Open page ↗
				</a>
			</div>
		{/if}
	</div>

	<div class="mt-8 overflow-x-auto">
		<div class="flex min-w-max gap-2 rounded-full bg-paper p-1.5">
			{#each pages as item}
				<button
					type="button"
					onclick={() => choosePage(item.id)}
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

	{#if !showArchive}
		<div class="mt-5 flex flex-wrap items-center gap-3 rounded-3xl border border-line bg-paper p-3">
			<label class="relative min-w-64 flex-1">
				<span class="sr-only">Search {currentPage.label} content</span>
				<input
					type="search"
					bind:value={contentSearch}
					placeholder="Search headings, images, captions, or sections…"
					class="w-full rounded-2xl bg-mist px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-coral/30"
				/>
			</label>
			<span class="rounded-full bg-mist px-4 py-2 text-xs text-muted">
				{visibleSections.length} {visibleSections.length === 1 ? 'section' : 'sections'}
			</span>
			<span class="rounded-full bg-mint px-4 py-2 text-xs text-teal">
				{currentPage.label} page
			</span>
		</div>
	{/if}

	{#if notice}
		<p class="mt-5 rounded-2xl bg-mint px-5 py-3 text-sm text-teal">{notice}</p>
	{/if}

	{#if !showArchive && selectedPage === 'photography'}
		<section
			class="mt-6 overflow-hidden rounded-[2rem] border border-line bg-paper"
			data-editor-section="photography.filters"
			onfocusin={() => selectEditorSection('photography.filters')}
		>
			<div class="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5 md:px-8">
				<div>
					<span class="rounded-full bg-mint px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-teal">Photography → Filters</span>
					<h2 class="font-display text-3xl">Photography filters</h2>
					<p class="mt-1 text-sm text-muted">
						Add, rename, or remove the filters visitors use on the photography page.
					</p>
				</div>
			</div>
			<div class="p-6 md:p-8">
				<div class="flex flex-wrap gap-3">
					<span class="rounded-full bg-ink px-4 py-2.5 text-xs text-paper">All</span>
					{#each photographyFilters as filter (filter)}
						<div class="flex items-center rounded-full border border-line bg-mist">
							<input
								value={filter}
								aria-label="Rename {filter} filter"
								onchange={(event) => renamePhotographyFilter(filter, event.currentTarget.value)}
								class="w-28 bg-transparent py-2.5 pl-4 text-xs outline-none"
							/>
							<button
								type="button"
								onclick={() => removePhotographyFilter(filter)}
								class="mr-1 rounded-full px-3 py-2 text-xs text-coral"
								aria-label="Remove {filter} filter"
							>
								×
							</button>
						</div>
					{/each}
				</div>
				<div class="mt-5 flex max-w-md gap-2">
					<input
						bind:value={newPhotographyFilter}
						placeholder="New filter name"
						onkeydown={(event) => {
							if (event.key === 'Enter') {
								event.preventDefault();
								addPhotographyFilter();
							}
						}}
						class="min-w-0 flex-1 rounded-full border border-line bg-mist px-4 py-2.5 text-sm outline-none focus:border-coral"
					/>
					<button
						type="button"
						onclick={addPhotographyFilter}
						class="rounded-full bg-coral px-5 py-2.5 text-xs font-semibold text-paper"
					>
						Add filter
					</button>
				</div>
			</div>
		</section>
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
						{#if setFilter !== 'All sets'}
							<button
								type="button"
								onclick={deleteImageSet}
								disabled={deletingSet || !filteredArchive.length}
								class="rounded-full border border-coral px-4 py-2.5 text-xs text-coral disabled:opacity-50"
							>
								{deletingSet ? 'Deleting set…' : 'Delete set'}
							</button>
						{/if}
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
		<div class="mt-6 flex flex-col gap-5">
			{#if selectedPage === 'photography' || selectedPage === 'social'}
				<PageSectionBuilder
					sections={draft[selectedPage].sections}
					sectionOrder={draft[selectedPage].sectionOrder}
					page={selectedPage}
					onchange={(sections) => setPath('sections', sections)}
					onorderchange={(order) => setPath('sectionOrder', order)}
					onselect={selectEditorSection}
				/>
			{/if}
			{#each visibleSections as section (section.id)}
				{@const orderKey = section.id.split('.')[1]}
				{@const orderIndex = sectionOrderFor(selectedPage).indexOf(orderKey)}
				<details
					class="group scroll-mt-24 overflow-hidden rounded-[2rem] border bg-paper {selectedSection === section.id ? 'border-coral' : 'border-line'}"
					data-editor-section={section.id}
					open={Boolean(contentSearch) || section.id === defaultSectionFor(selectedPage)}
					style:order={editorSectionOrder(section.id)}
				>
					<summary
						class="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 md:px-8"
						onclick={() => selectEditorSection(section.id)}
					>
						<div>
							<span class="rounded-full bg-mint px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-teal">{section.location}</span>
							<h2 class="font-display text-2xl">{section.title}</h2>
							<p class="mt-1 max-w-2xl text-xs leading-relaxed text-muted">{section.description}</p>
							<p class="mt-2 text-[10px] uppercase tracking-wide text-muted">{section.fields.length} editable {section.fields.length === 1 ? 'field' : 'fields'}</p>
						</div>
						<span class="text-xl text-muted transition-transform group-open:rotate-45">+</span>
					</summary>
					<div class="grid gap-5 border-t border-line p-6 md:grid-cols-2 md:p-8">
						{#if orderIndex >= 0}
							<div class="flex items-center gap-2 rounded-2xl bg-mist p-3 md:col-span-2">
								<span class="mr-auto text-xs font-semibold">Page position</span>
								<button
									type="button"
									onclick={() => moveBuiltInSection(section.id, -1)}
									disabled={orderIndex === 0}
									class="rounded-full bg-paper px-4 py-2 text-xs font-semibold disabled:opacity-35"
								>
									↑ Move up
								</button>
								<button
									type="button"
									onclick={() => moveBuiltInSection(section.id, 1)}
									disabled={orderIndex === sectionOrderFor(selectedPage).length - 1}
									class="rounded-full bg-paper px-4 py-2 text-xs font-semibold disabled:opacity-35"
								>
									↓ Move down
								</button>
							</div>
						{/if}
						{#if section.id === 'photography.gallery'}
							<div class="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-blush p-5 md:col-span-2">
								<div>
									<p class="text-sm font-semibold">Photography collection</p>
									<p class="mt-1 text-xs text-muted">Add a new slot directly to this gallery section.</p>
								</div>
								<button
									type="button"
									onclick={addPhotographyShot}
									class="rounded-full bg-coral px-5 py-3 text-xs font-semibold text-paper"
								>
									Add photograph
								</button>
							</div>
						{:else if section.id === 'social.reels'}
							<div class="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-mint p-5 md:col-span-2">
								<div>
									<p class="text-sm font-semibold">Social reel collection</p>
									<p class="mt-1 text-xs text-muted">Add an image or video slot directly to this reels section.</p>
								</div>
								<button
									type="button"
									onclick={addSocialReel}
									class="rounded-full bg-teal px-5 py-3 text-xs font-semibold text-paper"
								>
									Add reel
								</button>
							</div>
						{/if}
						{#if section.id === 'contact.form'}
							<ContactFormBuilder
								fields={draft.contact.fields}
								onchange={(fields) => setPath('fields', fields)}
							/>
						{/if}
						{#each section.fields as field (field.path)}
							{#if field.kind === 'media'}
								<div class="rounded-3xl bg-mist p-4 md:col-span-2">
									<div class="mb-4 flex flex-wrap items-center gap-2">
										<span class="rounded-full bg-paper px-3 py-1 text-[10px] font-semibold text-muted">{section.location} → {field.label}</span>
										<span class="rounded-full bg-paper px-3 py-1 text-[10px] text-muted">
											{field.value.mediaType === 'video' ? 'Video' : 'Image'}
										</span>
										{#if field.value.rotation?.length}
											<span class="rounded-full bg-lilac px-3 py-1 text-[10px] text-violet">{field.value.rotation.length + 1} rotating images</span>
										{/if}
										{#if field.value.metadata?.setName}
											<span class="rounded-full bg-mint px-3 py-1 text-[10px] text-teal">{field.value.metadata.setName}</span>
										{/if}
									</div>
									{#if (selectedPage === 'photography' && field.path.startsWith('shots.')) ||
										(selectedPage === 'social' && field.path.startsWith('reels.'))}
										<div class="mb-4 flex items-center justify-between gap-3">
											<p class="text-sm font-semibold">{field.label}</p>
											<button
												type="button"
												onclick={() => removeMediaItem(field.path)}
												class="rounded-full px-4 py-2 text-xs text-coral"
											>
												Remove
											</button>
										</div>
									{/if}
									<div class="grid gap-5 md:grid-cols-[10rem_1fr]">
										<div class="aspect-square overflow-hidden rounded-2xl bg-line">
											{#if selectedPage === 'social' &&
												field.path.startsWith('reels.') &&
												field.value.mediaType === 'video' &&
												field.value.src}
												<video
													src={field.value.src}
													controls
													muted
													preload="metadata"
													class="h-full w-full object-cover"
												>
													<track kind="captions" />
												</video>
											{:else if field.value.src && !imageErrors[field.path]}
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
											{#if !(
												(selectedPage === 'photography' && field.path.startsWith('shots.')) ||
												(selectedPage === 'social' && field.path.startsWith('reels.'))
											)}
												<p class="text-sm font-semibold">{field.label}</p>
											{/if}
											{#if selectedPage === 'social' && field.path.startsWith('reels.')}
												<div>
													<p class="mb-2 text-xs text-muted">Reel type</p>
													<div class="flex w-fit rounded-full bg-line/60 p-1">
														<button
															type="button"
															onclick={() => setReelType(field.path, 'image')}
															class="rounded-full px-4 py-2 text-xs {field.value.mediaType !== 'video'
																? 'bg-paper text-ink'
																: 'text-muted'}"
														>
															Image
														</button>
														<button
															type="button"
															onclick={() => setReelType(field.path, 'video')}
															class="rounded-full px-4 py-2 text-xs {field.value.mediaType === 'video'
																? 'bg-paper text-ink'
																: 'text-muted'}"
														>
															Video link
														</button>
													</div>
												</div>
											{/if}
											<div>
												<p class="mb-2 text-xs text-muted">
													{field.value.mediaType === 'video' ? 'Video URL' : 'Image source'}
												</p>
												{#if selectedPage === 'social' &&
													field.path.startsWith('reels.') &&
													field.value.mediaType === 'video'}
													<input
														value={field.value.src}
														oninput={(event) => setMedia(field.path, 'src', event.currentTarget.value)}
														placeholder="https://example.com/reel.mp4"
														class="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-coral"
													/>
												{:else}
													<ImageSourcePicker
														value={field.value.src}
														onselect={(value, image) => selectMedia(field.path, value, image)}
													/>
												{/if}
											</div>
											<label class="block">
												<span class="text-xs text-muted">
													{field.value.mediaType === 'video' ? 'Video description' : 'Image description'}
												</span>
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
									{#if selectedPage === 'photography' && field.path.startsWith('shots.')}
										<div class="mt-5 border-t border-line pt-5">
											<p class="text-xs font-semibold">Photography metadata</p>
											<p class="mt-1 text-[11px] text-muted">
												The public gallery uses these assignments when a visitor chooses a filter.
											</p>
											<div class="mt-4 flex flex-wrap gap-2">
												{#each photographyFilters as filter (filter)}
													<label class="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-paper px-3 py-2 text-xs">
														<input
															type="checkbox"
															checked={photoFilters(field.value, draft.photography.categories).includes(filter)}
															onchange={(event) =>
																togglePhotoFilter(field.path, filter, event.currentTarget.checked)}
															class="accent-coral"
														/>
														{filter}
													</label>
												{/each}
											</div>
											<div class="mt-4 grid gap-3 md:grid-cols-3">
												<label class="block">
													<span class="text-[11px] text-muted">Location</span>
													<input
														value={field.value.metadata?.location ?? ''}
														oninput={(event) =>
															setPhotoMetadata(field.path, 'location', event.currentTarget.value)}
														placeholder="Nashville, TN"
														class="mt-1.5 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-coral"
													/>
												</label>
												<label class="block">
													<span class="text-[11px] text-muted">Date captured</span>
													<input
														type="date"
														value={field.value.metadata?.capturedAt ?? ''}
														oninput={(event) =>
															setPhotoMetadata(field.path, 'capturedAt', event.currentTarget.value)}
														class="mt-1.5 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-coral"
													/>
												</label>
												<label class="block">
													<span class="text-[11px] text-muted">Keywords, separated by commas</span>
													<input
														value={field.value.metadata?.keywords?.join(', ') ?? ''}
														onchange={(event) =>
															setPhotoMetadata(field.path, 'keywords', event.currentTarget.value)}
														placeholder="sunset, portrait, outdoors"
														class="mt-1.5 w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-coral"
													/>
												</label>
											</div>
											{#if field.value.metadata?.cloudflareId}
												<div class="mt-4 flex flex-wrap gap-x-5 gap-y-1 rounded-2xl bg-paper px-4 py-3 text-[11px] text-muted">
													<span>Set: {field.value.metadata.setName || 'Unsorted'}</span>
													<span>Orientation: {field.value.metadata.orientation || 'Unknown'}</span>
													<span>Source: {field.value.metadata.source || 'Cloudflare'}</span>
												</div>
											{/if}
										</div>
									{/if}
									{#if field.value.mediaType !== 'video'}
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
									{/if}
								</div>
							{:else}
								<label class="block {field.multiline ? 'md:col-span-2' : ''}">
									<span class="text-xs font-semibold">{field.label}</span>
									<span class="mt-1 block text-[10px] text-muted">{section.location} → {field.label}</span>
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
			{:else}
				<div class="rounded-[2rem] border border-dashed border-line bg-paper p-12 text-center">
					<p class="font-display text-2xl">No matching content</p>
					<p class="mt-2 text-sm text-muted">Try a different heading, caption, image, or section name.</p>
				</div>
			{/each}
		</div>
	{/if}

	{#if previewOpen && !showArchive}
		<aside class="preview-panel fixed bottom-0 right-0 top-18 z-40 flex flex-col border-l border-line bg-paper shadow-2xl max-lg:left-4 max-lg:right-4 max-lg:top-16 max-lg:rounded-t-3xl max-lg:border">
			<div class="border-b border-line px-4 py-3">
				<div class="flex items-center justify-between gap-3">
					<div>
						<p class="text-xs font-semibold">Live {currentPage.label} preview</p>
						<p class="mt-0.5 text-[10px] text-muted">Unsaved edits appear here automatically.</p>
					</div>
					<button
						type="button"
						onclick={() => (previewOpen = false)}
						class="rounded-full border border-line px-3 py-2 text-xs text-muted hover:bg-mist hover:text-ink"
					>
						Close
					</button>
				</div>
				<div class="mt-3 flex flex-wrap items-center gap-2">
					<div class="flex rounded-full bg-mist p-1">
						{#each ['desktop', 'tablet', 'mobile'] as device}
							<button
								type="button"
								onclick={() => (previewDevice = device as typeof previewDevice)}
								class="rounded-full px-3 py-1.5 text-[10px] capitalize {previewDevice === device ? 'bg-ink text-paper' : 'text-muted'}"
							>
								{device}
							</button>
						{/each}
					</div>
					<button
						type="button"
						onclick={() => (previewInspect = !previewInspect)}
						class="rounded-full px-3 py-2 text-[10px] {previewInspect ? 'bg-coral text-paper' : 'border border-line text-muted'}"
					>
						{previewInspect ? 'Section inspector on' : 'Section inspector off'}
					</button>
				</div>
			</div>
			<div class="min-h-0 flex-1 overflow-auto bg-mist p-3">
				<div
					class="mx-auto h-full overflow-hidden rounded-2xl border border-line bg-paper transition-[width] duration-200"
					style:width={previewDevice === 'mobile' ? '390px' : previewDevice === 'tablet' ? '768px' : '100%'}
					style:max-width="100%"
				>
					<iframe
						bind:this={previewFrame}
						src={`${currentPage.href}?builder=1`}
						title="Live preview of the {currentPage.label} page"
						onload={syncPreview}
						class="h-full min-h-[640px] w-full bg-paper"
					></iframe>
				</div>
			</div>
		</aside>
	{/if}

	{#if showSaveBar}
		<div class="sticky bottom-5 z-50 mt-7 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-ink px-6 py-4 text-paper shadow-xl">
			<p class="text-xs text-paper/60">
				{saveState === 'saved'
					? 'Your changes are live.'
					: saveState === 'saving'
						? 'Sending changes to the server…'
						: 'You have unsaved content changes.'}
			</p>
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
	{/if}
</div>

<style>
	@media (min-width: 1024px) {
		.editor-with-preview {
			margin-right: min(47vw, 780px);
		}

		.preview-panel {
			width: min(47vw, 780px);
		}
	}

	.save-feedback {
		transition:
			background-color 180ms ease,
			transform 180ms ease;
	}

	.saved-pop {
		animation: saved-pop 520ms ease both;
	}

	@keyframes saved-pop {
		0% {
			transform: scale(1);
		}
		45% {
			transform: scale(1.08);
		}
		100% {
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.saved-pop {
			animation: none;
		}
	}
</style>
