import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import {
	buildDeckanfrageEmailHtml,
	buildDeckanfrageEmailText,
	calculateBitchAge,
	formatInstagramProfile,
	getReplyTo,
	parseDeckanfrageFormData,
	sendDeckanfrageEmail,
	SEND_ERROR,
} from '../src/lib/deckanfrage/process';
import { onRequestPost, MAX_REQUEST_BYTES } from '../functions/api/deckanfrage';
import { exampleScenario, ownScenario } from '../src/lib/color/model';

function validForm(): FormData {
	const form = new FormData();
	for (const [key, value] of Object.entries({
		'contact-name': 'Testperson',
		'comm-pref': 'email',
		'comm-email': 'test@example.com',
		'privacy-consent': 'yes',
		'_form-started-at': String(Date.now() - 5_000),
	})) form.set(key, value);
	return form;
}

function validPayload() {
	const parsed = parseDeckanfrageFormData(validForm());
	assert.equal(parsed.ok, true);
	if (!parsed.ok) throw new Error('Invalid fixture');
	return parsed.payload;
}

async function handle(request: Request, env: Record<string, string> = {}) {
	return await onRequestPost({ request, env } as never) as unknown as Response;
}

function request(form = validForm()): Request {
	return new Request('https://example.com/api/deckanfrage', { method: 'POST', body: form });
}

afterEach(() => mock.restoreAll());

test('accepts a valid inquiry and German birthdate', () => {
	const form = validForm();
	form.set('bitch-birthdate', '29.02.2024');
	const parsed = parseDeckanfrageFormData(form);
	assert.equal(parsed.ok, true);
	if (parsed.ok) assert.equal(parsed.payload.bitchBirthdate, '2024-02-29');
});

for (const [name, field, value] of [
	['unknown contact method', 'comm-pref', 'unknown'],
	['prototype property contact method', 'comm-pref', '__proto__'],
	['missing name', 'contact-name', ''],
	['invalid email', 'comm-email', 'invalid'],
	['missing consent', 'privacy-consent', 'no'],
	['too-fast submission', '_form-started-at', String(Date.now() + 60_000)],
	['expired submission', '_form-started-at', String(Date.now() - 2 * 86_400_000)],
	['invalid date', 'bitch-birthdate', '2025-02-29'],
	['date suffix', 'bitch-birthdate', '2024-02-29junk'],
	['future date', 'bitch-birthdate', '2099-01-01'],
	['negative size', 'bitch-size', '-1'],
	['fractional size', 'bitch-size', '58.5'],
	['excessive weight', 'bitch-weight', '100'],
	['invalid selection', 'health-hd', 'free-text'],
	['line break in name', 'contact-name', 'Name\r\nInjected'],
	['oversized message', 'message', 'x'.repeat(5_001)],
] as const) {
	test(`rejects ${name}`, () => {
		const form = validForm();
		form.set(field, value);
		assert.equal(parseDeckanfrageFormData(form).ok, false);
	});
}

test('rejects uploaded files and duplicate scalar values', () => {
	const form = validForm();
	form.set('message', new File(['test'], 'test.txt'));
	assert.equal(parseDeckanfrageFormData(form).ok, false);
	form.delete('message');
	form.append('contact-name', 'Other name');
	assert.equal(parseDeckanfrageFormData(form).ok, false);
});

test('accepts phone-only contact and deduplicates methods', () => {
	const form = validForm();
	form.set('comm-pref', 'phone');
	form.append('comm-pref', 'phone');
	form.delete('comm-email');
	form.set('comm-phone', '+49 (0)123 456789');
	const parsed = parseDeckanfrageFormData(form);
	assert.equal(parsed.ok, true);
	if (parsed.ok) assert.deepEqual(parsed.payload.commPrefs, ['phone']);
});

test('escapes untrusted email HTML', () => {
	const payload = validPayload();
	payload.contactName = '<img src=x onerror=alert(1)>';
	payload.message = '<script>alert(1)</script>';
	const html = buildDeckanfrageEmailHtml(payload);
	assert.ok(html.includes('&lt;img'));
	assert.ok(html.includes('&lt;script&gt;'));
	assert.ok(!html.includes('<script>'));
});

test('only links valid Instagram usernames and exact Instagram hosts', () => {
	assert.equal(formatInstagramProfile('@test.user')?.url, 'https://instagram.com/test.user');
	assert.equal(formatInstagramProfile('https://www.instagram.com/test.user/?igsh=123')?.display, '@test.user');
	assert.equal(formatInstagramProfile('https://evil.example/instagram.com/user'), null);
	assert.equal(formatInstagramProfile('https://instagram.com.evil.example/user'), null);
	assert.equal(formatInstagramProfile('bad user'), null);
});

test('invalid birthdates have no calculated age', () => {
	assert.equal(calculateBitchAge('2025-02-29'), 'nicht angegeben');
	assert.equal(calculateBitchAge('2099-01-01'), 'nicht angegeben');
});

test('reply-to requires the email communication preference', () => {
	const payload = validPayload();
	assert.equal(getReplyTo(payload), 'test@example.com');
	payload.commPrefs = ['phone'];
	assert.equal(getReplyTo(payload), undefined);
});

test('mail delivery catches network failures', async () => {
	mock.method(globalThis, 'fetch', async () => { throw new Error('network'); });
	assert.deepEqual(await sendDeckanfrageEmail(validPayload(), 'test-key', 'test@example.com'),
		{ ok: false, message: SEND_ERROR });
});

test('honeypot returns success without sending or requiring secrets', async () => {
	const fetchMock = mock.method(globalThis, 'fetch', async () => { throw new Error('Must not send'); });
	const form = validForm();
	form.set('_honeypot', 'bot');
	assert.equal((await handle(request(form))).status, 200);
	assert.equal(fetchMock.mock.callCount(), 0);
});

test('missing configuration returns a neutral service error', async () => {
	const response = await handle(request());
	assert.equal(response.status, 503);
	const body = await response.json();
	assert.equal(body.message, SEND_ERROR);
	assert.ok(!JSON.stringify(body).includes('deckanfragen_send'));
});

test('rejects cross-origin submissions', async () => {
	const req = request();
	req.headers.set('Origin', 'https://other.example');
	assert.equal((await handle(req)).status, 403);
});

test('rejects unsupported content types', async () => {
	const req = new Request('https://example.com/api/deckanfrage', {
		method: 'POST', body: '{}', headers: { 'Content-Type': 'application/json' },
	});
	assert.equal((await handle(req)).status, 415);
});

test('enforces body size even without Content-Length', async () => {
	const req = new Request('https://example.com/api/deckanfrage', {
		method: 'POST', body: 'message=' + 'x'.repeat(MAX_REQUEST_BYTES),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	});
	assert.equal(req.headers.get('Content-Length'), null);
	assert.equal((await handle(req)).status, 413);
});

test('delivers a valid inquiry via a mocked provider', async () => {
	let sent: Record<string, unknown> = {};
	mock.method(globalThis, 'fetch', async (_url: string, options: RequestInit) => {
		sent = JSON.parse(options.body as string);
		assert.ok(options.signal);
		return new Response('{}', { status: 200 });
	});
	const response = await handle(request(), { RESEND_API_KEY: 'test-key' });
	assert.equal(response.status, 200);
	assert.equal((await response.json()).ok, true);
	assert.equal(sent.reply_to, 'test@example.com');
	assert.deepEqual(sent.to, ['deckanfrage@sirludwig.de']);
});

test('provider failures return a controlled gateway error', async () => {
	mock.method(globalThis, 'fetch', async () => new Response('{}', { status: 500 }));
	assert.equal((await handle(request(), { RESEND_API_KEY: 'test-key' })).status, 502);
});

test('inquiry remains valid without a color calculation', () => {
	assert.equal(validPayload().colorScenario, null);
	assert.ok(!buildDeckanfrageEmailHtml(validPayload()).includes('Beispielsimulation'));
});

test('API returns an actionable field error without contacting the provider', async () => {
	const provider = mock.method(globalThis, 'fetch', async () => { throw new Error('Must not send'); });
	const form = validForm(); form.set('comm-email', 'invalid');
	const response = await handle(request(form), { RESEND_API_KEY: 'test-key' });
	assert.equal(response.status, 400);
	const body = await response.json();
	assert.match(body.fields['comm-email'], /gültige E-Mail/);
	assert.equal(provider.mock.callCount(), 0);
});

test('server recomputes shared simulation and strips supplied percentages and personal extras', () => {
	const form = validForm();
	form.set('color-scenario', JSON.stringify({ ...exampleScenario(), brown: 100, extraName: 'Injected person' }));
	const parsed = parseDeckanfrageFormData(form);
	assert.equal(parsed.ok, true);
	if (!parsed.ok) throw new Error('Invalid fixture');
	assert.deepEqual(parsed.payload.colorScenario, exampleScenario());
	const html = buildDeckanfrageEmailHtml(parsed.payload);
	const text = buildDeckanfrageEmailText(parsed.payload);
	for (const email of [html, text]) {
		assert.match(email, /Beispielsimulation/);
		assert.match(email, /12,5 %/);
		assert.ok(!email.includes('Injected person'));
	}
});

test('server preserves unknown values and declared test provenance', () => {
	const scenario = { ...ownScenario(), e: 'Ee', sourceE: 'test' };
	const form = validForm(); form.set('color-scenario', JSON.stringify(scenario));
	const parsed = parseDeckanfrageFormData(form);
	assert.equal(parsed.ok, true);
	if (!parsed.ok) throw new Error('Invalid fixture');
	const text = buildDeckanfrageEmailText(parsed.payload);
	assert.match(text, /nicht überprüft/);
	assert.match(text, /Gentest laut Eingabe/);
	assert.match(text, /Unbekannt/);
});

test('server rejects corrupt or mislabeled color scenarios', () => {
	for (const value of ['{', JSON.stringify({ ...exampleScenario(), sourceB: 'test' }), JSON.stringify({ ...exampleScenario(), v: 99 })]) {
		const form = validForm(); form.set('color-scenario', value);
		const parsed = parseDeckanfrageFormData(form);
		assert.equal(parsed.ok, false);
		if (!parsed.ok) assert.match(parsed.fields?.['color-scenario'] ?? '', /erneut übernehmen/);
	}
});
