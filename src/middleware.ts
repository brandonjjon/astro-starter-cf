import { defineMiddleware } from 'astro:middleware';

// public/_headers doesn't apply to Worker-rendered responses on Cloudflare;
// apply the equivalent here so SSR routes (/contact) match static parity.
// HSTS can also be enforced zone-level in Cloudflare — the header below is a
// safe default that no-ops when zone config already sets it.
const SECURITY_HEADERS: Record<string, string> = {
	'X-Frame-Options': 'DENY',
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Permissions-Policy':
		'camera=(), microphone=(), geolocation=(), interest-cohort=()',
	'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

export const onRequest = defineMiddleware(async (_context, next) => {
	const response = await next();
	for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
		if (!response.headers.has(key)) response.headers.set(key, value);
	}
	return response;
});
