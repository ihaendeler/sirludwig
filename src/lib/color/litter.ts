import { formatProbability } from './model';

/** Binomial probabilities (in percent) for independent puppies with the same trait probability. */
export function litterDistribution(probabilityPerPuppy: number, litterSize = 6): number[] {
	if (!Number.isFinite(probabilityPerPuppy) || probabilityPerPuppy < 0 || probabilityPerPuppy > 100 ||
		!Number.isInteger(litterSize) || litterSize < 1 || litterSize > 20) {
		throw new Error('Invalid litter distribution parameters');
	}
	const p = probabilityPerPuppy / 100;
	let combinations = 1;
	return Array.from({ length: litterSize + 1 }, (_, count) => {
		if (count > 0) combinations = combinations * (litterSize - count + 1) / count;
		return combinations * p ** count * (1 - p) ** (litterSize - count) * 100;
	});
}

/** Keep rare outcomes distinct from impossible outcomes after rounding. */
export function formatLitterProbability(probability: number, locale: 'de' | 'en'): string {
	if (probability > 0 && probability < 0.01) return `<${formatProbability({ min: 0.01, max: 0.01 }, locale)}`;
	if (probability > 99.99 && probability < 100) return `>${formatProbability({ min: 99.99, max: 99.99 }, locale)}`;
	return formatProbability({ min: probability, max: probability }, locale);
}
