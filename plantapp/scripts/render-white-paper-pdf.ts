/**
 * Render each white paper to a US Letter PDF with the print template.
 *
 * From plantapp:
 *   npm run white-papers:pdf
 *   npm run white-papers:pdf -- example-white-paper
 *
 * Uses Playwright, which is already a dev dependency. No paid service.
 * Writes `static/white-papers/<slug>.pdf`. Unpublished papers are rendered
 * too, so the file is ready when `published` flips to true. The page stays
 * a 404 until that flag is true.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { whitePaperProblems, whitePapers } from '../src/lib/content/white-papers';
import {
	renderWhitePaperDocument,
	whitePaperFooterTemplate,
	whitePaperHeaderTemplate
} from '../src/lib/content/whitePaperPrint';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const staticRoot = resolve(appRoot, 'static');

const fontFiles = [
	{
		family: 'Familjen Grotesk Variable',
		weight: '400 700',
		file: 'node_modules/@fontsource-variable/familjen-grotesk/files/familjen-grotesk-latin-wght-normal.woff2'
	},
	{
		family: 'Familjen Grotesk Variable',
		weight: '400 700',
		file: 'node_modules/@fontsource-variable/familjen-grotesk/files/familjen-grotesk-latin-ext-wght-normal.woff2'
	},
	{
		family: 'Instrument Sans Variable',
		weight: '400 700',
		file: 'node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2'
	},
	{
		family: 'Instrument Sans Variable',
		weight: '400 700',
		file: 'node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-ext-wght-normal.woff2'
	},
	{
		family: 'JetBrains Mono',
		weight: '400',
		file: 'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2'
	},
	{
		family: 'JetBrains Mono',
		weight: '700',
		file: 'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2'
	}
] as const;

function fontFaceCss(): string {
	return fontFiles
		.map((face) => {
			const href = pathToFileURL(resolve(appRoot, face.file)).href;
			return `@font-face{font-family:'${face.family}';font-style:normal;font-weight:${face.weight};font-display:swap;src:url('${href}') format('woff2');}`;
		})
		.join('\n');
}

function pdfPathFor(pdfPath: string): string {
	if (
		!pdfPath.startsWith('/white-papers/') ||
		!pdfPath.endsWith('.pdf') ||
		pdfPath.includes('..')
	) {
		throw new Error(`Refusing to write outside static/white-papers: ${pdfPath}`);
	}
	return resolve(staticRoot, pdfPath.slice(1));
}

const requested = process.argv.slice(2).filter((arg) => arg !== '--');
const papers =
	requested.length === 0
		? [...whitePapers]
		: whitePapers.filter((paper) => requested.includes(paper.slug));

if (papers.length === 0) {
	console.error(`No white paper matched: ${requested.join(', ')}`);
	process.exit(1);
}

for (const paper of papers) {
	const problems = whitePaperProblems(paper);
	if (problems.length > 0) {
		console.error(`${paper.slug}: ${problems.join('; ')}`);
		process.exit(1);
	}
}

const faces = fontFaceCss();
const browser = await chromium.launch();
const page = await browser.newPage();

try {
	for (const paper of papers) {
		const html = renderWhitePaperDocument(paper, {
			fontFaceCss: faces,
			resolveAsset: (publicPath) => pathToFileURL(resolve(staticRoot, publicPath.slice(1))).href
		});
		const htmlPath = resolve('/tmp', `aevani-white-paper-${paper.slug}.html`);
		await writeFile(htmlPath, html);
		await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
		await page.emulateMedia({ media: 'print' });
		const destination = pdfPathFor(paper.pdfPath);
		await mkdir(dirname(destination), { recursive: true });
		await page.pdf({
			path: destination,
			format: 'Letter',
			printBackground: true,
			preferCSSPageSize: true,
			displayHeaderFooter: true,
			headerTemplate: whitePaperHeaderTemplate(paper, faces),
			footerTemplate: whitePaperFooterTemplate(faces),
			margin: { top: '0.78in', right: '0.7in', bottom: '0.68in', left: '0.7in' }
		});
		console.log(destination);
	}
} finally {
	await browser.close();
}
