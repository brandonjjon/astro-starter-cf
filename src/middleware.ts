import { defineMiddleware } from 'astro:middleware';

// public/_headers doesn't apply to Worker-rendered responses on Cloudflare;
// apply the equivalent here so SSR routes (/contact) match static parity.
// HSTS can also be enforced zone-level in Cloudflare — the header below is a
// safe default that no-ops when zone config already sets it.
const SECURITY_HEADERS: Record<string, string> = {
	'X-Frame-Options': 'DENY',
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
	'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

export const onRequest = defineMiddleware(async (context, next) => {
	const response = await next();
	for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
		if (!response.headers.has(key)) response.headers.set(key, value);
	}
	// Discourage indexing of *.workers.dev URLs — they're preview/test origins,
	// not production. Custom domains get indexed normally. Header equivalent of
	// <meta name="robots" content="noindex, nofollow"> but applied at response
	// level so it works for every SSR route without touching BaseHead.
	if (context.url.hostname.endsWith('.workers.dev')) {
		response.headers.set('X-Robots-Tag', 'noindex, nofollow');
	}
	return response;
});
