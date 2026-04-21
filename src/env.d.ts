/// <reference types="astro/client" />

// `Env` interface is provided globally by worker-configuration.d.ts (see tsconfig include).
// Adapter v13: `Astro.locals.runtime` removed. Bindings via `import { env } from 'cloudflare:workers'`.
declare namespace App {
	type Locals = import('@astrojs/cloudflare').Runtime;
}
