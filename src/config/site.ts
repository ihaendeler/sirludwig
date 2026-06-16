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
	social: SocialLinks;
	contact: ContactInfo;
}

export const siteConfig: SiteConfig = {
	name: '',
	url: '',
	brandName: '',
	social: {
		instagram: '',
		facebook: '',
		youtube: '',
	},
	contact: {
		email: '',
		phone: '',
		address: '',
	},
};

/** Fallback bis `siteConfig.url` gesetzt ist. */
export const siteUrl = siteConfig.url || 'https://sirludwig.pages.dev';

export function getCanonical(path: string): string {
	return new URL(path, siteUrl).href;
}
