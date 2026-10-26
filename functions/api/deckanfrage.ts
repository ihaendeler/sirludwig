import { translator, type Locale } from '../../src/i18n';
import type { PagesFunction } from '@cloudflare/workers-types';
import { readEnvVar, readFirstEnvVar } from '../lib/env';
import { parseDeckanfrageFormData, sendDeckanfrageEmail, SEND_ERROR } from '../../src/lib/deckanfrage/process';

interface Env extends Record<string, unknown> {
	deckanfragen_send?: string;
	RESEND_API_KEY?: string;
	RESEND_FROM_EMAIL?: string;
}

const RESEND_KEY_VARS = ['deckanfragen_send', 'RESEND_API_KEY'];

const DEFAULT_FROM = 'Sir Ludwig Website <noreply@sirludwig.de>';
export const MAX_REQUEST_BYTES = 64 * 1024;

function json(data: Record<string, unknown>, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'no-store',
		},
	});
}

type RequestContext = Pick<Parameters<PagesFunction<Env>>[0], 'request' | 'env'>;

export const onRequestPost = async (context: RequestContext) => {
	const { request } = context;
	let locale: Locale = request.headers.get('X-Site-Language') === 'en' ? 'en' : 'de';
	const reply = (data: Record<string, unknown>, status = 200) => {
		const t = translator(locale);
		return json({
			...data,
			...(typeof data.message === 'string' ? { message: t(data.message) } : {}),
			...(data.fields ? { fields: Object.fromEntries(
				Object.entries(data.fields as Record<string, string>).map(([key, message]) => [key, t(message)]),
			) } : {}),
		}, status);
	};
	const origin = request.headers.get('Origin');
	if (origin && origin !== new URL(request.url).origin) {
		return reply({ ok: false, code: 'invalid_origin', message: SEND_ERROR }, 403);
	}
	const contentType = request.headers.get('Content-Type') ?? '';
	if (!/^(?:multipart\/form-data|application\/x-www-form-urlencoded)(?:;|$)/i.test(contentType)) {
		return reply({ ok: false, code: 'invalid_request', message: SEND_ERROR }, 415);
	}
	if (Number(request.headers.get('Content-Length')) > MAX_REQUEST_BYTES) {
		return reply({ ok: false, code: 'request_too_large', message: SEND_ERROR }, 413);
	}

	let formData: FormData;

	try {
		// Count streamed bytes too: Content-Length is optional and can be untrusted.
		const reader = request.body?.getReader();
		if (!reader) throw new Error('Missing request body');
		const chunks: Uint8Array[] = [];
		let length = 0;
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			length += value.byteLength;
			if (length > MAX_REQUEST_BYTES) {
				await reader.cancel();
				return reply({ ok: false, code: 'request_too_large', message: SEND_ERROR }, 413);
			}
			chunks.push(value);
		}
		const body = new Uint8Array(length);
		let offset = 0;
		for (const chunk of chunks) {
			body.set(chunk, offset);
			offset += chunk.length;
		}
		formData = await new Response(body, { headers: { 'Content-Type': contentType } }).formData();
	} catch {
		return reply(
			{
				ok: false,
				code: 'invalid_request',
				message:
					'Die Anfrage konnte derzeit nicht übermittelt werden. Bitte versuchen Sie es später erneut.',
			},
			400,
		);
	}

	if (formData.get('language') === 'en') locale = 'en';
	const parsed = parseDeckanfrageFormData(formData);

	if (!parsed.ok) {
		return reply(
			{
				ok: false,
				code: parsed.code,
				message: parsed.message,
				...(parsed.fields ? { fields: parsed.fields } : {}),
			},
			parsed.status,
		);
	}

	if (parsed.payload.honeypot) return reply({ ok: true });
	const apiKey = readFirstEnvVar(context.env as Record<string, unknown>, RESEND_KEY_VARS);
	if (!apiKey) {
		return reply({ ok: false, code: 'missing_api_key', message: SEND_ERROR }, 503);
	}

	const fromEmail =
		readEnvVar(context.env as Record<string, unknown>, 'RESEND_FROM_EMAIL') || DEFAULT_FROM;
	const sent = await sendDeckanfrageEmail(parsed.payload, apiKey, fromEmail);

	if (!sent.ok) {
		return reply(
			{
				ok: false,
				code: 'send_failed',
				message: sent.message,
			},
			502,
		);
	}

	return reply({
		ok: true,
		message: 'Vielen Dank. Ihre Anfrage wurde erfolgreich übermittelt.',
	});
};
