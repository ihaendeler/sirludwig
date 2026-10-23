import assert from 'node:assert/strict';
import { test } from 'node:test';
import sharp from 'sharp';
import { encodeIco } from '../src/scripts/ico';

test('ICO entries point to decodable PNGs at the requested dimensions', async () => {
	const images = await Promise.all([16, 32].map(async (size) => ({
		size, png: await sharp({ create: { width: size, height: size, channels: 4, background: '#4a3428' } }).png().toBuffer(),
	})));
	const ico = encodeIco(images);
	assert.equal(ico.readUInt16LE(0), 0);
	assert.equal(ico.readUInt16LE(2), 1);
	assert.equal(ico.readUInt16LE(4), 2);
	for (const [index, image] of images.entries()) {
		const entry = 6 + index * 16;
		const length = ico.readUInt32LE(entry + 8);
		const offset = ico.readUInt32LE(entry + 12);
		const png = ico.subarray(offset, offset + length);
		assert.deepEqual(png, image.png);
		const meta = await sharp(png).metadata();
		assert.equal(meta.width, image.size);
		assert.equal(meta.height, image.size);
	}
});
