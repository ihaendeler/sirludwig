import {
	calculateColors, decodeScenario, emptyScenario, formatProbability, LOCI,
	parseScenario, SCENARIO_STORAGE_KEY, scenarioFromQuery, scenarioQuery,
	type Locus, type Scenario,
} from '../lib/color/model';

function readColorSession(): Scenario | null {
	try { return decodeScenario(sessionStorage.getItem(SCENARIO_STORAGE_KEY) ?? ''); } catch { return null; }
}

class ColorCalculator extends HTMLElement {
	private scenario: Scenario = emptyScenario();
	private initialized = false;
	connectedCallback() {
		if (this.initialized) return;
		this.initialized = true;
		const linked = scenarioFromQuery(location.search);
		this.scenario = linked ?? readColorSession() ?? emptyScenario();
		this.addEventListener('change', (event) => this.onChange(event));
		this.render(false);
		if (new URLSearchParams(location.search).has('v') && !linked) {
			this.status('Der Link enthält keine gültige Farbberechnung. Bitte wählen Sie die Werte erneut aus.');
		}
	}

	private onChange(event: Event) {
		const target = event.target;
		if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
		if (target.matches('[data-color-locus]')) {
			const locus = target.dataset.colorLocus as Locus;
			if (!LOCI.includes(locus)) return;
			const next = parseScenario({ ...this.scenario, [locus]: target.value });
			if (!next) return;
			this.scenario = next;
		} else return;
		if (!parseScenario(this.scenario)) return;
		this.render(true);
	}

	private status(message: string) {
		const target = this.querySelector('[data-color-status]');
		if (target) target.textContent = message;
	}

	private render(announce: boolean) {
		for (const locus of LOCI) {
			const field = this.querySelector<HTMLSelectElement>(`[data-color-locus="${locus}"]`);
			if (field) field.value = this.scenario[locus];
		}
		const result = calculateColors(this.scenario);
		for (const color of result.colors) {
			const row = this.querySelector<HTMLElement>(`[data-color-result="${color.id}"]`);
			if (row) row.dataset.zero = String(!result.colorsReady || color.probability.max === 0);
			const value = row?.querySelector('[data-color-probability]');
			if (value) value.textContent = result.colorsReady ? formatProbability(color.probability) : '—';
		}
		for (const spot of result.spotting) {
			const value = this.querySelector(`[data-color-spotting="${spot.genotype}"]`);
			if (value) value.textContent = result.spottingReady ? formatProbability(spot.probability) : '—';
		}
		const colorsPending = this.querySelector<HTMLElement>('[data-color-pending]');
		if (colorsPending) colorsPending.hidden = result.colorsReady;
		const spottingPending = this.querySelector<HTMLElement>('[data-spotting-pending]');
		if (spottingPending) spottingPending.hidden = result.spottingReady;
		const inquiry = this.querySelector<HTMLAnchorElement>('[data-color-inquire]');
		if (inquiry) inquiry.href = `/deckanfrage/?${scenarioQuery(this.scenario)}#color-inquiry`;
		if (announce) {
			const url = new URL(location.href); url.search = scenarioQuery(this.scenario);
			history.replaceState(null, '', url);
		}
		try { sessionStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(this.scenario)); } catch { /* Calculator works without storage. */ }
		if (announce) this.status('Die Ergebnisse wurden aktualisiert.');
	}

}

if (!customElements.get('color-calculator')) customElements.define('color-calculator', ColorCalculator);
