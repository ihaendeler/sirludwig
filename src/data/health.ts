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

export const healthCategoryLabels: Record<HealthCategory, string> = {
	genetik: 'Genetik',
	farbgenetik: 'Farbgenetik',
	orthopaedie: 'Orthopädie',
	augen: 'Augen',
	zuchtzulassung: 'Zuchtzulassung',
};

export type HealthPendingStatus = 'planned-growth' | 'planned-breeding';

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

export const healthDocumentationProgress: HealthDocumentationProgress[] = [
	{ id: 'genetik', title: 'Genetik', completed: 12, total: 12 },
	{ id: 'orthopaedie', title: 'Orthopädie', completed: 0, total: 3 },
	{ id: 'augen', title: 'Augen', completed: 0, total: 1 },
	{
		id: 'zuchtzulassung',
		title: 'Identität & Zuchtzulassung',
		completed: 0,
		total: 3,
	},
];

export const healthOverviewIntro =
	'Alle Untersuchungsergebnisse werden nach Eingang veröffentlicht und mit dem jeweiligen Originalzertifikat dokumentiert. Bereits abgeschlossene Untersuchungen werden fortlaufend ergänzt. Altersabhängige Untersuchungen erfolgen nach Abschluss des Wachstums gemäß den zuchtrelevanten Empfehlungen.';

export const healthPendingStatusLabels: Record<HealthPendingStatus, string> = {
	'planned-growth': 'Geplant nach Abschluss des Wachstums',
	'planned-breeding': 'Folgt im weiteren Zuchtverlauf',
};

export const healthOverviewGroups: HealthOverviewGroup[] = [
	{
		id: 'genetik',
		title: 'Genetik',
		subsections: [
			{
				title: 'Erbkrankheiten',
				items: [
					{ label: 'DM', completed: true, targetId: 'dm' },
					{ label: 'NEWS', completed: true, targetId: 'news' },
					{ label: 'vWD Typ I', completed: true, targetId: 'vwd-typ-1' },
					{ label: 'prcd-PRA', completed: true, targetId: 'prcd-pra' },
					{ label: 'rcd4-PRA', completed: true, targetId: 'rcd4-pra' },
				],
			},
			{
				title: 'Farbgenetik',
				items: [
					{ label: 'A-Lokus', completed: true, targetId: 'a-lokus' },
					{ label: 'B-Lokus', completed: true, targetId: 'b-lokus' },
					{ label: 'D-Lokus', completed: true, targetId: 'd-lokus' },
					{ label: 'E-Lokus', completed: true, targetId: 'e-lokus' },
					{ label: 'I-Lokus', completed: true, targetId: 'i-lokus' },
					{ label: 'K-Lokus', completed: true, targetId: 'k-lokus' },
					{ label: 'S-Lokus', completed: true, targetId: 's-lokus' },
				],
			},
		],
	},
	{
		id: 'orthopaedie',
		title: 'Orthopädie',
		pendingStatus: 'planned-growth',
		items: [
			{ label: 'HD', completed: false, targetId: 'hd' },
			{ label: 'ED', completed: false, targetId: 'ed' },
			{ label: 'Patella', completed: false, targetId: 'patella' },
		],
	},
	{
		id: 'augen',
		title: 'Augen',
		pendingStatus: 'planned-growth',
		items: [{ label: 'DOK', completed: false, targetId: 'dok' }],
	},
	{
		id: 'zuchtzulassung',
		title: 'Identität & Zuchtzulassung',
		pendingStatus: 'planned-breeding',
		items: [
			{ label: 'DNA-Profil', completed: false, targetId: 'dna-profil' },
			{ label: 'Registereintragung', completed: false, targetId: 'register' },
			{ label: 'Zuchttauglichkeitsprüfung (ZTP)', completed: false, targetId: 'ztp' },
		],
	},
];

export function getHealthItemStatusLabel(
	item: HealthOverviewItem,
	pendingStatus?: HealthPendingStatus,
): string {
	if (item.completed) return 'Abgeschlossen';
	if (pendingStatus) return healthPendingStatusLabels[pendingStatus];
	return 'Folgt im weiteren Zuchtverlauf';
}

export const healthRecords: HealthRecord[] = [
	{
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
	{
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
	{
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
	{
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
	{
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
	{
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
	{
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
	{
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
	{
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
	{
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
	{
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
	{
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
	{
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
	{
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
	{
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
	{
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
	{
		id: 'register',
		title: 'Register',
		label: 'Register',
		status: 'pending',
		result: 'folgt',
		summary: '',
		breeding: '',
		date: '',
		pdf: 'register.pdf',
		category: 'zuchtzulassung',
		completed: false,
	},
	{
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
	{
		id: 'ztp',
		title: 'Zuchttauglichkeitsprüfung (ZTP)',
		label: 'ZTP',
		status: 'pending',
		result: 'folgt',
		summary: '',
		breeding: '',
		date: '',
		pdf: 'ztp.pdf',
		category: 'zuchtzulassung',
		completed: false,
	},
];

export function getCertificateUrl(pdf: string): string {
	return `/certificates/${pdf}`;
}
