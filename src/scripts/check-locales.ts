import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { siteUrl } from '../config/site';
import { routes, translator, formatDate } from '../i18n';

const t = translator('en');
const decode = (value: string) => value.replace(/&#(x[\da-f]+|\d+);/gi, (_, code: string) =>
	String.fromCodePoint(code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code)))
	.replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
const normalize = (value: string) => decode(value).replace(/\s+/g, ' ').trim();
const textNodes = (html: string) => html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<!--[\s\S]*?-->/g, '')
	.split(/<[^>]*>/).map(normalize).filter(Boolean);
const htmlFile = (path: string) => path === '/404/' ? 'dist/404.html' : `dist${path}index.html`;

// A newly added German page must have an English route in the same deployment.
for (const file of await readdir('src/pages', { recursive: true })) {
	if (!file.endsWith('.astro') || file.startsWith('en/')) continue;
	const path = file === 'index.astro' ? '/' : `/${file.replace(/\.astro$/, '').replace(/\/index$/, '')}/`;
	assert.ok(routes.some(([de]) => de === path), `Missing English route for ${path}`);
}

for (const [dePath, enPath] of routes) {
	const [de, en] = await Promise.all([readFile(htmlFile(dePath), 'utf8'), readFile(htmlFile(enPath), 'utf8')]);
	assert.match(de, /<html[^>]*lang="de"/);
	assert.match(en, /<html[^>]*lang="en"/);
	const englishText = textNodes(en).join(' ');
	for (const text of textNodes(de)) {
		if (text === 'Deutsch' || text === 'English') continue;
		const expected = /^\d{2}\.\d{2}\.\d{4}$/.test(text) ? formatDate(text, 'en') : /^[\d,.\s%–]+$/.test(text) ? text.replace(/,/g, '.').replace(/\s+%/g, '%') : t(text);
		assert.ok(englishText.includes(expected), `Untranslated content on ${enPath}: ${text}`);
	}
	assert.ok(en.includes(`hreflang="de" href="${siteUrl}${dePath}"`));
	assert.ok(en.includes(`hreflang="en" href="${siteUrl}${enPath}"`));
	assert.ok(en.includes(`rel="canonical" href="${siteUrl}${enPath}"`));
	// Every existing page link in English must stay within the English version.
	for (const [, href] of en.matchAll(/<a\b[^>]*href="([^"?#]*)/g)) {
		assert.ok(!routes.some(([path]) => path === href), `German page link on ${enPath}: ${href}`);
	}
}
await access('dist/og-en.jpg');
console.log(`Verified ${routes.length} German/English page pairs, translated content, links and SEO metadata.`);
