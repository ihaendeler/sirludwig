/** ICO directory containing PNG images, supported by modern browsers and Windows. */
export function encodeIco(images: { size: number; png: Buffer }[]): Buffer {
	if (!images.length || images.length > 65_535) throw new Error('Invalid icon count');
	const directory = Buffer.alloc(6 + images.length * 16);
	directory.writeUInt16LE(1, 2);
	directory.writeUInt16LE(images.length, 4);
	let offset = directory.length;
	for (const [index, { size, png }] of images.entries()) {
		if (!Number.isInteger(size) || size < 1 || size > 256) throw new Error('Invalid icon size');
		const entry = 6 + index * 16;
		directory[entry] = directory[entry + 1] = size === 256 ? 0 : size;
		directory.writeUInt16LE(1, entry + 4);
		directory.writeUInt16LE(32, entry + 6);
		directory.writeUInt32LE(png.length, entry + 8);
		directory.writeUInt32LE(offset, entry + 12);
		offset += png.length;
	}
	return Buffer.concat([directory, ...images.map(({ png }) => png)]);
}
