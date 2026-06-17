/**
 * Generates PNG/ICO app icons from public/favicon.svg.
 * Run via `npm run generate:icons` or automatically before `npm run build`.
 */
import sharp from 'sharp';
import toIco from 'to-ico';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SVG_SOURCE = join(ROOT, 'public/favicon.svg');
const PUBLIC_DIR = join(ROOT, 'public');

const PNG_OUTPUTS = [
	{ size: 16, filename: 'favicon-16x16.png' },
	{ size: 32, filename: 'favicon-32x32.png' },
	{ size: 180, filename: 'apple-touch-icon.png' },
	{ size: 192, filename: 'android-chrome-192x192.png' },
	{ size: 512, filename: 'android-chrome-512x512.png' },
] as const;

const MANIFEST = {
	name: 'SIR LUDWIG',
	short_name: 'SIR LUDWIG',
	description: 'Sir Ludwig — Tuxedo Großpudel by Flying Royals',
	icons: [
		{
			src: '/android-chrome-192x192.png',
			sizes: '192x192',
			type: 'image/png',
		},
		{
			src: '/android-chrome-512x512.png',
			sizes: '512x512',
			type: 'image/png',
		},
	],
	theme_color: '#F4F0E8',
	background_color: '#F4F0E8',
	display: 'standalone',
};

async function renderPng(size: number): Promise<Buffer> {
	const svg = readFileSync(SVG_SOURCE);
	return sharp(svg).resize(size, size).png().toBuffer();
}

async function generateIcons(): Promise<void> {
	const svg = readFileSync(SVG_SOURCE);
	if (!svg.length) {
		throw new Error(`Missing or empty favicon source: ${SVG_SOURCE}`);
	}

	const rendered = new Map<number, Buffer>();

	for (const { size, filename } of PNG_OUTPUTS) {
		const buffer = await renderPng(size);
		rendered.set(size, buffer);
		writeFileSync(join(PUBLIC_DIR, filename), buffer);
		console.log(`Icon: public/${filename} (${size}×${size})`);
	}

	const ico = await toIco([rendered.get(16)!, rendered.get(32)!]);
	writeFileSync(join(PUBLIC_DIR, 'favicon.ico'), ico);
	console.log('Icon: public/favicon.ico (16, 32)');

	writeFileSync(
		join(PUBLIC_DIR, 'site.webmanifest'),
		`${JSON.stringify(MANIFEST, null, 2)}\n`,
	);
	console.log('Manifest: public/site.webmanifest');
}

generateIcons().catch((error: unknown) => {
	console.error('Failed to generate favicons:', error);
	process.exit(1);
});
