import {
	commPrefLabels,
	dnaOptions,
	edOptions,
	existingLittersOptions,
	eyeOptions,
	federalStateOptions,
	hdOptions,
	labelForOption,
	patellaOptions,
} from '../../data/deckanfrage-options';

export const INQUIRY_RECIPIENT = 'deckanfrage@sirludwig.de';

export const MIN_SUBMIT_MS = 3_000;
export const MAX_SUBMIT_MS = 24 * 60 * 60 * 1_000;

export interface DeckanfragePayload {
	contactName: string;
	contactCity: string;
	contactState: string;
	commPrefs: string[];
	commEmail: string;
	commPhone: string;
	commWhatsapp: string;
	commInstagram: string;
	bitchName: string;
	bitchBirthdate: string;
	bitchColor: string;
	bitchSize: string;
	bitchWeight: string;
	bitchClub: string;
	healthHd: string;
	healthEd: string;
	healthPatella: string;
	healthEyes: string;
	healthDna: string;
	planPeriod: string;
	planExistingLitters: string;
	message: string;
	privacyConsent: boolean;
	honeypot: string;
	formStartedAt: string;
}

export type ProcessResult =
	| { ok: true; payload: DeckanfragePayload }
	| { ok: false; code: string; message: string; status: number };

function clean(value: FormDataEntryValue | null): string {
	return typeof value === 'string' ? value.trim() : '';
}

function hasCommPref(prefs: string[], key: string): boolean {
	return prefs.includes(key);
}

export function parseDeckanfrageFormData(formData: FormData): ProcessResult {
	const honeypot = clean(formData.get('_honeypot'));
	if (honeypot) {
		return { ok: true, payload: emptyPayload() };
	}

	const formStartedAt = clean(formData.get('_form-started-at'));
	const startedMs = Number(formStartedAt);
	const elapsed = Number.isFinite(startedMs) ? Date.now() - startedMs : NaN;

	if (!Number.isFinite(elapsed) || elapsed < MIN_SUBMIT_MS || elapsed > MAX_SUBMIT_MS) {
		return {
			ok: false,
			code: 'spam',
			message:
				'Die Anfrage konnte derzeit nicht übermittelt werden. Bitte versuchen Sie es später erneut.',
			status: 400,
		};
	}

	const privacyConsent = formData.get('privacy-consent') === 'yes';
	if (!privacyConsent) {
		return {
			ok: false,
			code: 'validation',
			message:
				'Die Anfrage konnte derzeit nicht übermittelt werden. Bitte versuchen Sie es später erneut.',
			status: 400,
		};
	}

	const commPrefs = formData.getAll('comm-pref').map((entry) => clean(entry)).filter(Boolean);

	if (commPrefs.length === 0) {
		return {
			ok: false,
			code: 'validation',
			message:
				'Die Anfrage konnte derzeit nicht übermittelt werden. Bitte versuchen Sie es später erneut.',
			status: 400,
		};
	}

	const commEmail = clean(formData.get('comm-email'));
	const commPhone = clean(formData.get('comm-phone'));
	const commWhatsapp = clean(formData.get('comm-whatsapp'));
	const commInstagram = clean(formData.get('comm-instagram'));

	if (hasCommPref(commPrefs, 'email')) {
		if (!commEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(commEmail)) {
			return validationError();
		}
	}

	if (hasCommPref(commPrefs, 'phone') && !commPhone) return validationError();
	if (hasCommPref(commPrefs, 'whatsapp') && !commWhatsapp) return validationError();
	if (hasCommPref(commPrefs, 'instagram') && !commInstagram) return validationError();

	const contactName = clean(formData.get('contact-name'));
	if (!contactName) return validationError();

	const payload: DeckanfragePayload = {
		contactName,
		contactCity: clean(formData.get('contact-city')),
		contactState: clean(formData.get('contact-state')),
		commPrefs,
		commEmail,
		commPhone,
		commWhatsapp,
		commInstagram,
		bitchName: clean(formData.get('bitch-name')),
		bitchBirthdate: clean(formData.get('bitch-birthdate')),
		bitchColor: clean(formData.get('bitch-color')),
		bitchSize: clean(formData.get('bitch-size')),
		bitchWeight: clean(formData.get('bitch-weight')),
		bitchClub: clean(formData.get('bitch-club')),
		healthHd: clean(formData.get('health-hd')),
		healthEd: clean(formData.get('health-ed')),
		healthPatella: clean(formData.get('health-patella')),
		healthEyes: clean(formData.get('health-eyes')),
		healthDna: clean(formData.get('health-dna')),
		planPeriod: clean(formData.get('plan-period')),
		planExistingLitters: clean(formData.get('plan-existing-litters')),
		message: clean(formData.get('message')),
		privacyConsent,
		honeypot,
		formStartedAt,
	};

	return { ok: true, payload };
}

function validationError(): ProcessResult {
	return {
		ok: false,
		code: 'validation',
		message:
			'Die Anfrage konnte derzeit nicht übermittelt werden. Bitte versuchen Sie es später erneut.',
		status: 400,
	};
}

function emptyPayload(): DeckanfragePayload {
	return {
		contactName: '',
		contactCity: '',
		contactState: '',
		commPrefs: [],
		commEmail: '',
		commPhone: '',
		commWhatsapp: '',
		commInstagram: '',
		bitchName: '',
		bitchBirthdate: '',
		bitchColor: '',
		bitchSize: '',
		bitchWeight: '',
		bitchClub: '',
		healthHd: '',
		healthEd: '',
		healthPatella: '',
		healthEyes: '',
		healthDna: '',
		planPeriod: '',
		planExistingLitters: '',
		message: '',
		privacyConsent: false,
		honeypot: 'filled',
		formStartedAt: '',
	};
}

export function calculateBitchAge(birthdate: string): string {
	if (!birthdate) return 'nicht angegeben';

	const birth = new Date(`${birthdate}T00:00:00`);
	if (Number.isNaN(birth.getTime())) return 'nicht angegeben';

	const now = new Date();
	let years = now.getFullYear() - birth.getFullYear();
	let months = now.getMonth() - birth.getMonth();

	if (now.getDate() < birth.getDate()) {
		months -= 1;
	}

	if (months < 0) {
		years -= 1;
		months += 12;
	}

	if (years < 0) return 'nicht angegeben';

	const yearLabel = years === 1 ? 'Jahr' : 'Jahre';
	const monthLabel = months === 1 ? 'Monat' : 'Monate';

	return `${years} ${yearLabel}, ${months} ${monthLabel}`;
}

function displayValue(value: string): string {
	return value || 'nicht angegeben';
}

function displayWithUnit(value: string, unit: string): string {
	if (!value) return 'nicht angegeben';
	return `${value} ${unit}`;
}

function formatCommPrefs(prefs: string[]): string {
	if (prefs.length === 0) return 'nicht angegeben';
	return prefs.map((pref) => commPrefLabels[pref] ?? pref).join(', ');
}

function formatBirthdate(value: string): string {
	if (!value) return 'nicht angegeben';
	const [year, month, day] = value.split('-');
	if (!year || !month || !day) return value;
	return `${day}.${month}.${year}`;
}

function section(title: string, lines: string[]): string {
	return [`${title}`, ...lines.map((line) => `- ${line}`), ''].join('\n');
}

export function buildDeckanfrageSubject(payload: DeckanfragePayload): string {
	if (payload.bitchName) {
		return `Neue Deckanfrage: ${payload.bitchName} von ${payload.contactName}`;
	}

	return 'Neue Deckanfrage über sirludwig.de';
}

export function buildDeckanfrageEmailText(payload: DeckanfragePayload): string {
	const commLines = [`Bevorzugte Wege: ${formatCommPrefs(payload.commPrefs)}`];

	if (payload.commPrefs.includes('email')) {
		commLines.push(`E-Mail-Adresse: ${displayValue(payload.commEmail)}`);
	}
	if (payload.commPrefs.includes('phone')) {
		commLines.push(`Telefonnummer: ${displayValue(payload.commPhone)}`);
	}
	if (payload.commPrefs.includes('whatsapp')) {
		commLines.push(`WhatsApp-Nummer: ${displayValue(payload.commWhatsapp)}`);
	}
	if (payload.commPrefs.includes('instagram')) {
		commLines.push(`Instagram-Profil: ${displayValue(payload.commInstagram)}`);
	}

	const sections = [
		'Neue Deckanfrage über sirludwig.de',
		'',
		section('Kontaktdaten', [
			`Name: ${displayValue(payload.contactName)}`,
			`Ort / Stadt: ${displayValue(payload.contactCity)}`,
			`Bundesland: ${labelForOption(federalStateOptions, payload.contactState)}`,
		]),
		section('Kommunikation', commLines),
		section('Hündin', [
			`Name der Hündin: ${displayValue(payload.bitchName)}`,
			`Geburtsdatum: ${formatBirthdate(payload.bitchBirthdate)}`,
			`Alter: ${calculateBitchAge(payload.bitchBirthdate)}`,
			`Farbe: ${displayValue(payload.bitchColor)}`,
			`Größe: ${displayWithUnit(payload.bitchSize, 'cm')}`,
			`Gewicht: ${displayWithUnit(payload.bitchWeight, 'kg')}`,
			`Verein / Verband: ${displayValue(payload.bitchClub)}`,
		]),
		section('Gesundheit', [
			`HD: ${labelForOption(hdOptions, payload.healthHd)}`,
			`ED: ${labelForOption(edOptions, payload.healthEd)}`,
			`Patella: ${labelForOption(patellaOptions, payload.healthPatella)}`,
			`Augenuntersuchung: ${labelForOption(eyeOptions, payload.healthEyes)}`,
			`DNA-Tests: ${labelForOption(dnaOptions, payload.healthDna)}`,
		]),
		section('Planung', [
			`Geplanter Deckzeitraum: ${displayValue(payload.planPeriod)}`,
			`Bereits vorhandene Würfe: ${labelForOption(existingLittersOptions, payload.planExistingLitters)}`,
		]),
		section('Nachricht', [displayValue(payload.message)]),
	];

	return sections.join('\n').trim();
}

export function getReplyTo(payload: DeckanfragePayload): string | undefined {
	if (payload.commEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.commEmail)) {
		return payload.commEmail;
	}

	return undefined;
}

export async function sendDeckanfrageEmail(
	payload: DeckanfragePayload,
	apiKey: string,
	fromEmail: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
	if (payload.honeypot) {
		return { ok: true };
	}

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: fromEmail,
			to: [INQUIRY_RECIPIENT],
			subject: buildDeckanfrageSubject(payload),
			text: buildDeckanfrageEmailText(payload),
			...(getReplyTo(payload) ? { reply_to: getReplyTo(payload) } : {}),
		}),
	});

	if (!response.ok) {
		return {
			ok: false,
			message:
				'Die Anfrage konnte derzeit nicht übermittelt werden. Bitte versuchen Sie es später erneut.',
		};
	}

	return { ok: true };
}
