import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { navLinkIsCurrent } from './currentNav';

const headerHrefs = ['/sell', '/products', '/learn', '/products', '/about'] as const;

describe('aria-current on the header nav', () => {
	it('marks the first matching nav link and leaves the duplicate catalogue link alone', () => {
		expect(navLinkIsCurrent('/products', headerHrefs, 1)).toBe(true);
		expect(navLinkIsCurrent('/products', headerHrefs, 3)).toBe(false);
		expect(navLinkIsCurrent('/products/hydroponics', headerHrefs, 1)).toBe(true);
		expect(navLinkIsCurrent('/products/hydroponics', headerHrefs, 3)).toBe(false);
		expect(navLinkIsCurrent('/about', headerHrefs, 4)).toBe(true);
		expect(navLinkIsCurrent('/learn/course/example', headerHrefs, 2)).toBe(true);
		expect(navLinkIsCurrent('/sell', headerHrefs, 0)).toBe(true);
		expect(
			headerHrefs.filter((_, index) => navLinkIsCurrent('/search', headerHrefs, index))
		).toEqual([]);
	});

	it('puts aria-current="page" on the header link for the current page', () => {
		const header = readFileSync(
			join(dirname(fileURLToPath(import.meta.url)), '../components/navigation/Header.svelte'),
			'utf8'
		);
		expect(header).toMatch(
			/aria-current=\{navLinkIsCurrent\(\$page\.url\.pathname, navHrefs, index\)\s*\?\s*'page'\s*:\s*undefined\}/
		);
	});
});
