import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function channel(value: number): number {
	const c = value / 255;
	return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
	const value = hex.replace('#', '');
	const r = channel(parseInt(value.slice(0, 2), 16));
	const g = channel(parseInt(value.slice(2, 4), 16));
	const b = channel(parseInt(value.slice(4, 6), 16));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground: string, background: string): number {
	const lighter = Math.max(luminance(foreground), luminance(background));
	const darker = Math.min(luminance(foreground), luminance(background));
	return (lighter + 0.05) / (darker + 0.05);
}

/** White glass over the page, matching the product card fill. */
function compositeWhite(page: string, alpha: number): string {
	const value = page.replace('#', '');
	const channels = [0, 2, 4].map((index) => {
		const base = parseInt(value.slice(index, index + 2), 16);
		return Math.round(255 * alpha + base * (1 - alpha))
			.toString(16)
			.padStart(2, '0');
	});
	return `#${channels.join('')}`;
}

describe('catalogue text contrast', () => {
	const page = '#f4f1ea';
	const card = compositeWhite(page, 0.72);

	it('gives the product-card eyebrow and the blog date at least 4.5:1', () => {
		const productCard = readFileSync(
			join(srcDir, 'lib/components/cards/ProductCard.svelte'),
			'utf8'
		);
		const blogIndex = readFileSync(join(srcDir, 'routes/blog/+page.svelte'), 'utf8');
		const blogPost = readFileSync(join(srcDir, 'routes/blog/[slug]/+page.svelte'), 'utf8');

		expect(productCard).toMatch(/\.pc__eyebrow \{[^}]*color:\s*#587364;/s);
		expect(blogIndex).toContain('color: #5c665d;');
		expect(blogPost).toContain('color: #5c665d;');

		expect(contrast('#7c9585', card)).toBeLessThan(4.5);
		expect(contrast('#768177', page)).toBeLessThan(4.5);
		expect(contrast('#587364', card)).toBeGreaterThanOrEqual(4.5);
		expect(contrast('#587364', page)).toBeGreaterThanOrEqual(4.5);
		expect(contrast('#5c665d', page)).toBeGreaterThanOrEqual(4.5);
	});

	it('gives the home system number at least 4.5:1 on #fcfbf9', () => {
		const systemCard = readFileSync(join(srcDir, 'lib/components/cards/SystemCard.svelte'), 'utf8');
		const home = '#fcfbf9';

		expect(systemCard).toMatch(/\.system-card__number \{[^}]*color:\s*#587364;/s);
		expect(contrast('#7c9585', home)).toBeLessThan(4.5);
		expect(contrast('#587364', home)).toBeGreaterThanOrEqual(4.5);
	});

	it('gives unselected FAQ tabs at least 4.5:1 on #f4f1ea', () => {
		const faq = readFileSync(join(srcDir, 'routes/faq/+page.svelte'), 'utf8');

		expect(faq).toContain('color: #5c665d');
		expect(contrast('#8b938a', '#f4f1ea')).toBeLessThan(4.5);
		expect(contrast('#5c665d', '#f4f1ea')).toBeGreaterThanOrEqual(4.5);
	});

	it('gives search result blurbs at least 4.5:1 on #f4f1ea', () => {
		const search = readFileSync(join(srcDir, 'routes/search/+page.svelte'), 'utf8');

		expect(search).toContain('class="search-blurb text-sm">{course.description}');
		expect(search).toContain('color: #5c665d');
		expect(search).not.toMatch(/class="[^"]*text-base-content\/60/);
		expect(contrast('#768177', '#f4f1ea')).toBeLessThan(4.5);
		expect(contrast('#5c665d', '#f4f1ea')).toBeGreaterThanOrEqual(4.5);
	});
});
