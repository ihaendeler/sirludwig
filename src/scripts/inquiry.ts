import { calculateBitchAge, formatInstagramProfile, isEmail, SEND_ERROR } from '../lib/deckanfrage/process';
import {
	calculateColors, decodeScenario, exampleScenario, formatProbability, GENOTYPE_LABELS,
	LOCI, LOCUS_LABELS, ORIGIN_LABELS, parseScenario,
	scenarioFromQuery, scenarioQuery, SOURCE_KEYS, type Scenario,
} from '../lib/color/model';
import { DRAFT_FIELDS, readDraft, SAVED_DRAFT_KEY, SESSION_DRAFT_KEY, type InquiryDraft } from '../lib/deckanfrage/draft';

const form = document.querySelector<HTMLFormElement>('[data-inquiry-form]');
if (form) initializeInquiry(form);

function initializeInquiry(form: HTMLFormElement) {
	const incoming = scenarioFromQuery(location.search);
	const fields = form.querySelector<HTMLElement>('[data-inquiry-fields]')!;
	const review = form.querySelector<HTMLElement>('[data-inquiry-review]')!;
	const reviewContent = form.querySelector<HTMLElement>('[data-review-content]')!;
	const formError = form.querySelector<HTMLElement>('[data-form-error]')!;
	const submit = form.querySelector<HTMLButtonElement>('[data-inquiry-submit]')!;
	const success = document.querySelector<HTMLElement>('[data-form-success]')!;
	const timestamp = form.querySelector<HTMLInputElement>('[data-form-started-at]')!;
	const colorInput = form.querySelector<HTMLInputElement>('[data-color-scenario]')!;
	const colorSummary = form.querySelector<HTMLElement>('[data-color-summary]')!;
	const colorEditor = form.querySelector<HTMLDetailsElement>('[data-inquiry-color-editor]')!;
	const saveDraft = document.querySelector<HTMLInputElement>('[data-save-draft]')!;
	const draftStatus = document.querySelector<HTMLElement>('[data-draft-status]')!;
	let attached: Scenario | null = null;
	let sending = false;
	let reviewed = '';
	let completed = false;
	timestamp.value = String(Date.now());

	const field = (name: string) => form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${CSS.escape(name)}"]`);
	const scrollTo = (element: HTMLElement) => {
		element.scrollIntoView({ behavior: 'instant', block: 'start' });
	};
	const showMessage = (message: string) => { formError.textContent = message; formError.hidden = !message; };

	function attachColor(scenario: Scenario | null, syncEditor = false) {
		attached = scenario;
		colorInput.value = scenario ? JSON.stringify(scenario) : '';
		colorSummary.hidden = !scenario;
		const url = new URL(location.href);
		url.search = scenario ? scenarioQuery(scenario) : '';
		history.replaceState(null, '', url);
		if (!scenario) return;
		const kind = colorSummary.querySelector('[data-color-summary-kind]')!;
		kind.textContent = scenario.mode === 'example' ? 'Beispielsimulation · keine Gentest-Angaben Ihrer Hündin' : 'Eigene Angaben · Herkunft je Genwert angegeben';
		const list = colorSummary.querySelector('[data-color-summary-values]')!;
		list.replaceChildren();
		for (const locus of LOCI) {
			const li = document.createElement('li');
			li.textContent = `${LOCUS_LABELS[locus]}: ${GENOTYPE_LABELS[locus][scenario[locus]]} · ${ORIGIN_LABELS[scenario[SOURCE_KEYS[locus]]]}`;
			list.append(li);
		}
		if (syncEditor) document.dispatchEvent(new CustomEvent('color-scenario-set', { detail: scenario }));
	}

	function snapshot(): InquiryDraft {
		const values: InquiryDraft['fields'] = {};
		for (const key of DRAFT_FIELDS) {
			if (key === 'comm-pref') values[key] = [...form.querySelectorAll<HTMLInputElement>('[name="comm-pref"]:checked')].map((input) => input.value);
			else values[key] = field(key)?.value ?? '';
		}
		return { v: 1, savedAt: Date.now(), fields: values };
	}

	function persist() {
		if (completed) return;
		const json = JSON.stringify(snapshot());
		try { sessionStorage.setItem(SESSION_DRAFT_KEY, json); } catch { /* The current form still works. */ }
		if (saveDraft.checked) {
			try {
				localStorage.setItem(SAVED_DRAFT_KEY, json);
				const message = 'Entwurf auf diesem Gerät gespeichert. Die Zustimmung wird nicht gespeichert.';
				if (draftStatus.textContent !== message) draftStatus.textContent = message;
			}
			catch { draftStatus.textContent = 'Der Browser erlaubt das Speichern nicht. Ihre Angaben bleiben auf dieser Seite erhalten.'; }
		}
	}

	function clearStored() {
		try { sessionStorage.removeItem(SESSION_DRAFT_KEY); } catch { /* Storage can be disabled. */ }
		try { localStorage.removeItem(SAVED_DRAFT_KEY); } catch { /* Storage can be disabled. */ }
	}

	function restore() {
		let session: InquiryDraft | null = null;
		let saved: InquiryDraft | null = null;
		try { session = readDraft(sessionStorage.getItem(SESSION_DRAFT_KEY)); } catch { /* Optional storage. */ }
		try {
			saved = readDraft(localStorage.getItem(SAVED_DRAFT_KEY));
			if (!saved) localStorage.removeItem(SAVED_DRAFT_KEY);
		} catch { /* Optional storage. */ }
		const draft = session && saved ? (session.savedAt >= saved.savedAt ? session : saved) : session ?? saved;
		if (draft) {
			for (const [name, value] of Object.entries(draft.fields)) {
				if (name === 'comm-pref' && Array.isArray(value)) {
					form.querySelectorAll<HTMLInputElement>('[name="comm-pref"]').forEach((input) => input.checked = value.includes(input.value));
				} else if (typeof value === 'string' && field(name)) field(name)!.value = value;
			}
			const storedColor = decodeScenario(String(draft.fields['color-scenario'] ?? ''));
			attachColor(storedColor, true);
			draftStatus.textContent = 'Ihr Entwurf wurde wiederhergestellt. Bitte die Zustimmung vor dem Absenden erneut erteilen.';
		}
		saveDraft.checked = Boolean(saved);
		const consent = field('privacy-consent') as HTMLInputElement;
		consent.checked = false;
		if (incoming) attachColor(incoming, true);
	}

	function syncContacts() {
		form.querySelectorAll<HTMLInputElement>('[data-comm-toggle]').forEach((toggle) => {
			const wrapper = form.querySelector<HTMLElement>(`[data-comm-field="${toggle.value}"]`);
			const input = wrapper?.querySelector<HTMLInputElement>('[data-comm-input]');
			wrapper?.classList.toggle('is-visible', toggle.checked);
			if (input) {
				input.disabled = !toggle.checked; input.required = toggle.checked;
				if (!toggle.checked) { input.setCustomValidity(''); clearFieldError(input.name); }
			}
		});
	}

	function clearFieldError(name: string) {
		form.querySelector(`[data-field-error="${CSS.escape(name)}"]`)?.remove();
		const input = field(name);
		if (input) {
			input.setCustomValidity(''); input.removeAttribute('aria-invalid');
			const ids = (input.getAttribute('aria-describedby') ?? '').split(' ').filter((id) => id && id !== `error-${name}`);
			if (ids.length) input.setAttribute('aria-describedby', ids.join(' ')); else input.removeAttribute('aria-describedby');
		}
	}

	function fieldError(name: string, message: string) {
		clearFieldError(name);
		const input = field(name);
		if (!input || input.type === 'hidden') return;
		const error = document.createElement('p');
		error.className = 'inquiry-field__error'; error.id = `error-${name}`; error.dataset.fieldError = name; error.textContent = message;
		const parent = name === 'comm-pref' ? form.querySelector('[data-comm-section]') : input.closest('.inquiry-field, .inquiry-consent') ?? input.parentElement;
		parent?.append(error);
		input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', `${input.getAttribute('aria-describedby') ?? ''} ${error.id}`.trim());
		input.setCustomValidity(message);
	}

	function revealAndFocus(input: HTMLElement) {
		let parent: HTMLElement | null = input.parentElement;
		while (parent && parent !== form) { if (parent instanceof HTMLDetailsElement) parent.open = true; parent = parent.parentElement; }
		input.focus({ preventScroll: true }); scrollTo(input);
	}

	function validate(): boolean {
		form.querySelectorAll<HTMLElement>('[data-field-error]').forEach((el) => clearFieldError(el.dataset.fieldError!));
		showMessage('');
		if (!field('contact-name')!.value.trim()) fieldError('contact-name', 'Bitte Ihren Namen angeben.');
		const selected = [...form.querySelectorAll<HTMLInputElement>('[data-comm-toggle]:checked')];
		if (!selected.length) fieldError('comm-pref', 'Bitte mindestens einen Kontaktweg auswählen.');
		for (const toggle of selected) {
			const input = field(`comm-${toggle.value}`)!;
			const value = input.value.trim();
			if (!value) fieldError(input.name, 'Bitte die Kontaktangabe ergänzen.');
			else if (toggle.value === 'email' && !isEmail(value)) fieldError(input.name, 'Bitte eine gültige E-Mail-Adresse angeben.');
			else if (toggle.value === 'instagram' && !formatInstagramProfile(value)) fieldError(input.name, 'Bitte einen gültigen Instagram-Namen oder Profillink angeben.');
		}
		if (!(field('privacy-consent') as HTMLInputElement).checked) fieldError('privacy-consent', 'Bitte der Verarbeitung Ihrer Angaben zustimmen.');
		for (const input of form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input:invalid, select:invalid, textarea:invalid')) {
			if (!input.validity.customError) {
				const message = input.name === 'bitch-birthdate' ? 'Bitte ein gültiges Geburtsdatum angeben, das nicht in der Zukunft liegt.'
					: input.type === 'number' ? 'Bitte einen Wert zwischen 1 und 99 im vorgesehenen Format angeben.'
					: 'Bitte diese Angabe prüfen.';
				fieldError(input.name, message);
			}
		}
		const invalid = form.querySelector<HTMLElement>('input:invalid, select:invalid, textarea:invalid');
		if (invalid) { showFields(); showMessage('Bitte prüfen Sie die markierten Angaben.'); revealAndFocus(invalid); return false; }
		return true;
	}

	function showFields(focusName?: string) {
		fields.hidden = false; review.hidden = true;
		if (focusName && field(focusName)?.type !== 'hidden') revealAndFocus(field(focusName)!);
	}

	function reviewFingerprint() { return JSON.stringify([...new FormData(form)].filter(([key]) => key !== '_form-started-at')); }

	function appendReviewGroup(title: string, entries: [string, string][]) {
		const filled = entries.filter(([, value]) => value.trim());
		if (!filled.length) return;
		const group = document.createElement('section');
		const heading = document.createElement('h3'); heading.textContent = title;
		const dl = document.createElement('dl');
		for (const [label, value] of filled) {
			const row = document.createElement('div'); const dt = document.createElement('dt'); const dd = document.createElement('dd');
			dt.textContent = label; dd.textContent = value; row.append(dt, dd); dl.append(row);
		}
		group.append(heading, dl); reviewContent.append(group);
	}

	function openReview() {
		if (!validate()) return;
		persist(); reviewContent.replaceChildren();
		const value = (name: string) => {
			const input = field(name);
			return input instanceof HTMLSelectElement && input.value ? input.selectedOptions[0]?.textContent ?? input.value : input?.value ?? '';
		};
		appendReviewGroup('Kontakt', [['Name', value('contact-name')], ['Ort', value('contact-city')], ['Bundesland', value('contact-state')],
			...['email', 'phone', 'whatsapp', 'instagram'].filter((key) => form.querySelector<HTMLInputElement>(`[data-comm-toggle="${key}"]`)?.checked).map((key) => [({ email: 'E-Mail', phone: 'Telefon', whatsapp: 'WhatsApp', instagram: 'Instagram' } as Record<string, string>)[key], value(`comm-${key}`)] as [string, string])]);
		appendReviewGroup('Hündin', [['Name', value('bitch-name')], ['Geburtsdatum', value('bitch-birthdate')], ['Farbe', value('bitch-color')], ['Größe', value('bitch-size') ? `${value('bitch-size')} cm` : ''], ['Gewicht', value('bitch-weight') ? `${value('bitch-weight')} kg` : ''], ['Verein / Verband', value('bitch-club')]]);
		appendReviewGroup('Gesundheit', [['HD', value('health-hd')], ['ED', value('health-ed')], ['Patella', value('health-patella')], ['Augen', value('health-eyes')], ['DNA-Tests', value('health-dna')]]);
		appendReviewGroup('Planung und Nachricht', [['Zeitraum', value('plan-period')], ['Bisherige Würfe', value('plan-existing-litters')], ['Nachricht', value('message')]]);
		if (attached) {
			appendReviewGroup('Farbsimulation', [
				['Art', attached.mode === 'example' ? 'Beispielsimulation – keine Befunde Ihrer Hündin' : 'Eigene Angaben – nicht überprüft'],
				...LOCI.map((locus) => [LOCUS_LABELS[locus], `${GENOTYPE_LABELS[locus][attached![locus]]} · ${ORIGIN_LABELS[attached![SOURCE_KEYS[locus]]]}`] as [string, string]),
				...calculateColors(attached).colors.map((c) => [c.label, `${formatProbability(c.probability)} im Modell`] as [string, string]),
			]);
		}
		fields.hidden = true; review.hidden = false; reviewed = reviewFingerprint(); review.focus(); scrollTo(review);
	}

	form.querySelector('[data-review-button]')?.addEventListener('click', openReview);
	form.querySelector('[data-review-edit]')?.addEventListener('click', () => { showFields(); form.querySelector<HTMLElement>('[data-review-button]')?.focus(); });
	form.querySelector('[data-color-edit]')?.addEventListener('click', () => { colorEditor.open = true; colorEditor.querySelector<HTMLElement>('summary')?.focus(); scrollTo(colorEditor); });
	form.querySelector('[data-color-remove]')?.addEventListener('click', () => { attachColor(null); persist(); colorEditor.querySelector<HTMLElement>('summary')?.focus(); });
	document.addEventListener('color-scenario-apply', (event) => {
		const next = parseScenario((event as CustomEvent).detail); if (!next) return;
		attachColor(next); colorEditor.open = false; persist(); colorSummary.focus(); scrollTo(colorSummary);
	});
	document.addEventListener('color-scenario-change', (event) => {
		const next = parseScenario((event as CustomEvent).detail);
		if (attached && next) { attachColor(next); persist(); }
	});
	form.addEventListener('input', (event) => {
		const target = event.target;
		if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) clearFieldError(target.name);
		persist();
	});
	form.addEventListener('change', (event) => {
		const target = event.target;
		if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) clearFieldError(target.name);
		if (target instanceof HTMLInputElement && target.matches('[data-comm-toggle]')) { clearFieldError('comm-pref'); syncContacts(); }
		persist();
	});
	saveDraft.addEventListener('change', () => {
		if (saveDraft.checked) persist();
		else { try { localStorage.removeItem(SAVED_DRAFT_KEY); } catch { /* Optional storage. */ } draftStatus.textContent = 'Dauerhaft gespeicherter Entwurf entfernt. Ihre aktuellen Angaben bleiben erhalten.'; }
	});
	document.querySelector('[data-clear-draft]')?.addEventListener('click', () => {
		clearStored(); form.reset(); saveDraft.checked = false; attachColor(null); syncContacts(); showFields(); showMessage('');
		form.querySelectorAll<HTMLElement>('[data-field-error]').forEach((el) => clearFieldError(el.dataset.fieldError!));
		timestamp.value = String(Date.now()); document.dispatchEvent(new CustomEvent('color-scenario-set', { detail: exampleScenario() }));
		draftStatus.textContent = 'Entwurf und gespeicherte Angaben wurden gelöscht.';
	});

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		if (sending || completed) return;
		if (review.hidden || reviewFingerprint() !== reviewed) { showFields(); openReview(); return; }
		if (!validate()) { showFields(); return; }
		sending = true; submit.disabled = true; submit.textContent = 'Wird übermittelt …';
		const controller = new AbortController(); const timeout = window.setTimeout(() => controller.abort(), 20_000);
		try {
			const response = await fetch('/api/deckanfrage', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, signal: controller.signal });
			const data = await response.json().catch(() => ({})) as { ok?: boolean; message?: string; fields?: Record<string, string> };
			if (response.ok && data.ok === true) {
				completed = true; clearStored(); form.hidden = true;
				document.querySelector<HTMLElement>('.inquiry-draft-tools')!.hidden = true;
				document.querySelector<HTMLElement>('.inquiry-form__intro')!.hidden = true;
				success.hidden = false; success.focus(); scrollTo(success); return;
			}
			showFields(); showMessage(data.message || SEND_ERROR);
			if (data.fields && typeof data.fields === 'object') {
				if (data.fields['color-scenario']) { colorEditor.open = true; colorEditor.querySelector<HTMLElement>('summary')?.focus(); }
				for (const [name, message] of Object.entries(data.fields)) if (typeof message === 'string') fieldError(name, message);
				const invalid = form.querySelector<HTMLElement>('[aria-invalid="true"]'); if (invalid) revealAndFocus(invalid);
			}
		} catch { showMessage(SEND_ERROR); }
		finally { clearTimeout(timeout); sending = false; submit.disabled = false; submit.textContent = 'Anfrage absenden'; }
	});

	form.querySelectorAll<HTMLInputElement>('input[type="text"], input[type="email"], input[type="tel"]').forEach((input) => input.maxLength = input.type === 'email' ? 254 : 300);
	const message = field('message') as HTMLTextAreaElement; message.maxLength = 5_000;
	const birthdate = field('bitch-birthdate') as HTMLInputElement;
	birthdate.max = new Date().toISOString().slice(0, 10);
	const syncAge = () => { const hint = form.querySelector<HTMLElement>('[data-bitch-age]')!; hint.hidden = !birthdate.value; hint.textContent = birthdate.value ? `Alter: ${calculateBitchAge(birthdate.value)}` : ''; };
	birthdate.addEventListener('input', syncAge);
	document.documentElement.classList.add('js');
	restore(); syncContacts(); syncAge();
}
