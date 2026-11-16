import { isHttpError } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { match } from '../../../params/paper';
import { load as loadIndex } from '../+page';
import { load } from './+page';

describe('white paper routes', () => {
	it('does not treat a PDF filename as a page slug', () => {
		expect(match('example-white-paper')).toBe(true);
		expect(match('example-white-paper.pdf')).toBe(false);
	});

	it('returns an empty index while every paper is unpublished', async () => {
		const data = await loadIndex({} as never);
		expect(data?.papers).toEqual([]);
	});

	it('returns 404 for the placeholder and for an unknown slug', async () => {
		for (const slug of ['example-white-paper', 'not-a-paper']) {
			try {
				await load({ params: { slug } } as never);
				expect.fail(`expected 404 for ${slug}`);
			} catch (error) {
				expect(isHttpError(error)).toBe(true);
				if (!isHttpError(error)) return;
				expect(error.status).toBe(404);
			}
		}
	});
});
