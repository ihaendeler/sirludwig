import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DRAFT_MAX_AGE, readDraft } from '../src/lib/deckanfrage/draft';

const now = Date.UTC(2026, 9, 23);
const draft = (fields: Record<string, unknown> = {}, savedAt = now) => JSON.stringify({ v: 1, savedAt, fields });

test('draft restores only allowed fields, never consent or spam fields', () => {
	const result = readDraft(draft({
		'contact-name': 'Testperson', 'comm-pref': ['email', 'email', 'phone'],
		'comm-email': 'test@example.com', 'privacy-consent': 'yes', '_honeypot': 'x',
		'_form-started-at': '123', arbitrary: 'no',
	}), now);
	assert.deepEqual(result?.fields, {
		'contact-name': 'Testperson', 'comm-pref': ['email', 'phone'], 'comm-email': 'test@example.com',
	});
});

test('draft expires after seven days and rejects dates in the future', () => {
	assert.ok(readDraft(draft({}, now - DRAFT_MAX_AGE), now));
	assert.equal(readDraft(draft({}, now - DRAFT_MAX_AGE - 1), now), null);
	assert.equal(readDraft(draft({}, now + 60_001), now), null);
});

test('draft rejects malformed data, unsupported methods and oversized fields', () => {
	for (const json of [null, 'null', '[]', '{', JSON.stringify({ v: 2, savedAt: now, fields: {} }),
		draft({ 'comm-pref': ['__proto__'] }), draft({ 'comm-pref': 'email' }),
		draft({ 'contact-name': ['bad'] }), draft({ message: 'x'.repeat(5_001) }),
		draft({ 'color-scenario': 'x'.repeat(1_001) }), draft({ 'contact-name': 'x'.repeat(301) }),
		'x'.repeat(20_001),
	]) assert.equal(readDraft(json, now), null);
});
