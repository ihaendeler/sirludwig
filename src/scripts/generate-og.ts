/**
 * Generates public/og.jpg — branded Open Graph image (1200×630).
 * Run via `npm run generate:og` or automatically before `npm run build`.
 */
import sharp from 'sharp';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

/** Hero source — keep in sync with src/pages/index.astro */
export const HERO_IMAGE_REL = 'src/assets/images/autumn/blickkontakt.jpg';

const HERO_IMAGE = join(ROOT, HERO_IMAGE_REL);
const OUTPUT = join(ROOT, 'public/og.jpg');

const WIDTH = 1200;
const HEIGHT = 630;

const BRAND_NAME = 'SIR LUDWIG';
const BRAND_TAGLINE = 'by FlyingRoyals von Reckewitz';
const BRAND_DESCRIPTOR = 'Tuxedo Großpudel';

const CREAM = '#F4F0E8';
const BROWN = '#4A3428';
const BLACK = '#1C1C1C';
const APRICOT = '#D9A066';


function buildOverlaySvg(descriptor = BRAND_DESCRIPTOR): string {
	const padX = 72;
	const padBottom = 76;

	const yDescriptor = HEIGHT - padBottom;
	const yTagline = yDescriptor - 40;
	const yBrand = yTagline - 54;
	const yLine = yBrand - 30;

	return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${padX}" y="${yLine}" width="40" height="2" fill="${APRICOT}"/>
  <text
    x="${padX}"
    y="${yBrand}"
    font-family="Georgia, 'Times New Roman', Times, serif"
    font-size="54"
    font-weight="400"
    fill="${BLACK}"
    letter-spacing="2.5"
  >${BRAND_NAME}</text>
  <text
    x="${padX}"
    y="${yTagline}"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-size="16"
    font-weight="500"
    fill="${BROWN}"
    letter-spacing="4"
    opacity="0.82"
  >${BRAND_TAGLINE}</text>
  <text
    x="${padX}"
    y="${yDescriptor}"
    font-family="Georgia, 'Times New Roman', Times, serif"
    font-size="23"
    font-weight="400"
    font-style="italic"
    fill="${BROWN}"
    opacity="0.76"
  >${descriptor}</text>
</svg>`;
}

async function cropHeroPhoto(): Promise<Buffer> {
	// Keep the entire portrait next to the brand instead of cropping it to a banner.
	const portrait = await sharp(HERO_IMAGE).resize({ height: HEIGHT }).toBuffer();
	const { width = 0 } = await sharp(portrait).metadata();
	return sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: CREAM } })
		.composite([{ input: portrait, top: 0, left: WIDTH - width }]).png().toBuffer();
}

async function generateOgImage(): Promise<void> {
	const photo = await cropHeroPhoto();
	for (const [file, descriptor] of [[OUTPUT, BRAND_DESCRIPTOR], [join(ROOT, 'public/og-en.jpg'), 'Tuxedo Standard Poodle']]) {
		const overlay = Buffer.from(buildOverlaySvg(descriptor));
		await sharp(photo)
			.composite([{ input: overlay, top: 0, left: 0 }])
			.jpeg({ quality: 88, mozjpeg: true })
			.toFile(file);
		const output = await sharp(file).metadata();
		console.log(`OG image: ${file} (${output.width}×${output.height})`);
	}
}

generateOgImage().catch((error: unknown) => {
	console.error('Failed to generate OG image:', error);
	process.exit(1);
});
