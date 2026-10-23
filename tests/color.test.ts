import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	calculateColors, cross, decodeScenario, exampleScenario, formatProbability, ownScenario,
	parseScenario, scenarioFromQuery, scenarioLines, scenarioQuery, type Scenario,
} from '../src/lib/color/model';

test('default example combines recessive red with the bs brown variant', () => {
	const result = calculateColors(exampleScenario());
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
		const result = calculateColors({ ...exampleScenario(), e, b });
		assert.deepEqual(result.colors.map((c) => c.probability), expected.map((p) => ({ min: p, max: p })));
		assert.equal(result.colors.reduce((sum, c) => sum + c.probability.min, 0), 100);
	});
}

for (const [s, expected] of [['NN', [50, 50, 0]], ['NS', [25, 50, 25]], ['SS', [0, 50, 50]]] as const) {
	test(`S variant inheritance for dam ${s}, independent of red coat masking`, () => {
		const result = calculateColors({ ...exampleScenario('red'), s });
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
	const result = calculateColors(ownScenario());
	assert.deepEqual(result.colors.map((c) => c.probability), [
		{ min: 0, max: 100 }, { min: 0, max: 100 }, { min: 0, max: 50 },
	]);
	assert.deepEqual(result.spotting.map((s) => s.probability), [
		{ min: 0, max: 50 }, { min: 50, max: 50 }, { min: 0, max: 50 },
	]);
	assert.deepEqual(result.unknown, ['e', 'b', 's']);
});

test('unknown B cannot obscure certain recessive red', () => {
	const result = calculateColors({ ...ownScenario(), e: 'ee', sourceE: 'test' });
	assert.deepEqual(result.colors.map((c) => c.probability), [
		{ min: 100, max: 100 }, { min: 0, max: 0 }, { min: 0, max: 0 },
	]);
});

test('partially unknown E retains known B bounds', () => {
	const result = calculateColors({ ...ownScenario(), b: 'Nbs', sourceB: 'assumed' });
	assert.deepEqual(result.colors.map((c) => c.probability), [
		{ min: 0, max: 100 }, { min: 0, max: 75 }, { min: 0, max: 25 },
	]);
});

test('anonymous query round-trip retains per-locus provenance and removes extra data', () => {
	const scenario: Scenario = { ...ownScenario(), e: 'Ee', sourceE: 'test', b: 'bsbs', sourceB: 'assumed' };
	const withPersonalFields = { ...scenario, name: 'Private name', email: 'private@example.com', privacyConsent: true };
	const query = scenarioQuery(withPersonalFields);
	assert.deepEqual(scenarioFromQuery(`?${query}&email=private@example.com`), scenario);
	assert.ok(!/Private|private|email|consent/i.test(query));
	assert.deepEqual(Object.keys(parseScenario(withPersonalFields)!).sort(), Object.keys(scenario).sort());
});

test('example values cannot be mislabeled as verified dam results', () => {
	assert.equal(parseScenario({ ...exampleScenario(), sourceE: 'test' }), null);
	assert.equal(parseScenario({ ...ownScenario(), e: 'Ee', sourceE: 'example' }), null);
	assert.equal(parseScenario({ ...ownScenario(), sourceE: 'test' }), null);
	assert.equal(parseScenario({ ...ownScenario(), e: 'EE' }), null);
});

test('rejects unsupported alleles, ambiguous queries and corrupt versions', () => {
	assert.equal(parseScenario({ ...exampleScenario(), b: 'bb' }), null);
	assert.equal(parseScenario({ ...exampleScenario(), v: 2 }), null);
	assert.equal(scenarioFromQuery(`${scenarioQuery(exampleScenario())}&e=ee`), null);
	assert.equal(scenarioFromQuery(`${scenarioQuery(exampleScenario())}&v=1`), null);
	assert.equal(scenarioFromQuery('v=1&mode=example'), null);
	assert.equal(decodeScenario('null'), null);
	assert.equal(decodeScenario('['), null);
	assert.equal(decodeScenario(' '.repeat(1001)), null);
});

test('email summary distinguishes simulation from unverified own results', () => {
	const example = scenarioLines(exampleScenario()).join('\n');
	assert.match(example, /Beispielsimulation – keine Befunde/);
	assert.match(example, /Braune Grundfarbe: 12,5 %/);
	assert.match(example, /Andere Braun- und E-Varianten/);
	const own = scenarioLines({ ...ownScenario(), e: 'Ee', sourceE: 'test' }).join('\n');
	assert.match(own, /Eigene Angaben – nicht überprüft/);
	assert.match(own, /Gentest laut Eingabe/);
	assert.match(own, /B-Lokus · bs: Unbekannt/);
	assert.equal(formatProbability({ min: 0, max: 37.5 }), '0–37,5 %');
});
