/// <reference types="astro/client" />

// `Env` interface is provided globally by worker-configuration.d.ts (see tsconfig include).
// Adapter v13: `Astro.locals.runtime` removed. Bindings via `import { env } from 'cloudflare:workers'`.
declare namespace App {
	type Locals = import('@astrojs/cloudflare').Runtime;
}

interface ImportMetaEnv {
	// True when Workers Builds runs on a non-main branch. Baked at build time
	// via Vite `define` in astro.config.ts.
	readonly IS_PREVIEW: boolean;
}
