import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
	if (import.meta.env.IS_PREVIEW) {
		return new Response('User-agent: *\nDisallow: /\n', {
			headers: { 'Content-Type': 'text/plain' },
		});
	}
	const sitemapURL = new URL('sitemap-index.xml', site);
	const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapURL.href}\n`;
	return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
