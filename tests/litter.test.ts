import assert from 'node:assert/strict';
import { test } from 'node:test';
import { litterDistribution, formatLitterProbability } from '../src/lib/color/litter';
import { calculateColors, type Scenario } from '../src/lib/color/model';

test('the fixed six-puppy example retains the exact binomial distribution', () => {
	assert.deepEqual(litterDistribution(50), [1.5625, 9.375, 23.4375, 31.25, 23.4375, 9.375, 1.5625]);
});

test('impossible and certain traits put all probability at zero or six puppies', () => {
	assert.deepEqual(litterDistribution(0), [100, 0, 0, 0, 0, 0, 0]);
	assert.deepEqual(litterDistribution(100), [0, 0, 0, 0, 0, 0, 100]);
});

test('a 25-percent trait is most likely in one of six puppies, with a mean of 1.5', () => {
	const distribution = litterDistribution(25);
	assert.equal(distribution[0], 0.75 ** 6 * 100);
	assert.equal(distribution[1], 6 * 0.25 * 0.75 ** 5 * 100);
	assert.equal(distribution.indexOf(Math.max(...distribution)), 1);
	assert.equal(distribution.reduce((sum, p, count) => sum + count * p / 100, 0), 1.5);
});

test('all supported crosses produce normalised litter distributions with the correct mean', () => {
	for (const e of ['EE', 'Ee', 'ee'] as const) for (const b of ['NN', 'Nbs', 'bsbs'] as const) for (const s of ['NN', 'NS', 'SS'] as const) {
		const result = calculateColors({ v: 2, e, b, s } satisfies Scenario);
		for (const trait of [...result.colors, ...result.spotting]) {
			const p = trait.probability.min;
			assert.equal(p, trait.probability.max);
			const distribution = litterDistribution(p);
			assert.ok(distribution.every((value) => Number.isFinite(value) && value >= 0 && value <= 100));
			assert.ok(Math.abs(distribution.reduce((sum, value) => sum + value, 0) - 100) < 1e-10);
			assert.ok(Math.abs(distribution.reduce((sum, value, count) => sum + count * value / 100, 0) - 6 * p / 100) < 1e-10);
		}
	}
});

test('invalid probabilities and litter sizes are rejected', () => {
	for (const p of [NaN, Infinity, -1, 101]) assert.throws(() => litterDistribution(p));
	for (const size of [0, -1, 1.5, 21, Infinity]) assert.throws(() => litterDistribution(50, size));
});

test('very rare outcomes stay distinguishable from impossible or certain outcomes', () => {
	assert.equal(formatLitterProbability(litterDistribution(12.5)[6], 'de'), '<0,01 %');
	assert.equal(formatLitterProbability(litterDistribution(12.5)[6], 'en'), '<0.01%');
	assert.equal(formatLitterProbability(0, 'de'), '0 %');
	assert.equal(formatLitterProbability(100, 'en'), '100%');
	assert.equal(formatLitterProbability(99.999, 'en'), '>99.99%');
});
