import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],
	kit: {
		// Build the explicit Node server deployed by Railway.
		adapter: adapter(),
		prerender: {
			// Disable automatic prerendering since the app requires authentication and dynamic data
			handleMissingId: 'warn',
			handleHttpError: 'warn'
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
