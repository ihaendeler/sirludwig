// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// Preserve Astro 6 whitespace between inline text and links after the v7 upgrade.
	compressHTML: true,
});
