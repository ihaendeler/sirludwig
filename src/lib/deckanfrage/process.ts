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
import { decodeScenario, scenarioLines, type Scenario } from '../color/model';

export const INQUIRY_RECIPIENT = 'deckanfrage@sirludwig.de';

export const MIN_SUBMIT_MS = 3_000;
export const MAX_SUBMIT_MS = 24 * 60 * 60 * 1_000;
export const SEND_ERROR =
	'Die Anfrage konnte derzeit nicht übermittelt werden. Bitte versuchen Sie es später erneut.';

export function isEmail(value: string): boolean {
	return value.length <= 254 && /^[^\s@\x00-\x1f\x7f]+@[^\s@\x00-\x1f\x7f]+\.[^\s@\x00-\x1f\x7f]+$/.test(value);
}

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
	colorScenario?: Scenario | null;
}

export type ProcessResult =
	| { ok: true; payload: DeckanfragePayload }
	| { ok: false; code: string; message: string; status: number; fields?: Record<string, string> };

function clean(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

function hasCommPref(prefs: string[], key: string): boolean {
	return prefs.includes(key);
}

export function parseDeckanfrageFormData(formData: FormData): ProcessResult {
	// Reject uploaded files, excessive text and duplicate scalar fields before building an email.
	const seen = new Set<string>();
	for (const [key, value] of formData) {
		if (typeof value !== 'string' || value.length > (key === 'message' ? 5_000 : key === 'color-scenario' ? 1_000 : 300)) {
			return validationError();
		}
		if (key !== 'comm-pref' && seen.has(key)) return validationError();
		if (key !== 'message' && /[\x00-\x1f\x7f]/.test(value)) return validationError();
		seen.add(key);
	}

	const honeypot = clean(formData.get('_honeypot'));
	if (honeypot) {
		return { ok: true, payload: emptyPayload() };
	}

	const formStartedAt = clean(formData.get('_form-started-at'));
	const startedMs = /^\d{13}$/.test(formStartedAt) ? Number(formStartedAt) : NaN;
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
		return validationError('privacy-consent', 'Bitte der Verarbeitung Ihrer Angaben zustimmen.');
	}

	const commPrefs = [...new Set(formData.getAll('comm-pref').map((entry) => clean(entry)))];

	if (commPrefs.length === 0 || commPrefs.some((pref) => !Object.hasOwn(commPrefLabels, pref))) {
		return validationError('comm-pref', 'Bitte mindestens einen Kontaktweg auswählen.');
	}

	const commEmail = clean(formData.get('comm-email'));
	const commPhone = clean(formData.get('comm-phone'));
	const commWhatsapp = clean(formData.get('comm-whatsapp'));
	const commInstagram = clean(formData.get('comm-instagram'));

	if (hasCommPref(commPrefs, 'email')) {
		if (!isEmail(commEmail)) {
			return validationError('comm-email', 'Bitte eine gültige E-Mail-Adresse angeben.');
		}
	}

	if (hasCommPref(commPrefs, 'phone') && !commPhone) return validationError('comm-phone', 'Bitte eine Telefonnummer angeben.');
	if (hasCommPref(commPrefs, 'whatsapp') && !commWhatsapp) return validationError('comm-whatsapp', 'Bitte eine WhatsApp-Nummer angeben.');
	if (hasCommPref(commPrefs, 'instagram') && !formatInstagramProfile(commInstagram)) return validationError('comm-instagram', 'Bitte einen gültigen Instagram-Namen oder Profillink angeben.');
	if (commEmail && !isEmail(commEmail)) return validationError('comm-email', 'Bitte eine gültige E-Mail-Adresse angeben.');

	const contactName = clean(formData.get('contact-name'));
	if (!contactName) return validationError('contact-name', 'Bitte Ihren Namen angeben.');
	const colorRaw = clean(formData.get('color-scenario'));
	const colorScenario = colorRaw ? decodeScenario(colorRaw) : null;
	if (colorRaw && !colorScenario) return validationError('color-scenario', 'Bitte die Farbberechnung erneut übernehmen oder entfernen.');

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
		bitchBirthdate: normalizeBirthdate(clean(formData.get('bitch-birthdate'))),
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
		colorScenario,
	};

	const selects = [
		[federalStateOptions, payload.contactState, 'contact-state'],
		[hdOptions, payload.healthHd, 'health-hd'],
		[edOptions, payload.healthEd, 'health-ed'],
		[patellaOptions, payload.healthPatella, 'health-patella'],
		[eyeOptions, payload.healthEyes, 'health-eyes'],
		[dnaOptions, payload.healthDna, 'health-dna'],
		[existingLittersOptions, payload.planExistingLitters, 'plan-existing-litters'],
	] as const;
	for (const [options, value, field] of selects) {
		if (!options.some((option) => option.value === value)) return validationError(field, 'Bitte einen Eintrag aus der Liste auswählen.');
	}
	if (payload.bitchBirthdate && (!isValidBirthdate(payload.bitchBirthdate) ||
		payload.bitchBirthdate > new Date().toISOString().slice(0, 10))) return validationError('bitch-birthdate', 'Bitte ein gültiges Geburtsdatum angeben, das nicht in der Zukunft liegt.');
	for (const [value, step, field] of [[payload.bitchSize, 1, 'bitch-size'], [payload.bitchWeight, 0.1, 'bitch-weight']] as const) {
		if (value && (!/^\d+(?:\.\d+)?$/.test(value) || Number(value) < 1 || Number(value) > 99 ||
			Math.abs(Number(value) / step - Math.round(Number(value) / step)) > 1e-8)) {
			return validationError(field, 'Bitte einen Wert zwischen 1 und 99 im vorgesehenen Format angeben.');
		}
	}

	return { ok: true, payload };
}

function validationError(field?: string, fieldMessage?: string): ProcessResult {
	return {
		ok: false,
		code: 'validation',
		message: fieldMessage ?? 'Bitte prüfen Sie Ihre Angaben.',
		status: 400,
		...(field && fieldMessage ? { fields: { [field]: fieldMessage } } : {}),
	};
}

function normalizeBirthdate(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) return '';

	const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})$/);
	if (isoMatch) return isoMatch[1];

	const deMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
	if (deMatch) {
		const [, day, month, year] = deMatch;
		return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
	}

	return trimmed;
}

function isValidBirthdate(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

	const [yearStr, monthStr, dayStr] = value.split('-');
	const year = Number(yearStr);
	const month = Number(monthStr);
	const day = Number(dayStr);

	if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
		return false;
	}

	if (month < 1 || month > 12 || day < 1 || day > 31) return false;

	const date = new Date(year, month - 1, day);
	return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
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
	const normalized = normalizeBirthdate(birthdate);
	if (!normalized || !isValidBirthdate(normalized)) return 'nicht angegeben';

	const [yearStr, monthStr, dayStr] = normalized.split('-');
	const birthYear = Number(yearStr);
	const birthMonth = Number(monthStr);
	const birthDay = Number(dayStr);

	const now = new Date();
	let years = now.getFullYear() - birthYear;
	let months = now.getMonth() + 1 - birthMonth;

	if (now.getDate() < birthDay) {
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

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function formatInstagramProfile(value: string): {
	display: string;
	url: string;
} | null {
	const trimmed = value.trim();
	if (!trimmed) return null;

	const urlMatch = trimmed.match(
		/^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([A-Za-z0-9._]{1,30})\/?(?:\?[^\s#]*)?(?:#[^\s]*)?$/i,
	);
	if (urlMatch) {
		const username = urlMatch[1];
		return {
			display: `@${username}`,
			url: `https://instagram.com/${username}`,
		};
	}

	const username = trimmed.replace(/^@+/, '').replace(/\/$/, '');
	if (!/^[A-Za-z0-9._]{1,30}$/.test(username)) return null;

	return {
		display: trimmed.startsWith('@') ? trimmed : `@${username}`,
		url: `https://instagram.com/${username}`,
	};
}

function formatInstagramForText(value: string): string {
	const profile = formatInstagramProfile(value);
	if (!profile) return displayValue(value);

	return `${profile.display} (${profile.url})`;
}

function formatInstagramForHtml(value: string): string {
	const profile = formatInstagramProfile(value);
	if (!profile) return escapeHtml(displayValue(value));

	return `<a href="${escapeHtml(profile.url)}">${escapeHtml(profile.display)}</a>`;
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
	const normalized = normalizeBirthdate(value);
	if (!normalized) return 'nicht angegeben';
	if (!isValidBirthdate(normalized)) return displayValue(value);

	const [year, month, day] = normalized.split('-');
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
		commLines.push(`Instagram-Profil: ${formatInstagramForText(payload.commInstagram)}`);
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
		...(payload.colorScenario ? [section('Farbberechnung', scenarioLines(payload.colorScenario))] : []),
	];

	return sections.join('\n').trim();
}

function buildCommLinesHtml(payload: DeckanfragePayload): string[] {
	const commLines = [`Bevorzugte Wege: ${escapeHtml(formatCommPrefs(payload.commPrefs))}`];

	if (payload.commPrefs.includes('email')) {
		commLines.push(`E-Mail-Adresse: ${escapeHtml(displayValue(payload.commEmail))}`);
	}
	if (payload.commPrefs.includes('phone')) {
		commLines.push(`Telefonnummer: ${escapeHtml(displayValue(payload.commPhone))}`);
	}
	if (payload.commPrefs.includes('whatsapp')) {
		commLines.push(`WhatsApp-Nummer: ${escapeHtml(displayValue(payload.commWhatsapp))}`);
	}
	if (payload.commPrefs.includes('instagram')) {
		commLines.push(`Instagram-Profil: ${formatInstagramForHtml(payload.commInstagram)}`);
	}

	return commLines;
}

function sectionHtml(title: string, lines: string[]): string {
	const items = lines.map((line) => `<li>${line}</li>`).join('');
	return `<h2 style="margin:1.5rem 0 0.5rem;font-size:1rem;font-weight:600;">${escapeHtml(title)}</h2><ul style="margin:0 0 1rem;padding-left:1.25rem;">${items}</ul>`;
}

export function buildDeckanfrageEmailHtml(payload: DeckanfragePayload): string {
	const sections = [
		'<p style="margin:0 0 1rem;">Neue Deckanfrage über sirludwig.de</p>',
		sectionHtml('Kontaktdaten', [
			`Name: ${escapeHtml(displayValue(payload.contactName))}`,
			`Ort / Stadt: ${escapeHtml(displayValue(payload.contactCity))}`,
			`Bundesland: ${escapeHtml(labelForOption(federalStateOptions, payload.contactState))}`,
		]),
		sectionHtml('Kommunikation', buildCommLinesHtml(payload)),
		sectionHtml('Hündin', [
			`Name der Hündin: ${escapeHtml(displayValue(payload.bitchName))}`,
			`Geburtsdatum: ${escapeHtml(formatBirthdate(payload.bitchBirthdate))}`,
			`Alter: ${escapeHtml(calculateBitchAge(payload.bitchBirthdate))}`,
			`Farbe: ${escapeHtml(displayValue(payload.bitchColor))}`,
			`Größe: ${escapeHtml(displayWithUnit(payload.bitchSize, 'cm'))}`,
			`Gewicht: ${escapeHtml(displayWithUnit(payload.bitchWeight, 'kg'))}`,
			`Verein / Verband: ${escapeHtml(displayValue(payload.bitchClub))}`,
		]),
		sectionHtml('Gesundheit', [
			`HD: ${escapeHtml(labelForOption(hdOptions, payload.healthHd))}`,
			`ED: ${escapeHtml(labelForOption(edOptions, payload.healthEd))}`,
			`Patella: ${escapeHtml(labelForOption(patellaOptions, payload.healthPatella))}`,
			`Augenuntersuchung: ${escapeHtml(labelForOption(eyeOptions, payload.healthEyes))}`,
			`DNA-Tests: ${escapeHtml(labelForOption(dnaOptions, payload.healthDna))}`,
		]),
		sectionHtml('Planung', [
			`Geplanter Deckzeitraum: ${escapeHtml(displayValue(payload.planPeriod))}`,
			`Bereits vorhandene Würfe: ${escapeHtml(labelForOption(existingLittersOptions, payload.planExistingLitters))}`,
		]),
		sectionHtml('Nachricht', [escapeHtml(displayValue(payload.message)).replace(/\n/g, '<br>')]),
		...(payload.colorScenario ? [sectionHtml('Farbberechnung', scenarioLines(payload.colorScenario).map(escapeHtml))] : []),
	];

	return `<!DOCTYPE html><html lang="de"><body style="font-family:system-ui,sans-serif;color:#4a3428;line-height:1.5;">${sections.join('')}</body></html>`;
}

export function getReplyTo(payload: DeckanfragePayload): string | undefined {
	if (payload.commPrefs.includes('email') && isEmail(payload.commEmail)) {
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

	try {
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
				html: buildDeckanfrageEmailHtml(payload),
				...(getReplyTo(payload) ? { reply_to: getReplyTo(payload) } : {}),
			}),
			signal: AbortSignal.timeout(10_000),
		});

		if (!response.ok) {
			return {
				ok: false,
				message:
					'Die Anfrage konnte derzeit nicht übermittelt werden. Bitte versuchen Sie es später erneut.',
			};
		}

		return { ok: true };
	} catch {
		return { ok: false, message: SEND_ERROR };
	}
}
