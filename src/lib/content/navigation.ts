export type SiteNavItem = { label: string; href: string };

export const siteNavigation: SiteNavItem[] = [
	{ href: '/photography', label: 'Photography' },
	{ href: '/social', label: 'Social Media' },
	{ href: '/blog', label: 'Blog' },
	{ href: '/about', label: 'About' },
	{ href: '/contact', label: 'Contact' }
];

export const publicPaths = ['/', ...siteNavigation.map((item) => item.href)];
