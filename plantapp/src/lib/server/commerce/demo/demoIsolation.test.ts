import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function sourceFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		return entry.isDirectory()
			? sourceFiles(path)
			: entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')
				? [path]
				: [];
	});
}

describe('demo commerce dependency isolation', () => {
	it('does not import production side-effect boundaries', () => {
		const directory = dirname(fileURLToPath(import.meta.url));
		const forbidden = [
			'$lib/server/db',
			'$lib/server/stripe',
			'$lib/server/affiliate',
			'$lib/server/guestOrderAccess',
			'/services/email',
			'/services/order',
			'/services/checkout',
			'/services/cart',
			'/services/product'
		];
		for (const file of sourceFiles(directory)) {
			const source = readFileSync(file, 'utf8');
			for (const dependency of forbidden) {
				expect(source, `${file} must not import ${dependency}`).not.toContain(dependency);
			}
		}
	});
});
