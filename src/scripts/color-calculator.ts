import {
	calculateColors, decodeScenario, exampleScenario, formatProbability, LOCI, ownScenario,
	parseScenario, PRESETS, SCENARIO_STORAGE_KEY, scenarioFromQuery, scenarioQuery, SOURCE_KEYS,
	type Locus, type Scenario,
} from '../lib/color/model';

export function readColorSession(): Scenario | null {
	try { return decodeScenario(sessionStorage.getItem(SCENARIO_STORAGE_KEY) ?? ''); } catch { return null; }
}

class ColorCalculator extends HTMLElement {
	private scenario: Scenario = exampleScenario();
	private ownDraft: Scenario = ownScenario();
	private initialized = false;
	private onExternal = (event: Event) => {
		const next = parseScenario((event as CustomEvent).detail);
		if (next) { this.scenario = next; this.render(false); }
	};

	connectedCallback() {
		document.addEventListener('color-scenario-set', this.onExternal);
		if (this.initialized) return;
		this.initialized = true;
		const linked = scenarioFromQuery(location.search);
		const attached = this.closest('form')?.querySelector<HTMLInputElement>('[data-color-scenario]')?.value;
		this.scenario = linked ?? decodeScenario(attached ?? '') ?? readColorSession() ?? exampleScenario();
		if (this.scenario.mode === 'own') this.ownDraft = { ...this.scenario };
		this.addEventListener('change', (event) => this.onChange(event));
		this.querySelector('[data-color-apply]')?.addEventListener('click', () => {
			document.dispatchEvent(new CustomEvent('color-scenario-apply', { detail: this.scenario }));
			this.status('Die Kombination wurde für Ihre Anfrage übernommen.');
		});
		this.querySelector('[data-color-share]')?.addEventListener('click', () => void this.share());
		this.querySelector('[data-color-guide]')?.addEventListener('click', () => {
			const guide = this.querySelector<HTMLDetailsElement>('.tuxedo-guide-disclosure');
			if (guide) guide.open = true;
		});
		this.render(false);
		if (this.scenario.mode === 'own') this.querySelector<HTMLDetailsElement>('[data-color-genetics]')!.open = true;
		if (new URLSearchParams(location.search).has('v') && !linked) {
			this.status('Der Link enthält kein gültiges Farbszenario. Sie können hier mit einem Beispiel starten.');
		}
	}

	disconnectedCallback() { document.removeEventListener('color-scenario-set', this.onExternal); }

	private onChange(event: Event) {
		const target = event.target;
		if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
		if (target.matches('[data-color-mode]')) {
			if (this.scenario.mode === 'own') this.ownDraft = { ...this.scenario };
			this.scenario = target.value === 'own' ? { ...this.ownDraft } : exampleScenario();
			const detail = this.querySelector<HTMLDetailsElement>('[data-color-genetics]');
			if (detail) detail.open = target.value === 'own';
		} else if (target.matches('[data-color-preset]')) {
			this.scenario = exampleScenario(target.value);
		} else if (target.matches('[data-color-locus]')) {
			const locus = target.dataset.colorLocus as Locus;
			if (!LOCI.includes(locus)) return;
			Object.assign(this.scenario, {
				[locus]: target.value,
				[SOURCE_KEYS[locus]]: target.value === 'unknown' ? 'unknown' : this.scenario.mode === 'example' ? 'example' : 'assumed',
			});
		} else if (target.matches('[data-color-source]')) {
			const locus = target.dataset.colorSource as Locus;
			if (!LOCI.includes(locus)) return;
			Object.assign(this.scenario, { [SOURCE_KEYS[locus]]: target.value });
		} else return;
		if (!parseScenario(this.scenario)) return;
		this.render(true);
	}

	private status(message: string) {
		const target = this.querySelector('[data-color-status]');
		if (target) target.textContent = message;
	}

	private render(announce: boolean) {
		const own = this.scenario.mode === 'own';
		if (own) this.ownDraft = { ...this.scenario };
		this.querySelectorAll<HTMLInputElement>('[data-color-mode]').forEach((input) => input.checked = input.value === this.scenario.mode);
		this.querySelectorAll<HTMLElement>('[data-color-presets]').forEach((el) => el.hidden = own);
		this.querySelectorAll<HTMLElement>('[data-color-own-hint], [data-color-source-field]').forEach((el) => el.hidden = !own);
		const preset = this.querySelector<HTMLSelectElement>('[data-color-preset]');
		if (preset) preset.value = PRESETS.find((p) => LOCI.every((l) => p[l] === this.scenario[l]))?.id ?? 'custom';
		for (const locus of LOCI) {
			const field = this.querySelector<HTMLSelectElement>(`[data-color-locus="${locus}"]`);
			const source = this.querySelector<HTMLSelectElement>(`[data-color-source="${locus}"]`);
			if (field) field.value = this.scenario[locus];
			if (source) {
				source.disabled = !own || this.scenario[locus] === 'unknown';
				const unknownOption = source.querySelector<HTMLOptionElement>('option[value="unknown"]');
				if (unknownOption) unknownOption.disabled = this.scenario[locus] !== 'unknown';
				source.value = own ? this.scenario[SOURCE_KEYS[locus]] : 'unknown';
			}
		}
		const result = calculateColors(this.scenario);
		for (const color of result.colors) {
			const row = this.querySelector<HTMLElement>(`[data-color-result="${color.id}"]`);
			if (row) row.dataset.zero = String(color.probability.max === 0);
			const value = row?.querySelector('[data-color-probability]');
			if (value) value.textContent = formatProbability(color.probability);
		}
		for (const spot of result.spotting) {
			const value = this.querySelector(`[data-color-spotting="${spot.genotype}"]`);
			if (value) value.textContent = formatProbability(spot.probability);
		}
		const unknown = this.querySelector<HTMLElement>('[data-color-unknown]');
		if (unknown) {
			unknown.hidden = result.unknown.length === 0;
			unknown.textContent = 'Unbekannte Genwerte: Die Spannen zeigen mögliche Ergebnisse im Modell, keine geschätzte Verteilung.';
		}
		const kind = this.querySelector('[data-color-kind]');
		if (kind) kind.textContent = own ? 'Eigene Angaben' : 'Beispielsimulation';
		const inquiry = this.querySelector<HTMLAnchorElement>('[data-color-inquire]');
		if (inquiry) inquiry.href = `/deckanfrage?${scenarioQuery(this.scenario)}#color-inquiry`;
		if (announce && this.dataset.embedded !== 'true') {
			const url = new URL(location.href); url.search = scenarioQuery(this.scenario);
			history.replaceState(null, '', url);
		}
		this.querySelector<HTMLElement>('[data-color-copy]')?.setAttribute('hidden', '');
		try { sessionStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(this.scenario)); } catch { /* Calculator works without storage. */ }
		document.dispatchEvent(new CustomEvent('color-scenario-change', { detail: this.scenario }));
		if (announce) this.status(`${own ? 'Eigene Angaben' : 'Beispielsimulation'}: Die Ergebnisse wurden aktualisiert.`);
	}

	private async share() {
		const url = new URL(`/farbrechner?${scenarioQuery(this.scenario)}`, location.origin).href;
		try {
			if (navigator.share) { await navigator.share({ title: 'Farbszenario mit Sir Ludwig', url }); return; }
			if (navigator.clipboard) { await navigator.clipboard.writeText(url); this.status('Der anonyme Szenario-Link wurde kopiert.'); return; }
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') return;
		}
		const wrapper = this.querySelector<HTMLElement>('[data-color-copy]');
		const input = this.querySelector<HTMLInputElement>('[data-color-share-url]');
		if (wrapper && input) {
			wrapper.hidden = false;
			input.value = url;
			input.focus(); input.select();
			this.status('Den Szenario-Link können Sie hier kopieren.');
		}
	}
}

if (!customElements.get('color-calculator')) customElements.define('color-calculator', ColorCalculator);
