/// <reference types="astro/client" />

type Runtime = import('@astrojs/cloudflare').Runtime<{
	SEB: {
		send: (message: unknown) => Promise<void>;
	};
}>;

declare namespace App {
	type Locals = Runtime;
}
