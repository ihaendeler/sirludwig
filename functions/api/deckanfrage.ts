import { readEnvVar, readFirstEnvVar } from '../lib/env';
import { parseDeckanfrageFormData, sendDeckanfrageEmail } from '../../src/lib/deckanfrage/process';

interface Env {
	deckanfragen_send?: string;
	RESEND_API_KEY?: string;
	RESEND_FROM_EMAIL?: string;
}

const RESEND_KEY_VARS = ['deckanfragen_send', 'RESEND_API_KEY'];

const DEFAULT_FROM = 'Sir Ludwig Website <noreply@sirludwig.de>';

function json(data: Record<string, unknown>, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'no-store',
		},
	});
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
	const apiKey = readFirstEnvVar(context.env as Record<string, unknown>, RESEND_KEY_VARS);

	if (!apiKey) {
		return json(
			{
				ok: false,
				code: 'missing_api_key',
				message:
					'E-Mail-Versand ist nicht konfiguriert. Bitte deckanfragen_send als Secret in Cloudflare setzen.',
			},
			503,
		);
	}

	let formData: FormData;

	try {
		formData = await context.request.formData();
	} catch {
		return json(
			{
				ok: false,
				code: 'invalid_request',
				message:
					'Die Anfrage konnte derzeit nicht übermittelt werden. Bitte versuchen Sie es später erneut.',
			},
			400,
		);
	}

	const parsed = parseDeckanfrageFormData(formData);

	if (!parsed.ok) {
		return json(
			{
				ok: false,
				code: parsed.code,
				message: parsed.message,
			},
			parsed.status,
		);
	}

	const fromEmail =
		readEnvVar(context.env as Record<string, unknown>, 'RESEND_FROM_EMAIL') || DEFAULT_FROM;
	const sent = await sendDeckanfrageEmail(parsed.payload, apiKey, fromEmail);

	if (!sent.ok) {
		return json(
			{
				ok: false,
				code: 'send_failed',
				message: sent.message,
			},
			502,
		);
	}

	return json({
		ok: true,
		message: 'Vielen Dank. Ihre Anfrage wurde erfolgreich übermittelt.',
	});
};
