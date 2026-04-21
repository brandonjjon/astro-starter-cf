import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, envField, fontProviders } from 'astro/config';
import icon from 'astro-icon';

import tailwindcss from '@tailwindcss/vite';

// Skip the CF adapter under vitest — its vite plugin conflicts with vitest's
// Node-based SSR resolution.
const isTest = !!process.env.VITEST;

export default defineConfig({
	site: 'https://example.com',
	adapter: isTest
		? undefined
		: cloudflare({
				imageService: 'compile',
				prerenderEnvironment: 'node',
				configPath: './wrangler.jsonc',
				inspectorPort: false,
			}),
	integrations: [sitemap(), mdx(), icon()],

	env: {
		schema: {
			PUBLIC_GA_MEASUREMENT_ID: envField.string({
				context: 'client',
				access: 'public',
				optional: true,
				default: '',
			}),
			PUBLIC_TURNSTILE_SITE_KEY: envField.string({
				context: 'client',
				access: 'public',
				optional: true,
				default: '',
			}),
			TURNSTILE_SECRET_KEY: envField.string({
				context: 'server',
				access: 'secret',
				optional: true,
			}),
			CONTACT_TO_EMAIL: envField.string({
				context: 'server',
				access: 'public',
				default: 'hello@example.com',
			}),
			CONTACT_FROM_EMAIL: envField.string({
				context: 'server',
				access: 'public',
				default: 'noreply@example.com',
			}),
		},
	},

	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Inter',
			cssVariable: '--font-inter',
			weights: [400, 500, 600, 700],
			styles: ['normal'],
			subsets: ['latin'],
		},
	],

	vite: {
		plugins: [tailwindcss()],
	},
});
