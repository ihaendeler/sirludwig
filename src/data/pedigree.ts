export interface PedigreeAncestor {
	id: string;
	role: string;
	name: string;
}

export interface PedigreeParent {
	id: string;
	role: string;
	name: string;
	grandparents: PedigreeAncestor[];
}

export interface PedigreeSubject {
	name: string;
	role: string;
}

export const pedigreeSubject: PedigreeSubject = {
	name: 'Ludwig',
	role: 'Sir Ludwig',
};

export const pedigreeParents: PedigreeParent[] = [
	{
		id: 'father',
		role: 'Vater',
		name: 'folgt',
		grandparents: [
			{
				id: 'father-paternal-grandfather',
				role: 'Großvater väterlicherseits',
				name: 'folgt',
			},
			{
				id: 'father-paternal-grandmother',
				role: 'Großmutter väterlicherseits',
				name: 'folgt',
			},
		],
	},
	{
		id: 'mother',
		role: 'Mutter',
		name: 'folgt',
		grandparents: [
			{
				id: 'mother-maternal-grandfather',
				role: 'Großvater mütterlicherseits',
				name: 'folgt',
			},
			{
				id: 'mother-maternal-grandmother',
				role: 'Großmutter mütterlicherseits',
				name: 'folgt',
			},
		],
	},
];

export const pedigreeLines: string[] = [
	'Willowbane',
	'Knapps',
	"Wekay's",
	'Family Affairs',
	'Panda Sharm',
];
