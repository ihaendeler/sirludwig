export type HealthCategory =
	| 'genetik'
	| 'farbgenetik'
	| 'orthopaedie'
	| 'augen'
	| 'zuchtzulassung';

export interface HealthRecord {
	id: string;
	title: string;
	label: string;
	status: 'completed' | 'pending';
	result: string;
	summary: string;
	breeding: string;
	date: string;
	pdf: string;
	category: HealthCategory;
	completed: boolean;
}

export type HealthPendingStatus = 'planned-growth' | 'planned-breeding';

export interface HealthReportSubsection {
	title: string;
	recordIds: string[];
}

export interface HealthReportSection {
	id: string;
	title: string;
	intro: string;
	pendingStatus?: HealthPendingStatus;
	subsections?: HealthReportSubsection[];
	recordIds?: string[];
}

export interface HealthOverviewItem {
	label: string;
	completed: boolean;
	targetId: string;
}

export interface HealthOverviewSubsection {
	title: string;
	items: HealthOverviewItem[];
}

export interface HealthOverviewGroup {
	id: string;
	title: string;
	intro: string;
	subsections?: HealthOverviewSubsection[];
	items?: HealthOverviewItem[];
	pendingStatus?: HealthPendingStatus;
}

export interface HealthDocumentationProgress {
	id: string;
	title: string;
	completed: number;
	total: number;
}

export const healthPendingStatusLabels: Record<HealthPendingStatus, string> = {
	'planned-growth': 'Geplant nach Abschluss des Wachstums',
	'planned-breeding': 'Folgt im weiteren Zuchtverlauf',
};

export const healthOverviewIntro =
	'Alle Untersuchungsergebnisse werden nach Eingang veröffentlicht und mit dem jeweiligen Originalzertifikat dokumentiert. Bereits abgeschlossene Untersuchungen werden fortlaufend ergänzt. Altersabhängige Untersuchungen erfolgen nach Abschluss des Wachstums gemäß den zuchtrelevanten Empfehlungen.';

const healthRecordsById: Record<string, HealthRecord> = {
	dm: {
		id: 'dm',
		title: 'Degenerative Myelopathie (DM)',
		label: 'DM',
		status: 'completed',
		result: 'N/N',
		summary: 'Frei von der getesteten Mutation.',
		breeding: 'Keine Weitergabe der getesteten Mutation.',
		date: '09.07.2026',
		pdf: 'dm.pdf',
		category: 'genetik',
		completed: true,
	},
	news: {
		id: 'news',
		title: 'Neonatal Encephalopathy with Seizures (NEWS)',
		label: 'NEWS',
		status: 'completed',
		result: 'N/N',
		summary: 'Frei von der getesteten Mutation.',
		breeding: 'Keine Weitergabe der getesteten Mutation.',
		date: '09.07.2026',
		pdf: 'news.pdf',
		category: 'genetik',
		completed: true,
	},
	'vwd-typ-1': {
		id: 'vwd-typ-1',
		title: 'Von-Willebrand-Syndrom Typ I (vWD Typ I)',
		label: 'vWD Typ I',
		status: 'completed',
		result: 'N/N',
		summary: 'Frei von der getesteten Mutation.',
		breeding: 'Keine Weitergabe der getesteten Mutation.',
		date: '09.07.2026',
		pdf: 'vwd-typ-1.pdf',
		category: 'genetik',
		completed: true,
	},
	'prcd-pra': {
		id: 'prcd-pra',
		title: 'Progressive Rod-Cone Degeneration (prcd-PRA)',
		label: 'prcd-PRA',
		status: 'completed',
		result: 'N/N',
		summary: 'Frei von der getesteten Mutation.',
		breeding: 'Keine Weitergabe der getesteten Mutation.',
		date: '09.07.2026',
		pdf: 'prcd-pra.pdf',
		category: 'genetik',
		completed: true,
	},
	'rcd4-pra': {
		id: 'rcd4-pra',
		title: 'Rod-Cone Dysplasia 4 (rcd4-PRA)',
		label: 'rcd4-PRA',
		status: 'completed',
		result: 'N/N',
		summary: 'Frei von der getesteten Mutation.',
		breeding: 'Keine Weitergabe der getesteten Mutation.',
		date: '09.07.2026',
		pdf: 'rcd4-pra.pdf',
		category: 'genetik',
		completed: true,
	},
	'a-lokus': {
		id: 'a-lokus',
		title: 'Agouti-Lokus (A-Lokus)',
		label: 'A-Lokus',
		status: 'completed',
		result: 'DY/BB1',
		summary: 'Heterozygot für DY und BB1 — Farbverteilung entsprechend dem ASIP-Haplotyp.',
		breeding: 'Farbplanung und Paarung unter Berücksichtigung der Agouti-Varianten.',
		date: '09.07.2026',
		pdf: 'a-lokus.pdf',
		category: 'farbgenetik',
		completed: true,
	},
	'b-lokus': {
		id: 'b-lokus',
		title: 'Braun-Lokus (B-Lokus)',
		label: 'B-Lokus',
		status: 'completed',
		result: 'N/bs',
		summary: 'Ludwig trägt ein bs-Allel, ist selbst jedoch nicht braun.',
		breeding: 'Braune Nachkommen sind nur möglich, wenn auch die Hündin ein entsprechendes Braun-Allel trägt.',
		date: '09.07.2026',
		pdf: 'b-lokus.pdf',
		category: 'farbgenetik',
		completed: true,
	},
	'd-lokus': {
		id: 'd-lokus',
		title: 'Dilution-Lokus (D-Lokus)',
		label: 'D-Lokus',
		status: 'completed',
		result: 'N/N',
		summary: 'Kein Dilution-Allel nachweisbar.',
		breeding: 'Keine Weitergabe von Dilution über diesen Lokus.',
		date: '09.07.2026',
		pdf: 'd-lokus.pdf',
		category: 'farbgenetik',
		completed: true,
	},
	'e-lokus': {
		id: 'e-lokus',
		title: 'Extension-Lokus (E-Lokus)',
		label: 'E-Lokus',
		status: 'completed',
		result: 'e1/e1',
		summary: 'e1/e1 bestätigt die apricot-/cremefarbene Pigmentierung.',
		breeding: 'Ludwig gibt an diesem Lokus ausschließlich das e1-Allel weiter.',
		date: '09.07.2026',
		pdf: 'e-lokus.pdf',
		category: 'farbgenetik',
		completed: true,
	},
	'i-lokus': {
		id: 'i-lokus',
		title: 'Intensity-Lokus (I-Lokus)',
		label: 'I-Lokus',
		status: 'completed',
		result: 'N/i',
		summary: 'Ludwig trägt ein i-Allel, das die Intensität des Phäomelanins beeinflussen kann.',
		breeding: 'Relevant für die Einschätzung von Apricot-, Creme- und Rotintensität.',
		date: '09.07.2026',
		pdf: 'i-lokus.pdf',
		category: 'farbgenetik',
		completed: true,
	},
	'k-lokus': {
		id: 'k-lokus',
		title: 'Schwarz-Lokus (K-Lokus)',
		label: 'K-Lokus',
		status: 'completed',
		result: 'Kb/Kb',
		summary: 'Kb/Kb liegt vor. Im Erscheinungsbild wird dieses Ergebnis durch e/e überlagert.',
		breeding: 'Für die Farbvererbung relevant, insbesondere in Kombination mit dem E-Lokus der Hündin.',
		date: '09.07.2026',
		pdf: 'k-lokus.pdf',
		category: 'farbgenetik',
		completed: true,
	},
	's-lokus': {
		id: 's-lokus',
		title: 'S-Lokus (Parti / Weiß)',
		label: 'S-Lokus',
		status: 'completed',
		result: 'N/S',
		summary: 'Heterozygot für Weißscheckung — semi-dominanter Erbgang.',
		breeding:
			'Weißanteil in der Nachkommenschaft möglich; weitere Faktoren können die Ausprägung beeinflussen.',
		date: '09.07.2026',
		pdf: 's-lokus.pdf',
		category: 'farbgenetik',
		completed: true,
	},
	hd: {
		id: 'hd',
		title: 'Hüftdysplasie (HD)',
		label: 'HD',
		status: 'pending',
		result: 'folgt',
		summary: '',
		breeding: '',
		date: '',
		pdf: 'hd.pdf',
		category: 'orthopaedie',
		completed: false,
	},
	ed: {
		id: 'ed',
		title: 'Ellbogendysplasie (ED)',
		label: 'ED',
		status: 'pending',
		result: 'folgt',
		summary: '',
		breeding: '',
		date: '',
		pdf: 'ed.pdf',
		category: 'orthopaedie',
		completed: false,
	},
	patella: {
		id: 'patella',
		title: 'Patellaluxation',
		label: 'Patella',
		status: 'pending',
		result: 'folgt',
		summary: '',
		breeding: '',
		date: '',
		pdf: 'patella.pdf',
		category: 'orthopaedie',
		completed: false,
	},
	dok: {
		id: 'dok',
		title: 'DOK Augenuntersuchung',
		label: 'DOK',
		status: 'pending',
		result: 'folgt',
		summary: '',
		breeding: '',
		date: '',
		pdf: 'dok.pdf',
		category: 'augen',
		completed: false,
	},
	'dna-profil': {
		id: 'dna-profil',
		title: 'DNA-Profil',
		label: 'DNA-Profil',
		status: 'pending',
		result: 'folgt',
		summary: '',
		breeding: '',
		date: '',
		pdf: 'dna-profil.pdf',
		category: 'zuchtzulassung',
		completed: false,
	},
	register: {
		id: 'register',
		title: 'Registereintragung',
		label: 'Registereintragung',
		status: 'pending',
		result: 'folgt',
		summary: '',
		breeding: '',
		date: '',
		pdf: 'register.pdf',
		category: 'zuchtzulassung',
		completed: false,
	},
	ztp: {
		id: 'ztp',
		title: 'Zuchttauglichkeitsprüfung (ZTP)',
		label: 'Zuchttauglichkeitsprüfung (ZTP)',
		status: 'pending',
		result: 'folgt',
		summary: '',
		breeding: '',
		date: '',
		pdf: 'ztp.pdf',
		category: 'zuchtzulassung',
		completed: false,
	},
};

/** Canonical section order — overview, details, anchors, and PDF sequence derive from this. */
export const healthReportSections: HealthReportSection[] = [
	{
		id: 'genetik',
		title: 'Genetik',
		intro: 'Genetische Untersuchungen zu erblichen Erkrankungen und Farbmerkmalen.',
		subsections: [
			{
				title: 'Erbkrankheiten',
				recordIds: ['dm', 'news', 'vwd-typ-1', 'prcd-pra', 'rcd4-pra'],
			},
			{
				title: 'Farbgenetik',
				recordIds: ['a-lokus', 'b-lokus', 'd-lokus', 'e-lokus', 'i-lokus', 'k-lokus', 's-lokus'],
			},
		],
	},
	{
		id: 'orthopaedie',
		title: 'Orthopädie',
		intro: 'Orthopädische Untersuchungen des Bewegungsapparates.',
		pendingStatus: 'planned-growth',
		recordIds: ['hd', 'ed', 'patella'],
	},
	{
		id: 'augen',
		title: 'Augen',
		intro: 'Augenfachärztliche Untersuchungen zur Beurteilung der Zuchttauglichkeit.',
		pendingStatus: 'planned-growth',
		recordIds: ['dok'],
	},
	{
		id: 'zuchtzulassung',
		title: 'Identität & Zucht',
		intro: 'Nachweise zur Identität und zuchtrelevanten Dokumentation.',
		pendingStatus: 'planned-breeding',
		recordIds: ['dna-profil', 'register', 'ztp'],
	},
];

function getSectionRecordIds(section: HealthReportSection): string[] {
	if (section.subsections) {
		return section.subsections.flatMap((subsection) => subsection.recordIds);
	}
	return section.recordIds ?? [];
}

function toOverviewItem(recordId: string): HealthOverviewItem {
	const record = healthRecordsById[recordId];
	return {
		label: record.label,
		completed: record.completed,
		targetId: recordId,
	};
}

export const healthOverviewGroups: HealthOverviewGroup[] = healthReportSections.map((section) => ({
	id: section.id,
	title: section.title,
	intro: section.intro,
	pendingStatus: section.pendingStatus,
	subsections: section.subsections?.map((subsection) => ({
		title: subsection.title,
		items: subsection.recordIds.map(toOverviewItem),
	})),
	items: section.recordIds?.map(toOverviewItem),
}));

export const healthRecords: HealthRecord[] = healthReportSections.flatMap((section) =>
	getSectionRecordIds(section).map((recordId) => healthRecordsById[recordId]),
);

export const healthDocumentationProgress: HealthDocumentationProgress[] = healthReportSections.map(
	(section) => {
		const recordIds = getSectionRecordIds(section);
		const completed = recordIds.filter((id) => healthRecordsById[id].completed).length;

		return {
			id: section.id,
			title: section.title,
			completed,
			total: recordIds.length,
		};
	},
);

export function getHealthRecord(id: string): HealthRecord {
	return healthRecordsById[id];
}

export function getHealthItemStatusLabel(
	item: HealthOverviewItem,
	pendingStatus?: HealthPendingStatus,
): string {
	if (item.completed) return 'Abgeschlossen';
	if (pendingStatus) return healthPendingStatusLabels[pendingStatus];
	return 'Folgt im weiteren Zuchtverlauf';
}

export function getCertificateUrl(pdf: string): string {
	return `/certificates/${pdf}`;
}
