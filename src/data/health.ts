export type HealthCategory =
	| 'genetik'
	| 'farbgenetik'
	| 'orthopaedie'
	| 'augen'
	| 'zuchtzulassung';

export interface HealthRecord {
	id: string;
	title: string;
	navLabel: string;
	result: string;
	summary: string;
	breeding: string;
	date: string;
	pdf: string;
	category: HealthCategory;
	completed: boolean;
}

export interface HealthReportSubsection {
	title: string;
	recordIds: string[];
}

export interface HealthReportSection {
	id: string;
	title: string;
	intro: string;
	pendingNotice?: string;
	subsections?: HealthReportSubsection[];
	recordIds?: string[];
}

export interface HealthNavSubsection {
	title: string;
	items: { id: string; label: string }[];
}

export interface HealthNavGroup {
	id: string;
	title: string;
	subsections?: HealthNavSubsection[];
	items?: { id: string; label: string }[];
}

const healthRecordsById: Record<string, HealthRecord> = {
	dm: {
		id: 'dm',
		title: 'Degenerative Myelopathie (DM)',
		navLabel: 'Degenerative Myelopathie (DM)',
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
		navLabel: 'Neonatale Enzephalopathie (NEWS)',
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
		navLabel: 'Von-Willebrand-Erkrankung Typ I',
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
		navLabel: 'prcd-PRA',
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
		navLabel: 'rcd4-PRA',
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
		navLabel: 'A-Lokus',
		result: 'DY/BB1',
		summary: 'Für Ludwig wurde der ASIP-Haplotyp DY/BB1 ermittelt.',
		breeding:
			'Für die Farbplanung relevant; die sichtbare Ausprägung hängt vom Zusammenspiel mehrerer Farbloci ab.',
		date: '09.07.2026',
		pdf: 'a-lokus.pdf',
		category: 'farbgenetik',
		completed: true,
	},
	'b-lokus': {
		id: 'b-lokus',
		title: 'Braun-Lokus (B-Lokus)',
		navLabel: 'B-Lokus',
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
		navLabel: 'D-Lokus',
		result: 'N/N',
		summary: 'Kein d1-Allel nachgewiesen.',
		breeding: 'Keine Weitergabe der getesteten d1-Variante.',
		date: '09.07.2026',
		pdf: 'd-lokus.pdf',
		category: 'farbgenetik',
		completed: true,
	},
	'e-lokus': {
		id: 'e-lokus',
		title: 'Extension-Lokus (E-Lokus)',
		navLabel: 'E-Lokus',
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
		navLabel: 'I-Lokus',
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
		navLabel: 'K-Lokus',
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
		navLabel: 'S-Lokus',
		result: 'N/S',
		summary: 'Ludwig ist heterozygot N/S für die getestete Variante der Weißscheckung.',
		breeding:
			'Die getestete Variante kann an Nachkommen weitergegeben werden. Weitere genetische Faktoren können die Ausprägung der Weißzeichnung beeinflussen.',
		date: '09.07.2026',
		pdf: 's-lokus.pdf',
		category: 'farbgenetik',
		completed: true,
	},
	hd: {
		id: 'hd',
		title: 'Hüftdysplasie (HD)',
		navLabel: 'HD',
		result: '',
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
		navLabel: 'ED',
		result: '',
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
		navLabel: 'Patella',
		result: '',
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
		navLabel: 'DOK-Augenuntersuchung',
		result: '',
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
		navLabel: 'DNA-Profil',
		result: '',
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
		navLabel: 'Registereintragung',
		result: '',
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
		navLabel: 'Zuchttauglichkeitsprüfung',
		result: '',
		summary: '',
		breeding: '',
		date: '',
		pdf: 'ztp.pdf',
		category: 'zuchtzulassung',
		completed: false,
	},
};

/** Canonical section order — navigation, details, anchors, and PDF sequence derive from this. */
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
		pendingNotice: 'HD, ED und Patella werden im vorgesehenen Untersuchungszeitraum ergänzt.',
		recordIds: ['hd', 'ed', 'patella'],
	},
	{
		id: 'augen',
		title: 'Augen',
		intro: 'Augenfachärztliche Untersuchungen zur Beurteilung der Zuchttauglichkeit.',
		pendingNotice: 'Die DOK-Augenuntersuchung wird im weiteren Untersuchungsverlauf ergänzt.',
		recordIds: ['dok'],
	},
	{
		id: 'zuchtzulassung',
		title: 'Identität & Zucht',
		intro: 'Nachweise zur Identität und zuchtrelevanten Dokumentation.',
		pendingNotice:
			'DNA-Profil, Registereintragung und Zuchttauglichkeitsprüfung werden nach Vorliegen dokumentiert.',
		recordIds: ['dna-profil', 'register', 'ztp'],
	},
];

function getSectionRecordIds(section: HealthReportSection): string[] {
	if (section.subsections) {
		return section.subsections.flatMap((subsection) => subsection.recordIds);
	}
	return section.recordIds ?? [];
}

function toNavItem(recordId: string): { id: string; label: string } {
	const record = healthRecordsById[recordId];
	return { id: recordId, label: record.navLabel };
}

export const healthNavGroups: HealthNavGroup[] = healthReportSections.map((section) => ({
	id: section.id,
	title: section.title,
	subsections: section.subsections?.map((subsection) => ({
		title: subsection.title,
		items: subsection.recordIds.map(toNavItem),
	})),
	items: section.recordIds?.map(toNavItem),
}));

export const healthRecords: HealthRecord[] = healthReportSections.flatMap((section) =>
	getSectionRecordIds(section).map((recordId) => healthRecordsById[recordId]),
);

export function getHealthRecord(id: string): HealthRecord {
	return healthRecordsById[id];
}

export function getCertificateUrl(pdf: string): string {
	return `/certificates/${pdf}`;
}
