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
		env: {
			publicPrefix: 'PUBLIC_'
		}
	},
	extensions: ['.svelte', '.svx']
};

export default config;
