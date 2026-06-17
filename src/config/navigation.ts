export interface NavItem {
	label: string;
	href: string;
}

export const mainNavigation: NavItem[] = [
	{ label: 'Home', href: '/' },
	{ label: 'Ludwig', href: '/ludwig' },
	{ label: 'Stammbaum', href: '/stammbaum' },
	{ label: 'Gesundheit', href: '/gesundheit' },
	{ label: 'Galerie', href: '/galerie' },
	{ label: 'Nachzucht', href: '/nachzucht' },
	{ label: 'Deckanfrage', href: '/deckanfrage' },
];
