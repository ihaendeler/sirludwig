export interface SocialLinks {
	instagram: string;
	facebook: string;
	youtube: string;
}

export interface ContactInfo {
	email: string;
	phone: string;
	address: string;
}

export interface SiteConfig {
	name: string;
	url: string;
	brandName: string;
	brandTagline: string;
	brandMonogram: string;
	heroSubtitle: string;
	social: SocialLinks;
	contact: ContactInfo;
}

/** Produktions-URL — später auf https://sir-ludwig.de umstellen. */
export const siteUrl = 'https://sirludwig.pages.dev';

export const siteName = 'SIR LUDWIG';

export const siteConfig: SiteConfig = {
	name: 'Sir Ludwig',
	url: siteUrl,
	brandName: 'SIR LUDWIG',
	brandTagline: 'by Flying Royals',
	brandMonogram: 'SL',
	heroSubtitle: 'Tuxedo Großpudel · by Flying Royals',
	social: {
		instagram: 'https://instagram.com/sir.ludwig_flyingroyals',
		facebook: '',
		youtube: '',
	},
	contact: {
		email: '',
		phone: '',
		address: '',
	},
};

export const defaultTitle = `${siteConfig.brandName} — ${siteConfig.heroSubtitle}`;

export const defaultDescription =
	'Sir Ludwig — Tuxedo Großpudel by Flying Royals. Dokumentation von Abstammung, Entwicklung und Gesundheitsüberwachung.';

export const defaultOgImage = '/og.jpg';

export function getCanonical(path: string): string {
	return new URL(path, siteUrl).href;
}

export function getOgImageUrl(imagePath: string = defaultOgImage): string {
	return new URL(imagePath, siteUrl).href;
}
