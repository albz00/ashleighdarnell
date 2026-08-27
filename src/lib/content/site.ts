import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type PostStatus = 'draft' | 'published';
export type CampaignStatus = 'draft' | 'sent';
export type BannerTone = 'coral' | 'teal' | 'violet' | 'marigold';
export type EffectIntensity = 'subtle' | 'medium' | 'celebration';
export type EffectId =
	| 'auto'
	| 'none'
	| 'snow'
	| 'pumpkins'
	| 'thanksgiving'
	| 'easter'
	| 'hearts'
	| 'summer';
export type EffectSettings = {
	enabled: boolean;
	intensity: EffectIntensity;
	effect: EffectId;
};
export type ThemeId =
	| 'meadow'
	| 'sunset'
	| 'coast'
	| 'midnight'
	| 'halloween'
	| 'christmas'
	| 'thanksgiving'
	| 'easter'
	| 'valentine'
	| 'summer';

export type BlogPost = {
	id: string;
	title: string;
	slug: string;
	excerpt: string;
	body: string;
	category: string;
	cover: string;
	alt: string;
	coverCaption?: string;
	coverRotation?: string[];
	coverRotationSeconds?: number;
	publishedAt: string;
	status: PostStatus;
	featured: boolean;
};

export type Subscriber = {
	id: string;
	name: string;
	email: string;
	joinedAt: string;
	status: 'active' | 'unsubscribed';
};

export type Campaign = {
	id: string;
	subject: string;
	preview: string;
	body: string;
	status: CampaignStatus;
	updatedAt: string;
};

export type SiteBanner = {
	id: string;
	message: string;
	linkLabel: string;
	link: string;
	tone: BannerTone;
	active: boolean;
};

export const themeOptions: Array<{
	id: ThemeId;
	name: string;
	description: string;
	colors: string[];
}> = [
	{
		id: 'meadow',
		name: 'Wild Meadow',
		description: 'The original pine, coral, marigold and violet palette.',
		colors: ['#f4f8f4', '#1e3b2f', '#ff4d6d', '#0e9384']
	},
	{
		id: 'sunset',
		name: 'Desert Sunset',
		description: 'Warm sand, terracotta, ochre and deep aubergine.',
		colors: ['#fff8ed', '#402d34', '#e86445', '#c28b24']
	},
	{
		id: 'coast',
		name: 'Blue Coast',
		description: 'Crisp foam, navy, sea glass and sunlit yellow.',
		colors: ['#f4fafb', '#17324d', '#ef6f61', '#168a91']
	},
	{
		id: 'midnight',
		name: 'Midnight Bloom',
		description: 'Editorial plum, soft lavender, and deep botanical accents.',
		colors: ['#fbf7fc', '#211926', '#a72f56', '#236e64']
	},
	{
		id: 'halloween',
		name: 'Halloween Night',
		description: 'Moonlit cream, inky plum, pumpkin orange, and witchy purple.',
		colors: ['#fff8e8', '#211923', '#b7460b', '#496b20']
	},
	{
		id: 'christmas',
		name: 'Christmas Hearth',
		description: 'Evergreen, cranberry, warm cream, and touches of gold.',
		colors: ['#fff8e8', '#173c2b', '#bd2845', '#d4a72c']
	},
	{
		id: 'thanksgiving',
		name: 'Thanksgiving Table',
		description: 'Harvest cream, chestnut, maple red, and golden squash.',
		colors: ['#fff6e5', '#4b2e24', '#b64b31', '#d89424']
	},
	{
		id: 'easter',
		name: 'Easter Garden',
		description: 'Fresh lilac, robin’s-egg blue, soft pink, and spring green.',
		colors: ['#fffaff', '#40364f', '#ee7fa2', '#68a99c']
	},
	{
		id: 'valentine',
		name: 'Valentine',
		description: 'Romantic ivory, cherry red, blush pink, and dark chocolate.',
		colors: ['#fff8f7', '#451f2a', '#d92f55', '#b95d80']
	},
	{
		id: 'summer',
		name: 'Summer Citrus',
		description: 'Sun-washed cream, ocean teal, watermelon, and lemon.',
		colors: ['#fffcec', '#16434a', '#ff5d67', '#12a49a']
	}
];

const seedPosts: BlogPost[] = [
	{
		id: 'post-1',
		title: 'A slow morning in the Smokies',
		slug: 'slow-morning-smokies',
		excerpt: 'Fog, field notes, and the quiet patience behind a favorite landscape frame.',
		body: `The trail was still blue with early light when I reached the overlook. The mountains appeared one ridge at a time, each softened by a thin layer of fog.

I used to think a good photograph began with finding the right view. More often, it begins with staying put. I watched the light move for nearly an hour before lifting my camera.

That morning was a reminder to leave room for the place itself to set the pace. The final frame is quiet, but it holds the whole experience for me: cold hands, birds beginning to call, and the first warm patch of sun.`,
		category: 'Field Notes',
		cover:
			'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85',
		alt: 'Misty mountain ridges at sunrise',
		publishedAt: '2026-08-18',
		status: 'published',
		featured: true
	},
	{
		id: 'post-2',
		title: 'How I prepare for a portrait session',
		slug: 'prepare-portrait-session',
		excerpt: 'A simple guide to showing up relaxed, comfortable, and ready to make something honest.',
		body: `The best portrait sessions feel more like spending time together than performing for a camera. We start with a conversation about what you love, where you feel comfortable, and how you hope the photographs will feel.

Choose clothes that let you move and still feel like yourself. Texture photographs beautifully, and a small palette of complementary colors keeps a group connected without looking overly coordinated.

There is no need to practice poses. I will offer gentle direction and keep us moving, talking, and making room for the in-between moments.`,
		category: 'Portraits',
		cover:
			'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=85',
		alt: 'Portrait of a woman outdoors in soft light',
		publishedAt: '2026-08-02',
		status: 'published',
		featured: false
	},
	{
		id: 'post-3',
		title: 'Three lessons from photographing wildlife',
		slug: 'wildlife-lessons',
		excerpt: 'Why distance, attention, and respect matter more than getting the shot.',
		body: `Wildlife photography has taught me to pay attention before I reach for the camera. Behavior tells you when an animal is comfortable, curious, or ready for more space.

Long lenses are not only creative tools; they help us keep a responsible distance. No image is worth changing an animal’s path or interrupting its routine.

The most memorable encounters are often the least dramatic. An owl turning toward a sound or a deer pausing at the edge of a field can hold an entire story.`,
		category: 'Wildlife',
		cover:
			'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=1600&q=85',
		alt: 'Owl perched on a branch',
		publishedAt: '2026-07-14',
		status: 'published',
		featured: false
	},
	{
		id: 'post-4',
		title: 'A colorful Nashville brand story',
		slug: 'nashville-brand-story',
		excerpt: 'Planning an energetic visual library for a small creative business.',
		body: `A strong brand session should create more than one hero image. We planned this day around a complete visual library: portraits, working details, environmental scenes, and plenty of negative space for words.

By building a loose shot list and leaving time to improvise, we created a collection that felt consistent without becoming repetitive.`,
		category: 'Creative Work',
		cover:
			'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85',
		alt: 'Bright creative studio with plants',
		publishedAt: '2026-08-25',
		status: 'draft',
		featured: false
	}
];

const seedSubscribers: Subscriber[] = [
	{
		id: 'sub-1',
		name: 'Maya Thompson',
		email: 'maya@example.com',
		joinedAt: '2026-08-21',
		status: 'active'
	},
	{
		id: 'sub-2',
		name: 'Luke Bennett',
		email: 'luke@example.com',
		joinedAt: '2026-08-17',
		status: 'active'
	},
	{
		id: 'sub-3',
		name: 'Sofia Ramirez',
		email: 'sofia@example.com',
		joinedAt: '2026-08-03',
		status: 'unsubscribed'
	}
];

const seedCampaigns: Campaign[] = [
	{
		id: 'campaign-1',
		subject: 'August field notes',
		preview: 'A misty morning, a new story, and what is coming next.',
		body: 'Hello from Nashville! This month I am sharing a favorite morning in the Smokies and a few photographs from the road.',
		status: 'draft',
		updatedAt: '2026-08-24'
	}
];

const seedBanners: SiteBanner[] = [
	{
		id: 'banner-1',
		message: 'Now booking autumn portrait sessions in Nashville',
		linkLabel: 'See availability',
		link: '/contact',
		tone: 'coral',
		active: true
	},
	{
		id: 'banner-2',
		message: 'New on the journal: a slow morning in the Smokies',
		linkLabel: 'Read the story',
		link: '/blog/slow-morning-smokies',
		tone: 'teal',
		active: false
	}
];

function persisted<T>(key: string, initial: T) {
	const store = writable<T>(initial);

	if (browser) {
		const saved = localStorage.getItem(key);
		if (saved) {
			try {
				store.set(JSON.parse(saved) as T);
			} catch {
				localStorage.removeItem(key);
			}
		}
		store.subscribe((value) => localStorage.setItem(key, JSON.stringify(value)));
	}

	return store;
}

export const posts = persisted('ashleigh.posts', seedPosts);
export const subscribers = persisted('ashleigh.subscribers', seedSubscribers);
export const campaigns = persisted('ashleigh.campaigns', seedCampaigns);
export const banners = persisted('ashleigh.banners', seedBanners);
export const selectedTheme = persisted<ThemeId>('ashleigh.theme', 'meadow');
export const effectSettings = persisted<EffectSettings>('ashleigh.effects', {
	enabled: true,
	intensity: 'medium',
	effect: 'auto'
});

export const newId = (prefix: string) =>
	`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const slugify = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
