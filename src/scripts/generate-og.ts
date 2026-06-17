/**
 * Generates public/og.jpg — branded Open Graph image (1200×630).
 * Run via `npm run generate:og` or automatically before `npm run build`.
 */
import sharp from 'sharp';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

/** Hero source — keep in sync with src/pages/index.astro */
export const HERO_IMAGE_REL = 'src/assets/images/hero/PXL_20260516_084223542.jpg';

const HERO_IMAGE = join(ROOT, HERO_IMAGE_REL);
const OUTPUT = join(ROOT, 'public/og.jpg');

const WIDTH = 1200;
const HEIGHT = 630;
const ASPECT = WIDTH / HEIGHT;

const BRAND_NAME = 'SIR LUDWIG';
const BRAND_TAGLINE = 'by Flying Royals';
const BRAND_DESCRIPTOR = 'Tuxedo Großpudel';

const CREAM = '#F4F0E8';
const BROWN = '#4A3428';
const BLACK = '#1C1C1C';
const APRICOT = '#D9A066';

/** Vertical focal point — matches hero object-position (center 32%). */
const FOCAL_Y_RATIO = 0.32;

function buildOverlaySvg(): string {
	const padX = 72;
	const padBottom = 76;

	const yDescriptor = HEIGHT - padBottom;
	const yTagline = yDescriptor - 40;
	const yBrand = yTagline - 54;
	const yLine = yBrand - 30;

	return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${CREAM}" stop-opacity="0.97"/>
      <stop offset="42%" stop-color="${CREAM}" stop-opacity="0.88"/>
      <stop offset="68%" stop-color="${CREAM}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${CREAM}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="760" height="${HEIGHT}" fill="url(#fade)"/>
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
  >${BRAND_DESCRIPTOR}</text>
</svg>`;
}

async function cropHeroPhoto(): Promise<Buffer> {
	const meta = await sharp(HERO_IMAGE).metadata();
	const width = meta.width ?? 0;
	const height = meta.height ?? 0;

	if (!width || !height) {
		throw new Error(`Could not read dimensions from ${HERO_IMAGE}`);
	}

	let cropWidth = Math.round(height * ASPECT);
	let cropHeight = height;

	if (cropWidth > width) {
		cropWidth = width;
		cropHeight = Math.round(width / ASPECT);
	}

	const focalY = height * FOCAL_Y_RATIO;
	const left = width - cropWidth;
	const top = Math.round(Math.max(0, Math.min(focalY - cropHeight / 2, height - cropHeight)));

	return sharp(HERO_IMAGE)
		.extract({ left, top, width: cropWidth, height: cropHeight })
		.resize(WIDTH, HEIGHT, { fit: 'fill' })
		.toBuffer();
}

async function generateOgImage(): Promise<void> {
	const photo = await cropHeroPhoto();
	const overlay = Buffer.from(buildOverlaySvg());

	await sharp(photo)
		.composite([{ input: overlay, top: 0, left: 0 }])
		.jpeg({ quality: 88, mozjpeg: true })
		.toFile(OUTPUT);

	const output = await sharp(OUTPUT).metadata();
	console.log(`OG image: ${OUTPUT} (${output.width}×${output.height})`);
}

generateOgImage().catch((error: unknown) => {
	console.error('Failed to generate OG image:', error);
	process.exit(1);
});
