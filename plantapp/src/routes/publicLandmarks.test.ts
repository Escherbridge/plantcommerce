import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Signed-in shells keep their own main. Public pages use the layout's single main. */
function isPrivateShell(rel: string): boolean {
	if (rel.startsWith('lib/components/platform/')) return true;
	if (/^routes\/(?:account|admin|instructor|component-demo|certificates|seller)\//.test(rel))
		return true;
	if (/^routes\/learn\/(?:course|my-courses|certificates)\//.test(rel)) return true;
	if (
		rel.startsWith('routes/affiliate/') &&
		!/^routes\/affiliate\/(?:\+page\.svelte|join\/|terms\/)/.test(rel)
	) {
		return true;
	}
	return false;
}

function walk(dir: string): string[] {
	const files: string[] = [];
	for (const entry of readdirSync(dir)) {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) files.push(...walk(path));
		else if (entry.endsWith('.svelte')) files.push(path);
	}
	return files;
}

function navTags(source: string): string[] {
	return [...source.matchAll(/<nav\b[^>]*>/g)].map((match) => match[0]);
}

describe('public landmarks', () => {
	it('gives public pages one main, a labelled header, labelled navs, and a skip link', () => {
		const layout = readFileSync(join(srcDir, 'routes/+layout.svelte'), 'utf8');
		const header = readFileSync(join(srcDir, 'lib/components/navigation/Header.svelte'), 'utf8');

		expect(layout.match(/<main\b/g)).toHaveLength(1);
		expect(layout).toContain('id="main-content"');
		expect(layout).toContain('href="#main-content">Skip to main content</a>');
		expect(header).toMatch(/<header\b[^>]*aria-label="Site"/);

		for (const nav of navTags(layout)) {
			expect(nav).toMatch(/aria-label="/);
		}
		for (const nav of navTags(header)) {
			expect(nav).toMatch(/aria-label="/);
		}

		const extraMains: string[] = [];
		const unlabelledNavs: string[] = [];
		for (const file of walk(srcDir)) {
			const rel = relative(srcDir, file);
			if (isPrivateShell(rel) || rel === 'routes/+layout.svelte') continue;
			const source = readFileSync(file, 'utf8');
			if (/<main\b/.test(source)) extraMains.push(rel);
			for (const nav of navTags(source)) {
				if (!/aria-label=|aria-labelledby=/.test(nav)) unlabelledNavs.push(`${rel}: ${nav}`);
			}
		}

		expect(extraMains).toEqual([]);
		expect(unlabelledNavs).toEqual([]);
	});
});
