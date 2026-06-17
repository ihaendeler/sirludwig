export type RecommendationStatus = 'folgt' | 'active';

export interface Recommendation {
	id: string;
	title: string;
	text: string;
	linkLabel: string;
	url: string;
	status: RecommendationStatus;
}

export const recommendations: Recommendation[] = [
	{
		id: 'rudel',
		title: 'Mein Rudel',
		text: 'Ludwig gehört zum Rudel FlyingRoyals von Reckewitz.',
		linkLabel: 'FlyingRoyals von Reckewitz besuchen',
		url: '#',
		status: 'folgt',
	},
	{
		id: 'grooming',
		title: 'Professionelles Grooming',
		text: 'Hier erhält Ludwig sein professionelles Grooming.',
		linkLabel: 'Grooming ansehen',
		url: '#',
		status: 'folgt',
	},
	{
		id: 'futter',
		title: 'Lieblingsfutter',
		text: 'Das Futter, das im Alltag von Ludwig genutzt wird.',
		linkLabel: 'Futter ansehen',
		url: '#',
		status: 'folgt',
	},
];

export function isRecommendationPending(item: Recommendation): boolean {
	return item.status === 'folgt' || item.url === '#' || item.url.trim() === '';
}
