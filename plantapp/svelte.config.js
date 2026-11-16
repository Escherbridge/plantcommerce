import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],
	kit: {
		// Railway runs the generated Node server via `npm run start`.
		adapter: adapter(),
		prerender: {
			// Disable automatic prerendering since the app requires authentication and dynamic data
			handleMissingId: 'warn',
			handleHttpError: 'warn'
		},
		csrf: {
			// Railway's ORIGIN is the service host, so adapter-node's request
			// origin does not match a browser post from the public site.
			// https://svelte.dev/docs/kit/configuration#csrf
			trustedOrigins: ['https://aevani.com', 'https://www.aevani.com']
		},
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'base-uri': ['self'],
				'connect-src': ['self'],
				'font-src': ['self', 'data:'],
				'form-action': ['self'],
				'frame-ancestors': ['none'],
				'img-src': ['self', 'data:', 'https:'],
				'object-src': ['none'],
				'script-src': ['self'],
				'script-src-attr': ['none'],
				'style-src': ['self', 'unsafe-inline']
			}
		},
		env: {
			publicPrefix: 'PUBLIC_'
		}
	},
	extensions: ['.svelte', '.svx']
};

export default config;
