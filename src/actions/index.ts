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
			// Paired test secret — see ContactForm.astro. Always-passes for
			// test-key tokens, so workers.dev deploys validate end-to-end
			// without real Turnstile credentials.
			const TEST_SECRET_KEY = '1x0000000000000000000000000000000AA';
			const isWorkersDevHost = new URL(context.request.url).hostname.endsWith(
				'.workers.dev',
			);
			const secret = isWorkersDevHost ? TEST_SECRET_KEY : TURNSTILE_SECRET_KEY;

			if (secret) {
				const token = input['cf-turnstile-response'];
				if (!token) {
					throw new ActionError({
						code: 'BAD_REQUEST',
						message: 'Captcha required',
					});
				}
				const form = new FormData();
				form.append('secret', secret);
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
