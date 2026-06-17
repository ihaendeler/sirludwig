export interface SelectOption {
	value: string;
	label: string;
}

export const selectPlaceholder: SelectOption = { value: '', label: 'Bitte wählen' };

export const hdOptions: SelectOption[] = [
	selectPlaceholder,
	{ value: 'nicht-untersucht', label: 'nicht untersucht' },
	{ value: 'hd-a', label: 'HD A' },
	{ value: 'hd-b', label: 'HD B' },
	{ value: 'hd-c', label: 'HD C' },
	{ value: 'hd-d', label: 'HD D' },
	{ value: 'hd-e', label: 'HD E' },
];

export const edOptions: SelectOption[] = [
	selectPlaceholder,
	{ value: 'nicht-untersucht', label: 'nicht untersucht' },
	{ value: 'ed-0', label: 'ED 0' },
	{ value: 'ed-1', label: 'ED 1' },
	{ value: 'ed-2', label: 'ED 2' },
	{ value: 'ed-3', label: 'ED 3' },
];

export const patellaOptions: SelectOption[] = [
	selectPlaceholder,
	{ value: 'nicht-untersucht', label: 'nicht untersucht' },
	{ value: 'grad-0', label: 'Grad 0' },
	{ value: 'grad-1', label: 'Grad 1' },
	{ value: 'grad-2', label: 'Grad 2' },
	{ value: 'grad-3', label: 'Grad 3' },
	{ value: 'grad-4', label: 'Grad 4' },
];

export const eyeOptions: SelectOption[] = [
	selectPlaceholder,
	{ value: 'nicht-untersucht', label: 'nicht untersucht' },
	{ value: 'ohne-befund', label: 'ohne Befund' },
	{ value: 'mit-befund', label: 'mit Befund' },
];

export const dnaOptions: SelectOption[] = [
	selectPlaceholder,
	{ value: 'nicht-untersucht', label: 'nicht untersucht' },
	{ value: 'teilweise', label: 'teilweise vorhanden' },
	{ value: 'vollstaendig', label: 'vollständig vorhanden' },
];

export const existingLittersOptions: SelectOption[] = [
	{ value: '', label: 'Bitte auswählen' },
	{ value: 'keine', label: 'keine' },
	{ value: '1', label: '1' },
	{ value: '2', label: '2' },
	{ value: '3-plus', label: '3 oder mehr' },
];

export const federalStateOptions: SelectOption[] = [
	selectPlaceholder,
	{ value: 'baden-wuerttemberg', label: 'Baden-Württemberg' },
	{ value: 'bayern', label: 'Bayern' },
	{ value: 'berlin', label: 'Berlin' },
	{ value: 'brandenburg', label: 'Brandenburg' },
	{ value: 'bremen', label: 'Bremen' },
	{ value: 'hamburg', label: 'Hamburg' },
	{ value: 'hessen', label: 'Hessen' },
	{ value: 'mecklenburg-vorpommern', label: 'Mecklenburg-Vorpommern' },
	{ value: 'niedersachsen', label: 'Niedersachsen' },
	{ value: 'nordrhein-westfalen', label: 'Nordrhein-Westfalen' },
	{ value: 'rheinland-pfalz', label: 'Rheinland-Pfalz' },
	{ value: 'saarland', label: 'Saarland' },
	{ value: 'sachsen', label: 'Sachsen' },
	{ value: 'sachsen-anhalt', label: 'Sachsen-Anhalt' },
	{ value: 'schleswig-holstein', label: 'Schleswig-Holstein' },
	{ value: 'thueringen', label: 'Thüringen' },
	{ value: 'oesterreich', label: 'Österreich' },
	{ value: 'schweiz', label: 'Schweiz' },
	{ value: 'sonstiges', label: 'Sonstiges' },
];

export const commPrefLabels: Record<string, string> = {
	email: 'E-Mail',
	phone: 'Telefon',
	whatsapp: 'WhatsApp',
	instagram: 'Instagram',
};

export function labelForOption(options: SelectOption[], value: string): string {
	if (!value) return 'nicht angegeben';
	return options.find((option) => option.value === value)?.label ?? value;
}
