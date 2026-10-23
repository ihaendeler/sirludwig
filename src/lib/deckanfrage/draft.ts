export const SESSION_DRAFT_KEY = 'sirludwig.inquiry.session.v1';
export const SAVED_DRAFT_KEY = 'sirludwig.inquiry.saved.v1';
export const DRAFT_MAX_AGE = 7 * 24 * 60 * 60 * 1_000;
export const DRAFT_FIELDS = [
	'contact-name', 'contact-city', 'contact-state', 'comm-pref', 'comm-email', 'comm-phone',
	'comm-whatsapp', 'comm-instagram', 'bitch-name', 'bitch-birthdate', 'bitch-color',
	'bitch-size', 'bitch-weight', 'bitch-club', 'health-hd', 'health-ed', 'health-patella',
	'health-eyes', 'health-dna', 'plan-period', 'plan-existing-litters', 'message', 'color-scenario',
] as const;
export interface InquiryDraft { v: 1; savedAt: number; fields: Record<string, string | string[]> }

export function readDraft(json: string | null, now = Date.now()): InquiryDraft | null {
	if (!json || json.length > 20_000) return null;
	try {
		const data = JSON.parse(json) as InquiryDraft;
		if (data.v !== 1 || !Number.isFinite(data.savedAt) || data.savedAt > now + 60_000 || now - data.savedAt > DRAFT_MAX_AGE || !data.fields || typeof data.fields !== 'object' || Array.isArray(data.fields)) return null;
		const fields: InquiryDraft['fields'] = {};
		for (const key of DRAFT_FIELDS) {
			const value = data.fields[key];
			if (value === undefined) continue;
			if (key === 'comm-pref') {
				if (!Array.isArray(value) || value.length > 4 || value.some((v) => !['email', 'phone', 'whatsapp', 'instagram'].includes(v))) return null;
				fields[key] = [...new Set(value)];
			} else {
				if (typeof value !== 'string' || value.length > (key === 'message' ? 5_000 : key === 'color-scenario' ? 1_000 : 300)) return null;
				fields[key] = value;
			}
		}
		// Consent, timestamps and arbitrary additional fields are never restored.
		return { v: 1, savedAt: data.savedAt, fields };
	} catch { return null; }
}
