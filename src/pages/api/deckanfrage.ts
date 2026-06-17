import type { APIRoute } from 'astro';
import { parseDeckanfrageFormData, sendDeckanfrageEmail } from '../../lib/deckanfrage/process';

export const prerender = false;

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

export const POST: APIRoute = async ({ request }) => {
	const apiKey = import.meta.env.RESEND_API_KEY?.trim();

	if (!apiKey) {
		return json(
			{
				ok: false,
				code: 'missing_api_key',
				message:
					'E-Mail-Versand ist nicht konfiguriert. Bitte RESEND_API_KEY als Umgebungsvariable setzen.',
			},
			503,
		);
	}

	let formData: FormData;

	try {
		formData = await request.formData();
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

	const fromEmail = import.meta.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM;
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
