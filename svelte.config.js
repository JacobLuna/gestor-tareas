import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		// adapter-node asume https si no hay PROTOCOL_HEADER y rechazaría todo formulario por http en la red de casa;
		// la comprobación equivalente (mismo host) se hace en hooks.server.ts.
		csrf: { trustedOrigins: ['*'] }
	}
};
