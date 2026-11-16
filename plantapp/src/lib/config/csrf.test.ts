import { describe, expect, it } from 'vitest';
import { SITE_URL } from './site';

/**
 * SvelteKit compares a form post's Origin header with adapter-node's request
 * origin. In production that request origin is Railway's ORIGIN host, so the
 * public site has to be listed explicitly. The check stays on: `checkOrigin`
 * is not disabled, and `*` is not trusted.
 *
 * @see https://svelte.dev/docs/kit/configuration#csrf
 */
describe('csrf trusted origins', () => {
	it('allows form posts only from the public Aevani origins', async () => {
		const href = new URL('../../../svelte.config.js', import.meta.url).href;
		const { default: config } = (await import(href)) as {
			default: {
				kit?: {
					csrf?: {
						checkOrigin?: boolean;
						trustedOrigins?: string[];
					};
				};
			};
		};
		const csrf = config.kit?.csrf;

		expect(csrf?.checkOrigin).not.toBe(false);
		expect(csrf?.trustedOrigins).toEqual([SITE_URL, 'https://www.aevani.com']);

		for (const origin of csrf?.trustedOrigins ?? []) {
			expect(new URL(origin).origin).toBe(origin);
			expect(origin.startsWith('https://')).toBe(true);
			expect(origin).not.toContain('*');
			expect(origin).not.toContain('railway.app');
		}
	});
});
