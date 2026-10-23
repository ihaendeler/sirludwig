import { getHealthRecord } from '../../data/health';

export const COLOR_MODEL_VERSION = '1.0.0';
export const SCENARIO_VERSION = 1;
export const SCENARIO_STORAGE_KEY = 'sirludwig.color.v1';

export const LOCI = ['e', 'b', 's'] as const;
export type Locus = (typeof LOCI)[number];
export type Origin = 'example' | 'test' | 'assumed' | 'unknown';
export type Mode = 'example' | 'own';
export const VALUES = {
	e: ['unknown', 'EE', 'Ee', 'ee'],
	b: ['unknown', 'NN', 'Nbs', 'bsbs'],
	s: ['unknown', 'NN', 'NS', 'SS'],
} as const;
export type Scenario = {
	v: 1;
	mode: Mode;
	e: (typeof VALUES.e)[number];
	b: (typeof VALUES.b)[number];
	s: (typeof VALUES.s)[number];
	sourceE: Origin;
	sourceB: Origin;
	sourceS: Origin;
};
export const SOURCE_KEYS = { e: 'sourceE', b: 'sourceB', s: 'sourceS' } as const;
export const ORIGIN_LABELS: Record<Origin, string> = {
	example: 'Beispielwert', test: 'Gentest laut Eingabe', assumed: 'Annahme', unknown: 'Unbekannt',
};
export const GENOTYPE_LABELS: Record<Locus, Record<string, string>> = {
	e: { unknown: 'Unbekannt', EE: 'E/E', Ee: 'E/e1', ee: 'e1/e1' },
	b: { unknown: 'Unbekannt', NN: 'N/N', Nbs: 'N/bs', bsbs: 'bs/bs' },
	s: { unknown: 'Unbekannt', NN: 'N/N', NS: 'N/S', SS: 'S/S' },
};
export const LOCUS_LABELS: Record<Locus, string> = { e: 'E-Lokus · e1', b: 'B-Lokus · bs', s: 'S-Lokus · Weißscheckung' };
export const MODEL_NOTE = 'Modell für E/e1, die Braunvariante bs und die getestete S-Variante. Andere Braun- und E-Varianten, Verdünnung, Aufhellung und die genaue Weißzeichnung sind nicht abgedeckt. Prozentwerte gelten pro Welpe, nicht als festes Verhältnis eines Wurfes.';

/** Guard the interpretation against silent changes to the documented sire results. */
function documentedSire() {
	const expected = { 'e-lokus': 'e1/e1', 'b-lokus': 'N/bs', 'k-lokus': 'Kb/Kb', 's-lokus': 'N/S' };
	for (const [id, result] of Object.entries(expected)) {
		if (getHealthRecord(id).result !== result || !getHealthRecord(id).completed) {
			throw new Error(`Color model must be reviewed after changing ${id}`);
		}
	}
	return { e: 'ee', b: 'Nbs', s: 'NS' } as const;
}
const SIRE = documentedSire();

export const PRESETS = [
	{ id: 'mixed', label: 'Gemischtes Beispiel', description: 'Rot-, Schwarz- und Braunbasis im Vergleich', e: 'Ee', b: 'Nbs', s: 'NS' },
	{ id: 'red', label: 'Apricot-Beispiel', description: 'Zwei Eltern mit e1/e1', e: 'ee', b: 'NN', s: 'NS' },
	{ id: 'dark', label: 'Dunkles Beispiel', description: 'E/E, mit einer Kopie der Braunvariante bs', e: 'EE', b: 'Nbs', s: 'SS' },
] as const;

export function exampleScenario(id = 'mixed'): Scenario {
	const p = PRESETS.find((preset) => preset.id === id) ?? PRESETS[0];
	return { v: 1, mode: 'example', e: p.e, b: p.b, s: p.s, sourceE: 'example', sourceB: 'example', sourceS: 'example' };
}

export function ownScenario(): Scenario {
	return { v: 1, mode: 'own', e: 'unknown', b: 'unknown', s: 'unknown', sourceE: 'unknown', sourceB: 'unknown', sourceS: 'unknown' };
}

/** Parse only the public, anonymous scenario. Personal fields are never serialized here. */
export function parseScenario(value: unknown): Scenario | null {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
	const o = value as Record<string, unknown>;
	if (o.v !== 1 || (o.mode !== 'example' && o.mode !== 'own')) return null;
	const parsed = { v: 1, mode: o.mode } as Scenario;
	for (const locus of LOCI) {
		if (!(VALUES[locus] as readonly unknown[]).includes(o[locus])) return null;
		const sourceKey = SOURCE_KEYS[locus];
		const source = o[sourceKey];
		if (!['example', 'test', 'assumed', 'unknown'].includes(source as string)) return null;
		if (o[locus] === 'unknown' && source !== 'unknown') return null;
		if (o[locus] !== 'unknown' && (o.mode === 'example' ? source !== 'example' : !['test', 'assumed'].includes(source as string))) return null;
		Object.assign(parsed, { [locus]: o[locus], [sourceKey]: source });
	}
	return parsed;
}

export function decodeScenario(json: string): Scenario | null {
	if (!json || json.length > 1_000) return null;
	try { return parseScenario(JSON.parse(json)); } catch { return null; }
}

export function scenarioQuery(scenario: Scenario): string {
	const valid = parseScenario(scenario);
	if (!valid) throw new Error('Invalid color scenario');
	return new URLSearchParams(Object.entries(valid).map(([key, value]) => [key, String(value)])).toString();
}

export function scenarioFromQuery(search: string): Scenario | null {
	const params = new URLSearchParams(search);
	if (!params.has('v')) return null;
	const entries: Record<string, unknown> = { v: Number(params.get('v')) };
	for (const key of ['mode', 'e', 'b', 's', 'sourceE', 'sourceB', 'sourceS']) {
		if (params.getAll(key).length !== 1) return null;
		entries[key] = params.get(key);
	}
	if (params.getAll('v').length !== 1) return null;
	return parseScenario(entries);
}

export interface Probability { min: number; max: number }
export interface ColorResult {
	colors: { id: 'red' | 'black' | 'brown'; label: string; probability: Probability }[];
	spotting: { genotype: string; label: string; probability: Probability }[];
	unknown: Locus[];
}

// Alleles are kept as tokens: "bs" is a single allele, not two letters.
const ALLELES: Record<string, readonly [string, string]> = {
	EE: ['E', 'E'], Ee: ['E', 'e'], ee: ['e', 'e'],
	NN: ['N', 'N'], Nbs: ['N', 'bs'], bsbs: ['bs', 'bs'],
	NS: ['N', 'S'], SS: ['S', 'S'],
};

export function cross(sire: string, dam: string): { alleles: [string, string]; probability: number }[] {
	if (!ALLELES[sire] || !ALLELES[dam]) throw new Error('Unsupported genotype');
	return ALLELES[sire].flatMap((a) => ALLELES[dam].map((b) => ({ alleles: [a, b] as [string, string], probability: 0.25 })));
}

function colorDistribution(e: string, b: string): number[] {
	const probabilities = [0, 0, 0];
	for (const ec of cross(SIRE.e, e)) {
		for (const bc of cross(SIRE.b, b)) {
			// Every puppy inherits Kb from Ludwig. e1/e1 masks dark coat pigment.
			const index = ec.alleles.every((a) => a === 'e') ? 0 : bc.alleles.every((a) => a === 'bs') ? 2 : 1;
			probabilities[index] += ec.probability * bc.probability;
		}
	}
	return probabilities;
}

function range(distributions: number[][], index: number): Probability {
	const values = distributions.map((d) => d[index] * 100);
	return { min: Math.min(...values), max: Math.max(...values) };
}

/** Unknown genotypes give bounds across possible genotypes, never assumed frequencies. */
export function calculateColors(scenario: Scenario): ColorResult {
	if (!parseScenario(scenario)) throw new Error('Invalid color scenario');
	const eOptions = scenario.e === 'unknown' ? VALUES.e.slice(1) : [scenario.e];
	const bOptions = scenario.b === 'unknown' ? VALUES.b.slice(1) : [scenario.b];
	const sOptions = scenario.s === 'unknown' ? VALUES.s.slice(1) : [scenario.s];
	const distributions = eOptions.flatMap((e) => bOptions.map((b) => colorDistribution(e, b)));
	const spotting = sOptions.map((s) => {
		const p = [0, 0, 0];
		for (const child of cross(SIRE.s, s)) p[child.alleles.filter((a) => a === 'S').length] += child.probability;
		return p;
	});
	return {
		colors: [
			{ id: 'red', label: 'Rot / Apricot / Creme', probability: range(distributions, 0) },
			{ id: 'black', label: 'Schwarze Grundfarbe', probability: range(distributions, 1) },
			{ id: 'brown', label: 'Braune Grundfarbe', probability: range(distributions, 2) },
		],
		spotting: ['N/N', 'N/S', 'S/S'].map((genotype, index) => ({
			genotype, label: `${index} ${index === 1 ? 'Kopie' : 'Kopien'} der getesteten S-Variante`, probability: range(spotting, index),
		})),
		unknown: LOCI.filter((locus) => scenario[locus] === 'unknown'),
	};
}

export function formatProbability(value: Probability): string {
	const f = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 2 });
	return value.min === value.max ? `${f(value.min)} %` : `${f(value.min)}–${f(value.max)} %`;
}

export function scenarioLines(scenario: Scenario): string[] {
	const result = calculateColors(scenario);
	return [
		`Art: ${scenario.mode === 'example' ? 'Beispielsimulation – keine Befunde einer Hündin' : 'Eigene Angaben – nicht überprüft'}`,
		...LOCI.map((locus) => `${LOCUS_LABELS[locus]}: ${GENOTYPE_LABELS[locus][scenario[locus]]} (${ORIGIN_LABELS[scenario[SOURCE_KEYS[locus]]]})`),
		...result.colors.map((c) => `${c.label}: ${formatProbability(c.probability)} (im Modell)`),
		...result.spotting.map((s) => `S-Lokus ${s.genotype}: ${formatProbability(s.probability)}`),
		`Rechenmodell: ${COLOR_MODEL_VERSION}; Ludwig: e1/e1, N/bs, Kb/Kb, N/S.`,
		MODEL_NOTE,
	];
}
