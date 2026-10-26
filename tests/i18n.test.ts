import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getLocale, localizedHref, translator, routes, formatDate } from '../src/i18n';
import { formatProbability } from '../src/lib/color/model';
import { calculateBitchAge } from '../src/lib/deckanfrage/process';

test('German is the default; English is explicit in the URL', () => {
	assert.equal(getLocale('/'), 'de');
	assert.equal(getLocale('/farbrechner/'), 'de');
	assert.equal(getLocale('/english/'), 'de');
	assert.equal(getLocale('/en'), 'en');
	assert.equal(getLocale('/en/health/'), 'en');
});

test('language changes keep the corresponding page, query and anchor', () => {
	for (const [de, en] of routes) {
		assert.equal(localizedHref(de, 'en'), en);
		assert.equal(localizedHref(en, 'de'), de);
		assert.equal(localizedHref((de === '/' ? '/' : de.replace(/\/$/, '')) + '?v=2&e=Ee&b=Nbs&s=NS#result', 'en'), en + '?v=2&e=Ee&b=Nbs&s=NS#result');
	}
	assert.equal(localizedHref('/gesundheit#health-s-lokus', 'en'), '/en/health/#health-s-lokus');
	assert.equal(localizedHref('/certificates/dm.pdf', 'en'), '/certificates/dm.pdf');
	assert.equal(localizedHref('https://example.com/', 'en'), 'https://example.com/');
	assert.equal(localizedHref('#result', 'en'), '#result');
});

test('missing translations stop publication and shared components accept translated text', () => {
	const t = translator('en');
	assert.equal(t('Gesundheit'), 'Health');
	assert.equal(t(t('Gesundheit')), 'Health');
	assert.equal(t('N/S'), 'N/S');
	assert.equal(t('  Tuxedo Großpudel · by FlyingRoyals von Reckewitz  '), 'Tuxedo Standard Poodle · by FlyingRoyals von Reckewitz');
	assert.throws(() => t('Noch nicht übersetzter neuer Inhalt'), /Missing English translation/);
	assert.equal(translator('de')('Noch nicht übersetzter neuer Inhalt'), 'Noch nicht übersetzter neuer Inhalt');
});

test('English numbers, dates and calculated ages use English formatting', () => {
	assert.equal(formatProbability({ min: 12.5, max: 12.5 }, 'en'), '12.5%');
	assert.equal(formatProbability({ min: 0, max: 12.5 }, 'en'), '0–12.5%');
	assert.equal(formatProbability({ min: 12.5, max: 12.5 }), '12,5 %');
	assert.equal(formatDate('09.07.2026', 'en'), '9 July 2026');
	assert.equal(formatDate('09.07.2026', 'de'), '09.07.2026');
	assert.equal(calculateBitchAge('2099-01-01', 'en'), 'Not specified');
	assert.match(calculateBitchAge('2020-01-01', 'en'), /^\d+ years?, \d+ months?$/);
});
