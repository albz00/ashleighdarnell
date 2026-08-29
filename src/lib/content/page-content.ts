import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';
import { siteNavigation } from './navigation';

export type MediaContent = {
	src: string;
	alt: string;
	caption?: string;
	mediaType?: 'image' | 'video';
	rotation?: string[];
	rotationSeconds?: number;
	metadata?: {
		filters?: string[];
		location?: string;
		capturedAt?: string;
		keywords?: string[];
		cloudflareId?: string;
		setName?: string;
		orientation?: string;
		source?: string;
	};
};

export type NavItem = { label: string; href: string };

export type ContactFieldType = 'text' | 'textarea' | 'phone' | 'select' | 'checkbox';

export type ContactCustomField = {
	id: string;
	type: ContactFieldType;
	label: string;
	placeholder: string;
	required: boolean;
	options: string[];
};

export type PageContent = {
	global: {
		firstName: string;
		lastName: string;
		homeLabel: string;
		navigation: NavItem[];
		footerTagline: string;
		footerCtaLabel: string;
		footerExploreTitle: string;
		newsletterTitle: string;
		newsletterDescription: string;
		newsletterPlaceholder: string;
		newsletterButton: string;
		newsletterInvalid: string;
		newsletterExisting: string;
		newsletterSuccess: string;
		adminLabel: string;
	};
	home: {
		seoTitle: string;
		seoDescription: string;
		background: MediaContent;
		heroLines: string[];
		intro: string;
		primaryCta: string;
		secondaryCta: string;
		backdrops: MediaContent[];
		gallery: MediaContent[];
		createTitle: string;
		services: Array<{ title: string; text: string; href: string; image: MediaContent }>;
		aboutTitle: string;
		aboutText: string;
		aboutLink: string;
		aboutImage: MediaContent;
		contactTitle: string;
		contactButton: string;
	};
	photography: {
		seoTitle: string;
		background: MediaContent;
		title: string;
		intro: string;
		categories: string[];
		shots: MediaContent[];
		ctaTitle: string;
		ctaText: string;
		ctaButton: string;
	};
	social: {
		seoTitle: string;
		background: MediaContent;
		title: string;
		intro: string;
		backgroundTitle: string;
		backgroundItems: Array<{ kicker: string; title: string; detail: string }>;
		contentTitle: string;
		reels: MediaContent[];
		servicesTitle: string;
		services: Array<{ name: string; tag: string }>;
		ctaTitle: string;
		ctaText: string;
		ctaButton: string;
	};
	about: {
		seoTitle: string;
		background: MediaContent;
		titlePrefix: string;
		titleName: string;
		intro: string[];
		portrait: MediaContent;
		sectionTitle: string;
		sectionText: string;
		facts: Array<{ kicker: string; title: string; text: string }>;
		gearTitle: string;
		gearText: string;
		ctaTitle: string;
		ctaButton: string;
	};
	contact: {
		seoTitle: string;
		titleBefore: string;
		titleAccent: string;
		titleAfter: string;
		intro: string;
		email: string;
		locations: string;
		nameLabel: string;
		namePlaceholder: string;
		emailLabel: string;
		emailPlaceholder: string;
		phoneLabel: string;
		phonePlaceholder: string;
		interestLabel: string;
		interestOptions: string[];
		messageLabel: string;
		messagePlaceholder: string;
		sendButton: string;
		formNotice: string;
		fields: ContactCustomField[];
	};
	blog: {
		seoTitle: string;
		seoDescription: string;
		kicker: string;
		titleBefore: string;
		titleAccent: string;
		intro: string;
		featuredLabel: string;
		readLabel: string;
		recentTitle: string;
		backLabel: string;
		relatedTitle: string;
		notFoundTitle: string;
		notFoundText: string;
		notFoundButton: string;
	};
};

const images = {
	mountains:
		'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85',
	desert:
		'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=82',
	forest:
		'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1800&q=85',
	lake:
		'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=82',
	portrait:
		'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=82',
	portraitTwo:
		'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1400&q=82',
	portraitThree:
		'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=82',
	owl:
		'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=1400&q=82',
	deer:
		'https://images.unsplash.com/photo-1484406566174-9da000fda645?auto=format&fit=crop&w=1400&q=82',
	studio:
		'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=85'
};

export const defaultPageContent: PageContent = {
	global: {
		firstName: 'Ashleigh',
		lastName: 'Darnell',
		homeLabel: 'Home',
		navigation: [...siteNavigation],
		footerTagline:
			'Photography and creative storytelling from Nashville, Tennessee, with roots in West Virginia.',
		footerCtaLabel: 'Work with me',
		footerExploreTitle: 'Explore',
		newsletterTitle: 'Field notes',
		newsletterDescription: 'Occasional stories, recent photographs, and creative notes.',
		newsletterPlaceholder: 'you@example.com',
		newsletterButton: 'Join',
		newsletterInvalid: 'Please enter a valid email.',
		newsletterExisting: 'You’re already on the list.',
		newsletterSuccess: 'Welcome! You’re on the list.',
		adminLabel: 'Admin login'
	},
	home: {
		seoTitle: 'Ashleigh Darnell',
		seoDescription:
			'Photography and creative storytelling by Ashleigh Darnell, based in Nashville, Tennessee and rooted in West Virginia.',
		background: { src: images.mountains, alt: 'Misty mountain landscape' },
		heroLines: ['Wild places,', 'real people,', 'good stories.'],
		intro:
			'Hey! I’m Ashleigh—a photographer and creative storyteller based in Nashville, Tennessee, with roots in West Virginia. Let me show you around.',
		primaryCta: 'Photography',
		secondaryCta: 'Social Media',
		backdrops: [
			{ src: images.portrait, alt: 'Outdoor portrait' },
			{ src: images.owl, alt: 'Wildlife detail' },
			{ src: images.studio, alt: 'Creative studio' },
			{ src: images.desert, alt: 'Editorial landscape' }
		],
		gallery: [
			{ src: images.portraitTwo, alt: 'Portrait story', caption: 'Portrait story' },
			{ src: images.studio, alt: 'Brand story', caption: 'Brand story' },
			{ src: images.portraitThree, alt: 'Social story', caption: 'Social story' }
		],
		createTitle: 'Photography inspired by people, wildlife, and the places that feel like home',
		services: [
			{
				title: 'Photography',
				text: 'Wildlife, landscapes, portraits, and everyday moments captured with care.',
				href: '/photography',
				image: { src: images.deer, alt: 'Wildlife photography' }
			},
			{
				title: 'Social Media',
				text: 'Thoughtful visual content shaped by a background in communications and photography.',
				href: '/social',
				image: { src: images.studio, alt: 'Social media content' }
			}
		],
		aboutTitle: 'Behind the camera',
		aboutText:
			'I’m a wildlife and landscape photographer from West Virginia, now living in Nashville. I love being outside, finding the story in a quiet landscape, and photographing people along the way.',
		aboutLink: 'More about me',
		aboutImage: { src: images.portrait, alt: 'Ashleigh behind the camera' },
		contactTitle: 'Have a story, session, or creative idea in mind?',
		contactButton: 'Get in touch'
	},
	photography: {
		seoTitle: 'Photography - Ashleigh Darnell',
		background: { src: images.forest, alt: 'Sunlit forest' },
		title: 'Photography',
		intro:
			'From Appalachian landscapes and Nashville sunsets to wildlife and portraits, I photograph the places, people, and moments that make me stop and look.',
		categories: ['All', 'Wildlife', 'Portraits', 'Lifestyle', 'Landscape'],
		shots: [
			{ src: images.deer, alt: 'Deer in a field', caption: 'Wildlife', metadata: { filters: ['Wildlife'] } },
			{ src: images.portrait, alt: 'Outdoor portrait', caption: 'Portrait', metadata: { filters: ['Portraits'] } },
			{ src: images.mountains, alt: 'Mountain ridges', caption: 'Appalachia', metadata: { filters: ['Landscape'] } },
			{ src: images.owl, alt: 'Owl on a branch', caption: 'Wildlife', metadata: { filters: ['Wildlife'] } },
			{ src: images.lake, alt: 'Mountain lake', caption: 'Still water', metadata: { filters: ['Landscape'] } },
			{ src: images.portraitTwo, alt: 'Natural light portrait', caption: 'Portrait', metadata: { filters: ['Portraits'] } },
			{ src: images.desert, alt: 'Open landscape', caption: 'On the road', metadata: { filters: ['Lifestyle', 'Landscape'] } },
			{ src: images.forest, alt: 'Forest path', caption: 'In the woods', metadata: { filters: ['Landscape'] } },
			{ src: images.portraitThree, alt: 'Editorial portrait', caption: 'Editorial', metadata: { filters: ['Portraits', 'Lifestyle'] } }
		],
		ctaTitle: 'Ready to step in front of the camera?',
		ctaText: 'Solo, couples, families, weddings, and events are all welcome.',
		ctaButton: 'Book a session'
	},
	social: {
		seoTitle: 'Social Media - Ashleigh Darnell',
		background: { src: images.studio, alt: 'Creative studio' },
		title: 'Social Media',
		intro:
			'Creative content grounded in corporate communications, photography, and an eye for the stories that connect people.',
		backgroundTitle: 'A little background',
		backgroundItems: [
			{ kicker: 'Currently', title: 'Nashville, Tennessee', detail: 'Creating and connecting in Music City.' },
			{ kicker: 'My roots', title: 'West Virginia', detail: 'Born, raised, and shaped by the Mountain State.' },
			{
				kicker: 'My foundation',
				title: 'Belmont University',
				detail: 'Corporate communications, with a creative point of view.'
			}
		],
		contentTitle: 'Selected content',
		reels: [
			{ src: images.portrait, alt: 'Portrait reel', caption: 'Reel 01' },
			{ src: images.studio, alt: 'Studio reel', caption: 'Reel 02' },
			{ src: images.portraitTwo, alt: 'Lifestyle reel', caption: 'Reel 03' },
			{ src: images.desert, alt: 'Travel reel', caption: 'Reel 04' }
		],
		servicesTitle: 'What I bring',
		services: [
			{ name: 'Visual storytelling', tag: 'Photography · Creative direction' },
			{ name: 'Social content', tag: 'Concepting · Content creation' },
			{ name: 'Brand communication', tag: 'Voice · Story · Strategy' }
		],
		ctaTitle: 'Have a story worth sharing?',
		ctaText: 'Let’s turn it into thoughtful, memorable content.',
		ctaButton: 'Work together'
	},
	about: {
		seoTitle: 'About - Ashleigh Darnell',
		background: { src: images.forest, alt: 'Forest background' },
		titlePrefix: 'Hey, I’m',
		titleName: 'Ashleigh',
		intro: [
			'I’m a wildlife and landscape photographer from West Virginia, currently living in Nashville, Tennessee.',
			'I studied corporate communications at Belmont University with a minor in photography. Wildlife and landscapes are my favorite things to capture, but I love photographing people, too.',
			'When I’m not behind the camera, you’ll usually find me outside, cooking or baking, exploring fashion, or catching up with my best friends over coffee.'
		],
		portrait: { src: images.portraitThree, alt: 'Portrait of Ashleigh', caption: 'Ashleigh' },
		sectionTitle: 'A little more about me',
		sectionText:
			'The places I come from, the subjects I’m drawn to, and what you’ll find me doing when the camera is put away.',
		facts: [
			{
				kicker: 'Roots',
				title: 'West Virginia raised',
				text: 'Eighteen years among rolling hills made home, wildlife, and wide-open landscapes central to the way I see.'
			},
			{
				kicker: 'These days',
				title: 'Nashville based',
				text: 'I now call Tennessee home, where I studied corporate communications and photography at Belmont University.'
			},
			{
				kicker: 'Behind the lens',
				title: 'Wild at heart',
				text: 'Wildlife and landscapes will always be favorites—especially owls—but I love photographing people, too.'
			},
			{
				kicker: 'Off duty',
				title: 'Usually outside',
				text: 'Or cooking, baking, thinking about fashion, and catching up with my best friends over coffee.'
			}
		],
		gearTitle: 'What’s in my camera bag?',
		gearText: 'Canon 6D Mark II · Sigma 150–600mm · Canon 50mm f/1.8',
		ctaTitle: 'Let’s get to know one another',
		ctaButton: 'Say hello'
	},
	contact: {
		seoTitle: 'Contact - Ashleigh Darnell',
		titleBefore: 'Let’s create',
		titleAccent: 'something',
		titleAfter: 'together',
		intro:
			'Tell me about the session, story, or creative project you have in mind. I’d love to hear from you.',
		email: 'ashleighdarnell23@gmail.com',
		locations: 'Nashville, Tennessee · Lewisburg, West Virginia',
		nameLabel: 'Name',
		namePlaceholder: 'Your name',
		emailLabel: 'Email',
		emailPlaceholder: 'you@example.com',
		phoneLabel: 'Phone number (optional)',
		phonePlaceholder: '(555) 123-4567',
		interestLabel: 'I’m interested in',
		interestOptions: ['Photography', 'Social Media', 'Something else'],
		messageLabel: 'Message',
		messagePlaceholder: 'Tell me about your session or project...',
		sendButton: 'Send',
		formNotice: 'Your message will be sent directly to Ashleigh.',
		fields: [
			{
				id: 'phone',
				type: 'phone',
				label: 'Phone number (optional)',
				placeholder: '(555) 123-4567',
				required: false,
				options: []
			},
			{
				id: 'interest',
				type: 'select',
				label: 'I’m interested in',
				placeholder: '',
				required: true,
				options: ['Photography', 'Social Media', 'Something else']
			}
		]
	},
	blog: {
		seoTitle: 'Journal - Ashleigh Darnell',
		seoDescription: 'Field notes, photography stories, and creative ideas from Ashleigh Darnell.',
		kicker: 'The journal',
		titleBefore: 'Stories from behind',
		titleAccent: 'the lens',
		intro: 'Field notes, thoughtful advice, and glimpses into the people and places I photograph.',
		featuredLabel: 'Featured',
		readLabel: 'Read the story',
		recentTitle: 'Recent stories',
		backLabel: 'Journal',
		relatedTitle: 'Keep reading',
		notFoundTitle: 'Story not found',
		notFoundText: 'This post may still be a draft or may have moved.',
		notFoundButton: 'Back to the journal'
	}
};

export interface ContentStorage<T> {
	load(): T;
	save(value: T): void;
}

function legacyContactFields(contact: Partial<PageContent['contact']>): ContactCustomField[] {
	return [
		{
			id: 'phone',
			type: 'phone',
			label: contact.phoneLabel || defaultPageContent.contact.phoneLabel,
			placeholder: contact.phonePlaceholder || defaultPageContent.contact.phonePlaceholder,
			required: false,
			options: []
		},
		{
			id: 'interest',
			type: 'select',
			label: contact.interestLabel || defaultPageContent.contact.interestLabel,
			placeholder: '',
			required: true,
			options:
				contact.interestOptions?.filter((option) => typeof option === 'string') ||
				defaultPageContent.contact.interestOptions
		}
	];
}

export function normalizeContactFields(fields: unknown): ContactCustomField[] {
	if (!Array.isArray(fields)) return [];
	const validTypes: ContactFieldType[] = ['text', 'textarea', 'phone', 'select', 'checkbox'];
	const seen = new Set<string>();

	return fields.slice(0, 20).flatMap((value, index) => {
		if (!value || typeof value !== 'object') return [];
		const candidate = value as Partial<ContactCustomField>;
		const baseId =
			typeof candidate.id === 'string'
				? candidate.id.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 48)
				: '';
		let id = baseId || `field-${index + 1}`;
		while (seen.has(id)) id = `${id}-${index + 1}`;
		seen.add(id);
		const type = validTypes.includes(candidate.type as ContactFieldType)
			? (candidate.type as ContactFieldType)
			: 'text';
		const options =
			type === 'select' && Array.isArray(candidate.options)
				? candidate.options
						.filter((option): option is string => typeof option === 'string')
						.map((option) => option.trim().slice(0, 120))
						.filter(Boolean)
						.slice(0, 30)
				: [];

		return [
			{
				id,
				type,
				label:
					typeof candidate.label === 'string' && candidate.label.trim()
						? candidate.label.trim().slice(0, 120)
						: `Field ${index + 1}`,
				placeholder:
					typeof candidate.placeholder === 'string'
						? candidate.placeholder.trim().slice(0, 160)
						: '',
				required: candidate.required === true,
				options
			}
		];
	});
}

export function normalizePageContent(value: PageContent): PageContent {
	const contact = value?.contact ?? defaultPageContent.contact;
	const rawFields =
		Array.isArray(contact.fields)
			? contact.fields
			: legacyContactFields(contact);
	const fields = normalizeContactFields(rawFields);

	return {
		...structuredClone(defaultPageContent),
		...value,
		contact: {
			...structuredClone(defaultPageContent.contact),
			...contact,
			fields: structuredClone(fields)
		}
	};
}

class LocalContentStorage<T> implements ContentStorage<T> {
	constructor(
		private key: string,
		private defaults: T
	) {}

	load() {
		if (!browser) return structuredClone(this.defaults);
		const saved = localStorage.getItem(this.key);
		if (!saved) return structuredClone(this.defaults);
		try {
			const value = JSON.parse(saved) as T;
			return this.key === 'ashleigh.page-content'
				? (normalizePageContent(value as PageContent) as T)
				: value;
		} catch {
			return structuredClone(this.defaults);
		}
	}

	save(value: T) {
		if (browser) localStorage.setItem(this.key, JSON.stringify(value));
	}
}

function createContentStore<T>(storage: ContentStorage<T>): Writable<T> {
	const store = writable(storage.load());
	if (browser) store.subscribe((value) => storage.save(value));
	return store;
}

export const pageContent = createContentStore(
	new LocalContentStorage<PageContent>('ashleigh.page-content', defaultPageContent)
);

export const resetPageContent = () => pageContent.set(structuredClone(defaultPageContent));
