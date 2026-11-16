import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import SEO from '$lib/components/SEO.svelte';
import ReferralHold from '$lib/components/content/ReferralHold.svelte';
import { layoutOwnsDocumentMeta, publicRouteMetadata } from '$lib/config/site';
import VerifyEmailPage from './verify-email/+page.svelte';

const routesDir = dirname(fileURLToPath(import.meta.url));
const srcDir = join(routesDir, '..');
const seoComponent = join(srcDir, 'lib/components/SEO.svelte');

function walk(dir: string): string[] {
	const files: string[] = [];
	for (const entry of readdirSync(dir)) {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) files.push(...walk(path));
		else if (entry.endsWith('.svelte')) files.push(path);
	}
	return files;
}

function svelteImports(source: string, fromFile: string): string[] {
	return [...source.matchAll(/from\s+['"]([^'"]+\.svelte)['"]/g)].map((match) => {
		const spec = match[1] ?? '';
		return spec.startsWith('$lib/')
			? join(srcDir, 'lib', spec.slice('$lib/'.length))
			: resolve(dirname(fromFile), spec);
	});
}

/** True when this file, or a component it renders, prints a document title. */
function ownsDocumentTitle(file: string, seen = new Set<string>()): boolean {
	if (seen.has(file) || file === seoComponent) return false;
	seen.add(file);
	let source: string;
	try {
		source = readFileSync(file, 'utf8');
	} catch {
		return false;
	}
	if (/<title[\s>]/.test(source) || /<SEO\b/.test(source)) return true;
	return svelteImports(source, file).some((imported) => ownsDocumentTitle(imported, seen));
}

function routePath(file: string): string | null {
	const rel = relative(routesDir, file);
	if (rel.startsWith('..') || rel === '+layout.svelte' || rel === '+error.svelte') return null;
	if (!/\+(?:page|layout)\.svelte$/.test(rel)) return null;
	const parts = rel
		.split('/')
		.filter((part) => part !== '+page.svelte' && part !== '+layout.svelte');
	const path = `/${parts.map((part) => (part.startsWith('[') ? 'example' : part)).join('/')}`;
	return path === '/' ? path : path.replace(/\/+$/, '') || '/';
}

function titles(html: string): string[] {
	return [...html.matchAll(/<title\b[^>]*>[\s\S]*?<\/title>/g)].map((match) => match[0]);
}

/**
 * Layout contribution plus the page head.
 * `SEO` prints `<title>` as its own markup; the layout places that markup in `<svelte:head>`.
 */
function serverHead(pathname: string, pageHead: string, status = 200): string {
	if (!layoutOwnsDocumentMeta(pathname) || status >= 400) return pageHead;
	const meta = publicRouteMetadata(pathname);
	const layout = render(SEO, {
		props: {
			title: meta.title,
			description: meta.description,
			url: pathname,
			author: 'Escherbridge',
			type: 'website'
		}
	});
	return layout.head + layout.body + pageHead;
}

describe('document title', () => {
	it('prints one verify-email title in every state, including no token', () => {
		const states = [
			{ data: { token: null }, form: null },
			{ data: { token: 'opaque-token' }, form: null },
			{
				data: { token: 'opaque-token' },
				form: { success: true, message: 'Email confirmation recorded.' }
			}
		];

		for (const props of states) {
			const pageHead = render(VerifyEmailPage, { props: props as never }).head;
			expect(titles(serverHead('/verify-email', pageHead))).toEqual([
				'<title>Verify your email — Aevani</title>'
			]);
		}

		expect(publicRouteMetadata('/verify-email').title).toBe('Aevani');
		expect(layoutOwnsDocumentMeta('/verify-email')).toBe(false);
	});

	it('does not add a layout title on routes that already print one', () => {
		const doubles: string[] = [];
		for (const file of walk(routesDir)) {
			const path = routePath(file);
			if (!path || !ownsDocumentTitle(file)) continue;
			if (layoutOwnsDocumentMeta(path)) doubles.push(`${relative(srcDir, file)} -> ${path}`);
		}
		expect(doubles).toEqual([]);

		const affiliate = serverHead('/affiliate', render(ReferralHold).head);
		expect(titles(affiliate)).toEqual(['<title>Affiliate referrals — Aevani</title>']);
		expect(layoutOwnsDocumentMeta('/learn/course/example/lesson')).toBe(false);
		expect(layoutOwnsDocumentMeta('/component-demo')).toBe(false);
		expect(readFileSync(join(routesDir, '+layout.svelte'), 'utf8')).toContain(
			'layoutOwnsDocumentMeta(currentUrl) && pageStatus < 400'
		);
	});
});
