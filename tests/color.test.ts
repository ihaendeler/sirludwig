import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	calculateColors, cross, decodeScenario, emptyScenario, formatProbability,
	parseScenario, scenarioFromQuery, scenarioLines, scenarioQuery, type Scenario,
} from '../src/lib/color/model';

const knownScenario = (): Scenario => ({ v: 2, e: 'Ee', b: 'Nbs', s: 'NS' });

test('known color values combine recessive red with the bs brown variant', () => {
	const result = calculateColors(knownScenario());
	assert.deepEqual(result.colors.map((c) => c.probability), [
		{ min: 50, max: 50 }, { min: 37.5, max: 37.5 }, { min: 12.5, max: 12.5 },
	]);
	assert.deepEqual(result.spotting.map((s) => s.probability), [
		{ min: 25, max: 25 }, { min: 50, max: 50 }, { min: 25, max: 25 },
	]);
	assert.deepEqual(result.unknown, []);
});

// Independent Mendelian expectations against Ludwig e1/e1, N/bs.
for (const [e, b, expected] of [
	['EE', 'NN', [0, 100, 0]], ['EE', 'Nbs', [0, 75, 25]], ['EE', 'bsbs', [0, 50, 50]],
	['Ee', 'NN', [50, 50, 0]], ['Ee', 'Nbs', [50, 37.5, 12.5]], ['Ee', 'bsbs', [50, 25, 25]],
	['ee', 'NN', [100, 0, 0]], ['ee', 'Nbs', [100, 0, 0]], ['ee', 'bsbs', [100, 0, 0]],
] as const) {
	test(`coat bases for dam ${e}, ${b}: ${expected.join('/')}`, () => {
		const result = calculateColors({ ...knownScenario(), e, b });
		assert.deepEqual(result.colors.map((c) => c.probability), expected.map((p) => ({ min: p, max: p })));
		assert.equal(result.colors.reduce((sum, c) => sum + c.probability.min, 0), 100);
	});
}

for (const [s, expected] of [['NN', [50, 50, 0]], ['NS', [25, 50, 25]], ['SS', [0, 50, 50]]] as const) {
	test(`S variant inheritance for dam ${s}, independent of red coat masking`, () => {
		const result = calculateColors({ ...knownScenario(), e: 'ee', s });
		assert.deepEqual(result.spotting.map((v) => v.probability), expected.map((p) => ({ min: p, max: p })));
		assert.ok(result.spotting.every((v) => !/Tuxedo|Parti|Prozent Weiß/i.test(v.label)));
	});
}

test('bs is inherited as one allele', () => {
	const result = cross('Nbs', 'bsbs');
	assert.equal(result.reduce((sum, c) => sum + c.probability, 0), 1);
	assert.equal(result.filter((c) => c.alleles.every((a) => a === 'bs')).length, 2);
	assert.throws(() => cross('not-a-genotype', 'NN'));
});

test('unknown dam gives bounds instead of an invented average', () => {
	const result = calculateColors(emptyScenario());
	assert.deepEqual(result.colors.map((c) => c.probability), [
		{ min: 0, max: 100 }, { min: 0, max: 100 }, { min: 0, max: 50 },
	]);
	assert.deepEqual(result.spotting.map((s) => s.probability), [
		{ min: 0, max: 50 }, { min: 50, max: 50 }, { min: 0, max: 50 },
	]);
	assert.deepEqual(result.unknown, ['e', 'b', 's']);
});

test('unknown B cannot obscure certain recessive red', () => {
	const result = calculateColors({ ...emptyScenario(), e: 'ee' });
	assert.deepEqual(result.colors.map((c) => c.probability), [
		{ min: 100, max: 100 }, { min: 0, max: 0 }, { min: 0, max: 0 },
	]);
});

test('partially unknown E retains known B bounds', () => {
	const result = calculateColors({ ...emptyScenario(), b: 'Nbs' });
	assert.deepEqual(result.colors.map((c) => c.probability), [
		{ min: 0, max: 100 }, { min: 0, max: 75 }, { min: 0, max: 25 },
	]);
});

test('anonymous query round-trip contains only version and color values', () => {
	const scenario: Scenario = { ...emptyScenario(), e: 'Ee', b: 'bsbs' };
	const withPersonalFields = { ...scenario, mode: 'own', sourceE: 'test', name: 'Private name', email: 'private@example.com', privacyConsent: true };
	const query = scenarioQuery(withPersonalFields);
	assert.deepEqual(scenarioFromQuery(`?${query}&email=private@example.com`), scenario);
	assert.ok(!/Private|private|email|consent|mode|source/i.test(query));
	assert.deepEqual(Object.keys(parseScenario(withPersonalFields)!).sort(), Object.keys(scenario).sort());
});

test('old links and saved scenarios migrate to values without mode or provenance', () => {
	for (const mode of ['example', 'own']) {
		const source = mode === 'example' ? 'example' : 'test';
		const legacy = { v: 1, mode, e: 'Ee', b: 'Nbs', s: 'NS', sourceE: source, sourceB: source, sourceS: source };
		assert.deepEqual(parseScenario(legacy), knownScenario());
		assert.deepEqual(decodeScenario(JSON.stringify(legacy)), knownScenario());
		const query = new URLSearchParams(Object.entries(legacy).map(([k, v]) => [k, String(v)])).toString();
		assert.deepEqual(scenarioFromQuery(query), knownScenario());
	}
	const partialLegacy = { v: 1, mode: 'own', e: 'Ee', b: 'unknown', s: 'unknown', sourceE: 'assumed', sourceB: 'unknown', sourceS: 'unknown' };
	assert.deepEqual(parseScenario(partialLegacy), { ...emptyScenario(), e: 'Ee' });
	assert.equal(parseScenario({ ...partialLegacy, sourceB: 'test' }), null);
});

test('rejects unsupported alleles, ambiguous queries and corrupt versions', () => {
	assert.equal(parseScenario({ ...knownScenario(), b: 'bb' }), null);
	assert.equal(parseScenario({ ...knownScenario(), v: 99 }), null);
	assert.equal(scenarioFromQuery(`${scenarioQuery(knownScenario())}&e=ee`), null);
	assert.equal(scenarioFromQuery(`${scenarioQuery(knownScenario())}&v=1`), null);
	assert.equal(scenarioFromQuery('v=1&mode=example'), null);
	assert.equal(decodeScenario('null'), null);
	assert.equal(decodeScenario('['), null);
	assert.equal(decodeScenario(' '.repeat(1001)), null);
});

test('email summary contains color values and results without classification', () => {
	const lines = scenarioLines(knownScenario()).join('\n');
	assert.match(lines, /Braune Grundfarbe: 12,5 %/);
	assert.match(lines, /Andere Braun- und E-Varianten/);
	assert.doesNotMatch(lines, /Beispiel|Annahme|überprüft|Gentest laut Eingabe|Art:/);
	assert.equal(formatProbability({ min: 0, max: 37.5 }), '0–37,5 %');
});

test('missing inputs do not produce estimated results in a request', () => {
	const partial = { ...emptyScenario(), s: 'NN' } as Scenario;
	const result = calculateColors(partial);
	assert.equal(result.colorsReady, false);
	assert.equal(result.spottingReady, true);
	const lines = scenarioLines(partial).join('\n');
	assert.match(lines, /Grundfarben: E- und B-Lokus noch nicht vollständig angegeben/);
	assert.match(lines, /S-Lokus N\/S: 50 %/);
	assert.doesNotMatch(lines, /0–100|Rot \/ Apricot \/ Creme:/);
	const ready = calculateColors({ ...knownScenario(), s: 'unknown' });
	assert.equal(ready.colorsReady, true);
	assert.equal(ready.spottingReady, false);
});
