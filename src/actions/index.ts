import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
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
			email: z.string().email().max(200),
			message: z.string().min(10).max(5000),
			'cf-turnstile-response': z.string().optional(),
		}),
		handler: async (input, context) => {
			const runtime = (
				context.locals as {
					runtime?: {
						env: { SEB: { send: (msg: unknown) => Promise<void> } };
					};
				}
			).runtime;

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

			const { createMimeMessage } = await import('mimetext');
			const { EmailMessage } = await import('cloudflare:email');

			const msg = createMimeMessage();
			msg.setSender({ name: 'Website', addr: CONTACT_FROM_EMAIL });
			msg.setRecipient(CONTACT_TO_EMAIL);
			msg.setSubject(`Contact form — ${input.name}`);
			msg.addMessage({
				contentType: 'text/plain',
				data: `From: ${input.name} <${input.email}>\n\n${input.message}`,
			});

			const email = new EmailMessage(
				CONTACT_FROM_EMAIL,
				CONTACT_TO_EMAIL,
				msg.asRaw(),
			);

			if (!runtime?.env?.SEB) {
				throw new ActionError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Email binding unavailable',
				});
			}
			await runtime.env.SEB.send(email);
			return { ok: true };
		},
	}),
};
