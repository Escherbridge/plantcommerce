import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
	SITE_URL,
	isPublicIndexablePath,
	layoutOwnsDocumentMeta,
	publicOperator,
	publicOperatorLine,
	publicRouteMetadata,
	publicSite,
	publicSiteUrl,
	renderRobotsTxt
} from './site';

describe('public site origin', () => {
	it('uses the production apex and ignores Railway and request hosts', async () => {
		const source = await readFile(new URL('./site.ts', import.meta.url), 'utf8');

		expect(SITE_URL).toBe('https://aevani.com');
		expect(publicSite.origin).toBe(SITE_URL);
		expect(publicSiteUrl('/learn')).toBe('https://aevani.com/learn');
		expect(publicSiteUrl('/')).toBe('https://aevani.com/');
		expect(source).not.toContain('PUBLIC_BASE_URL');
		expect(source).not.toContain('RAILWAY_PUBLIC_DOMAIN');
		expect(source).not.toContain('url.origin');
		expect(source).not.toMatch(/process\.env\.ORIGIN|env\('ORIGIN'/);
	});

	it('indexes public learn, guide, course, and product paths only', () => {
		expect(isPublicIndexablePath('/about')).toBe(true);
		expect(isPublicIndexablePath('/sell')).toBe(true);
		expect(isPublicIndexablePath('/learn')).toBe(true);
		expect(isPublicIndexablePath('/guides/understanding-soil-health')).toBe(true);
		expect(isPublicIndexablePath('/blog/hydroponics-for-beginners')).toBe(true);
		expect(isPublicIndexablePath('/courses/hydroponics-field-guide')).toBe(true);
		expect(isPublicIndexablePath('/products/hydroponics/net-pots')).toBe(true);
		expect(isPublicIndexablePath('/learn/course/hydroponics-field-guide')).toBe(false);
		expect(isPublicIndexablePath('/learn/my-courses')).toBe(false);
		expect(isPublicIndexablePath('/products/mock-detail')).toBe(false);
		expect(isPublicIndexablePath('/search')).toBe(false);
		expect(isPublicIndexablePath('/cart')).toBe(false);
		expect(isPublicIndexablePath('/api/admin/seller-applications')).toBe(false);
	});

	it('gives leftover public pages their own title and lets posts own theirs', () => {
		expect(publicRouteMetadata('/faq').title).toBe('FAQ — Aevani');
		expect(publicRouteMetadata('/warranty').title).not.toBe(publicSite.defaultTitle);
		expect(publicRouteMetadata('/press').title).not.toBe(publicSite.defaultTitle);
		expect(layoutOwnsDocumentMeta('/faq')).toBe(true);
		expect(layoutOwnsDocumentMeta('/blog/nothing-for-sale-yet')).toBe(false);
		expect(layoutOwnsDocumentMeta('/blog/cooling-can-use-more-water-than-the-crop')).toBe(false);
		expect(layoutOwnsDocumentMeta('/guides/understanding-soil-health')).toBe(false);
		expect(layoutOwnsDocumentMeta('/courses/hydroponics-field-guide')).toBe(false);
		expect(layoutOwnsDocumentMeta('/products/hydroponics/net-pots')).toBe(false);
	});

	it('points robots at the apex sitemap', () => {
		const robots = renderRobotsTxt();
		expect(robots).toContain('Sitemap: https://aevani.com/sitemap.xml');
		expect(robots).toContain('Disallow: /learn/course/');
		expect(robots).not.toContain('railway.app');
	});

	it('publishes the operator as a city and email', async () => {
		expect(publicOperator.legalName).toBe('Escherbridge, LLC');
		expect(publicOperatorLine).toBe('Boise, Idaho, contact@escherbridge.com');

		const pages = await Promise.all(
			['contact', 'privacy', 'terms'].map((route) =>
				readFile(new URL(`../../routes/${route}/+page.svelte`, import.meta.url), 'utf8')
			)
		);
		for (const page of pages) expect(page).toContain('{publicOperatorLine}');

		const terms = pages[2];
		expect(terms).toContain('laws of the State of Idaho');
		expect(terms).toContain('Ada County, Idaho');

		expect(await countOperatorAddressForms()).toBe(0);
	});
});

const streetSuffix =
	/\b\d{1,6}\s+(?:(?:N|S|E|W|NE|NW|SE|SW)\.?\s+)?(?:[A-Za-z]+\.?\s+){1,4}(?:Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Terrace|Ter|Circle|Cir|Highway|Hwy|Parkway|Pkwy|Way)\b\.?(?!-)/gi;
const zipCode = /\b\d{5}(?:-\d{4})?\b/g;
const poBox = /\bP\.?\s*O\.?\s*Box\b/gi;

/** Operator, legal, and contact copy, plus the JSON-LD that can carry an address. */
const operatorSurfacePaths = [
	'lib/config/site.ts',
	'routes/contact/+page.svelte',
	'routes/privacy/+page.svelte',
	'routes/terms/+page.svelte',
	'lib/components/StructuredData.svelte',
	'lib/content/research.ts',
	'routes/guides/[slug]/+page.svelte',
	'routes/blog/[slug]/+page.svelte',
	'routes/products/[category]/[slug]/+page.svelte'
] as const;

function visibleCopy(source: string): string {
	return source
		.replace(/<style[\s\S]*?<\/style>/gi, ' ')
		.replace(/\sclass=(?:"[^"]*"|'[^']*'|\{[^}]*\})/gi, ' ')
		.replace(/\sclass:[A-Za-z0-9_-]+(?:=(?:"[^"]*"|'[^']*'|\{[^}]*\}))?/gi, ' ');
}

async function countOperatorAddressForms(): Promise<number> {
	const srcRoot = fileURLToPath(new URL('../..', import.meta.url));
	let count = 0;
	for (const rel of operatorSurfacePaths) {
		const text = visibleCopy(await readFile(path.join(srcRoot, rel), 'utf8'));
		count += text.match(streetSuffix)?.length ?? 0;
		count += text.match(zipCode)?.length ?? 0;
		count += text.match(poBox)?.length ?? 0;
	}
	return count;
}
