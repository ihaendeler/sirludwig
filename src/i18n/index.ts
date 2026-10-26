import english from './en.json';

export type Locale = 'de' | 'en';
export const routes = [
	['/', '/en/'],
	['/ludwig/', '/en/ludwig/'],
	['/stammbaum/', '/en/pedigree/'],
	['/gesundheit/', '/en/health/'],
	['/galerie/', '/en/gallery/'],
	['/nachzucht/', '/en/offspring/'],
	['/farbrechner/', '/en/colour-calculator/'],
	['/deckanfrage/', '/en/stud-enquiry/'],
	['/empfehlungen/', '/en/recommendations/'],
	['/404/', '/en/404/'],
] as const;

export function getLocale(path: string): Locale {
	return path === '/en' || path.startsWith('/en/') ? 'en' : 'de';
}

export function localizedHref(href: string | undefined, locale: Locale): string | undefined {
	if (!href || !href.startsWith('/') || href.startsWith('//')) return href;
	const [, path, suffix = ''] = href.match(/^([^?#]*)(.*)$/)!;
	const normalized = path === '/' ? '/' : `${path.replace(/\/$/, '')}/`;
	const pair = routes.find(([de, en]) => de === normalized || en === normalized);
	return pair ? pair[locale === 'en' ? 1 : 0] + suffix : href;
}

const dictionary: Record<string, string> = english;
const englishValues = new Set(Object.values(dictionary));
const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

/** Shared templates fail the build if an English translation is missing. */
export function translator(locale: Locale) {
	return function t<T>(value: T): T | string {
		if (locale === 'de' || typeof value !== 'string' || !value.trim()) return value;
		const key = normalize(value);
		if (Object.hasOwn(dictionary, key)) return dictionary[key];
		if (englishValues.has(key) || !/[A-Za-zÄÖÜäöüß]/.test(key)) return value;
		throw new Error(`Missing English translation: ${key}`);
	};
}

export function formatDate(value: string, locale: Locale): string {
	if (locale === 'de') return value;
	const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
	if (!match) return value;
	return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
		.format(new Date(`${match[3]}-${match[2]}-${match[1]}T00:00:00Z`));
}
