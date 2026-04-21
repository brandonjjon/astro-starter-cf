import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro/zod';
import {
	CONTACT_FROM_EMAIL,
	CONTACT_TO_EMAIL,
	TURNSTILE_SECRET_KEY,
} from 'astro:env/server';

export const server = {
	submitContact: defineAction({
		accept: 'form',
		input: z.object({
			name: z.string().min(1).max(200),
			email: z.email().max(200),
			message: z.string().min(10).max(5000),
			'cf-turnstile-response': z.string().optional(),
		}),
		handler: async (input, context) => {
			// Turnstile is fully opt-in: set both PUBLIC_TURNSTILE_SITE_KEY and
			// TURNSTILE_SECRET_KEY in Worker runtime vars to enable the widget +
			// server-side verification. When either is missing, the captcha step
			// is skipped and the form still works.
			if (TURNSTILE_SECRET_KEY) {
				const token = input['cf-turnstile-response'];
				if (!token) {
					throw new ActionError({
						code: 'BAD_REQUEST',
						message: 'Captcha required',
					});
				}
				const form = new FormData();
				form.append('secret', TURNSTILE_SECRET_KEY);
				form.append('response', token);
				const ip = context.request.headers.get('CF-Connecting-IP');
				if (ip) form.append('remoteip', ip);
				const verify = await fetch(
					'https://challenges.cloudflare.com/turnstile/v0/siteverify',
					{ method: 'POST', body: form },
				);
				const result = (await verify.json()) as { success: boolean };
				if (!result.success) {
					throw new ActionError({
						code: 'BAD_REQUEST',
						message: 'Captcha failed',
					});
				}
			}

			const { env } = await import('cloudflare:workers');

			// Fallbacks for first-deploy before dashboard values are set. The
			// real values must come from Worker runtime env (dashboard edit);
			// schema is `access: 'secret'` so Astro reads them per-request
			// instead of baking defaults as build-time constants.
			const from = CONTACT_FROM_EMAIL ?? 'noreply@example.com';
			const to = CONTACT_TO_EMAIL ?? 'hello@example.com';

			await env.EMAIL.send({
				from: { email: from, name: 'Website' },
				to,
				replyTo: input.email,
				subject: `Contact form — ${input.name}`,
				text: `From: ${input.name} <${input.email}>\n\n${input.message}`,
			});
			return { ok: true };
		},
	}),
};
