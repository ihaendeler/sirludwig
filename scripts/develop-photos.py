"""Rebuild selected JPEGs from untouched originals using conventional photo adjustments.

Requires Pillow and numpy. Run from any directory; originals live in ../Ludwig.
No generative tools, object edits, saturation changes or metadata copied from sources.
"""
from pathlib import Path
import argparse
import hashlib
import io
import json

import numpy as np
from PIL import Image, ImageCms, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT.parent / 'Ludwig'
MANIFEST = ROOT / 'docs/foto-provenienz.json'
DEST = ROOT / 'src/assets/images/autumn'
SRGB = ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
LUMA = np.array([.2126, .7152, .0722], dtype=np.float32)
SETTINGS = dict(version=2, date='2026-11-03', contrast_exponent=1.08,
                additional_warmth_linear_rgb=[1.015, 1.0, .980],
                neutral_chroma_threshold=.12, full_warmth_chroma=.42,
                saturation=1.0, hue_rotation=0,
                sharpening=dict(radius=.75, percent=18, threshold=3),
                export_quality=93,
                note='Rebuilt from originals, retaining individual base exposure/WB. '
                     'Gentle luminance-only S curve; additional warmth fades out in '
                     'neutral colours and highlights. No selective fur recolouring, '
                     'no generative processing, no watermark. Existing crop preserved.')


def decode(a):
    return np.where(a <= .04045, a / 12.92, ((a + .055) / 1.055) ** 2.4)


def encode(a):
    return np.where(a <= .0031308, a * 12.92,
                    1.055 * np.maximum(a, 0) ** (1 / 2.4) - .055)


def load(path):
    with Image.open(path) as source:
        icc = source.info.get('icc_profile')
        image = ImageOps.exif_transpose(source).convert('RGB')
        if icc:
            image = ImageCms.profileToProfile(image,
                ImageCms.ImageCmsProfile(io.BytesIO(icc)),
                ImageCms.ImageCmsProfile(io.BytesIO(SRGB)), outputMode='RGB')
        return image


def develop(image, recipe, adjustments=None):
    adjustments = adjustments or {}
    a = decode(np.asarray(image, dtype=np.float32) / 255)
    wb = np.array(recipe['wb'], dtype=np.float32)
    wb *= np.array(adjustments.get('wb_multiplier', [1, 1, 1]), dtype=np.float32)
    a *= wb * 2 ** (recipe['ev'] + adjustments.get('ev_offset', 0))
    lum = a @ LUMA
    target = lum + recipe['shadows'] * (1 - np.exp(-lum / .025)) * np.exp(-lum / .22)
    target += .018 * target * (1 - target) * (2 * target - 1)
    target -= recipe['highlights'] * np.maximum((target - .5) / .5, 0) ** 2
    a *= (target / np.maximum(lum, 1e-7))[..., None]
    a /= np.maximum(np.max(a, axis=2, keepdims=True), 1)

    # Protect neutral white fur and bright highlights from the extra warmth.
    maximum = np.max(a, axis=2)
    chroma = (maximum - np.min(a, axis=2)) / np.maximum(maximum, 1e-7)
    weight = np.clip((chroma - .12) / .30, 0, 1)
    weight *= 1 - np.clip((maximum - .55) / .40, 0, 1)
    delta = np.array(SETTINGS['additional_warmth_linear_rgb'], dtype=np.float32) - 1
    a *= 1 + weight[..., None] * delta

    # Monotonic S curve changes brightness, preserving RGB ratios and detail.
    lum = a @ LUMA
    perceptual = np.clip(encode(lum), 0, 1)
    contrast = adjustments.get('contrast_exponent', SETTINGS['contrast_exponent'])
    raised = perceptual ** contrast
    curved = raised / np.maximum(raised + (1 - perceptual) ** contrast, 1e-7)
    target = decode(curved)
    a *= (target / np.maximum(lum, 1e-7))[..., None]
    a /= np.maximum(np.max(a, axis=2, keepdims=True), 1)
    result = Image.fromarray(np.uint8(np.clip(encode(a), 0, 1) * 255 + .5))
    y, cb, cr = result.convert('YCbCr').split()
    y = y.filter(ImageFilter.UnsharpMask(**SETTINGS['sharpening']))
    return Image.merge('YCbCr', (y, cb, cr)).convert('RGB')


def save(image, path, quality=93):
    image.save(path, quality=quality, subsampling=0, icc_profile=SRGB, optimize=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--only', nargs='+', help='Rebuild only these asset filenames')
    parser.add_argument('--review-name', default='Referenzlook-02')
    args = parser.parse_args()
    review = ROOT.parent / 'Website-Vorschau' / args.review_name
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    entries = [entry for entry in manifest['files'] if not args.only or entry['asset'] in args.only]
    if args.only:
        assert {entry['asset'] for entry in entries} == set(args.only), 'Unknown photo asset'
    review.mkdir(parents=True, exist_ok=True)
    (review / 'Vorher').mkdir(exist_ok=True)
    font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 22)
    pairs = []
    sources = {}
    for entry in entries:
        path = SOURCES / entry['source']
        assert hashlib.sha256(path.read_bytes()).hexdigest() == entry['source_sha256'], path
        sources[path] = entry['source_sha256']
        before = review / 'Vorher' / entry['asset']
        if not before.exists():
            before.write_bytes((DEST / entry['asset']).read_bytes())
        edited = develop(load(path), entry['recipe'], entry.get('development_adjustments'))
        if 'crop_pixels' in entry:
            edited = edited.crop(entry['crop_pixels'])
        save(edited, DEST / entry['asset'])
        with Image.open(DEST / entry['asset']) as check:
            assert check.size == edited.size
            assert check.info.get('icc_profile') and not check.getexif()
            check.verify()
        if 'crop_pixels' not in entry:
            pair = Image.new('RGB', (800, 590), '#f4f0e8')
            draw = ImageDraw.Draw(pair)
            draw.text((12, 8), entry['asset'], font=font, fill='#332b22')
            for x, image, label in [(0, load(before), 'Bisher'), (400, edited, 'Wärmer / mehr Kontrast')]:
                thumb = ImageOps.contain(image, (390, 520), Image.Resampling.LANCZOS)
                pair.paste(thumb, (x + (400 - thumb.width) // 2, 40 + (520 - thumb.height) // 2))
                draw.text((x + 12, 565), label, font=font, fill='#332b22')
            pairs.append(pair)
        entry['development_version'] = entry.get('development_adjustments', {}).get('version', 2)
        print(entry['asset'], flush=True)
    for batch in range((len(pairs) + 3) // 4):
        board = Image.new('RGB', (1600, 1180), '#f4f0e8')
        for slot, pair in enumerate(pairs[batch * 4:batch * 4 + 4]):
            board.paste(pair, ((slot % 2) * 800, (slot // 2) * 590))
        save(board, review / f'Vergleich-{batch + 1:02d}.jpg', 92)
    assert all(hashlib.sha256(p.read_bytes()).hexdigest() == sha for p, sha in sources.items())
    manifest['development'] = SETTINGS
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(sources)} unveränderte Originale; {len(entries)} Exporte geprüft.', flush=True)


if __name__ == '__main__':
    main()
