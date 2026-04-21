import { EventEmitter } from 'node:events';

import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import {
	defineConfig,
	envField,
	fontProviders,
	memoryCache,
} from 'astro/config';
import icon from 'astro-icon';

import tailwindcss from '@tailwindcss/vite';

// Vite + Astro + @cloudflare/vite-plugin all register chokidar watchers on the
// same FSWatcher. Their cumulative listener count exceeds Node's default of 10.
// Not a real leak — bump the ceiling to silence the dev-time warning.
EventEmitter.defaultMaxListeners = 20;

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

	// Prefetch links in the viewport; clientPrerender upgrades those to
	// Speculation Rules prerenders on supported browsers (graceful fallback).
	prefetch: {
		prefetchAll: true,
		defaultStrategy: 'viewport',
	},

	experimental: {
		// Rust compiler — faster builds, better error messages.
		// Requires @astrojs/compiler-rs. Won't auto-correct invalid HTML
		// (e.g. <p><div/></p>); disables dev-toolbar audits.
		rustCompiler: true,

		// Queue-based renderer — more memory-efficient for large trees.
		queuedRendering: { enabled: true },

		// Client-side Speculation Rules API prerendering for prefetched links.
		clientPrerender: true,

		// JSON schemas for content-collection frontmatter in editors.
		// Also set "astro.content-intellisense": true in VS Code settings.
		contentIntellisense: true,

		// Build-time SVGO optimization for imported .svg components.
		svgo: true,

		// Platform-agnostic route caching API. Requires on-demand rendering
		// on a route (export const prerender = false) to take effect —
		// no-op for fully prerendered pages.
		cache: {
			provider: memoryCache(),
		},
		// Optional: declarative per-route defaults. Uncomment when you have
		// on-demand routes to cache.
		// routeRules: {
		//   '/api/*': { swr: 600 },
		// },
	},

	security: {
		// Astro auto-generates hashes for bundled scripts/styles and emits a
		// <meta http-equiv="content-security-policy"> in every page head.
		// Note: dev server does not emit CSP — use `astro build && astro preview` to verify.
		csp: {
			algorithm: 'SHA-256',
			directives: [
				"default-src 'self'",
				"img-src 'self' data: https: blob:",
				"font-src 'self' data:",
				"connect-src 'self' https://challenges.cloudflare.com",
				'frame-src https://challenges.cloudflare.com',
				"object-src 'none'",
				"base-uri 'self'",
				"form-action 'self'",
				"frame-ancestors 'none'",
			],
			scriptDirective: {
				// Default is 'self' + Astro hashes; we must re-include 'self' when
				// adding extra sources. Turnstile needed for the contact form widget.
				resources: ["'self'", 'https://challenges.cloudflare.com'],
			},
		},
	},

	env: {
		schema: {
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
		optimizeDeps: {
			// Workers-virtual + odd-shaped modules bypass the dep optimizer.
			exclude: ['cloudflare:email', 'mimetext'],
		},
		ssr: {
			// Astro internals are late-discovered and trip SSR optimizer mid-session.
			// Pre-including keeps them in the initial bundle and avoids HMR reload churn.
			optimizeDeps: {
				include: ['astro/zod', 'astro/env/runtime'],
			},
		},
	},
});
