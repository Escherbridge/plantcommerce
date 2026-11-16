import { LEAF_MARK_PATHS, leafMarkSvg } from '../brand/leafMark';
import { formatAbsoluteDate } from '../utils/relativeTime';
import { WHITE_PAPER_OPERATOR_LINE, whitePaperInlineParts, type WhitePaper } from './white-papers';

export interface WhitePaperPrintOptions {
	/** `@font-face` rules for the self-hosted families. The script fills these in. */
	fontFaceCss?: string;
	/** Rewrite a public asset path to a URL the PDF renderer can read. */
	resolveAsset?: (publicPath: string) => string;
}

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}

function safeAsset(
	path: string | null,
	resolveAsset?: (publicPath: string) => string
): string | null {
	if (!path || !path.startsWith('/') || path.startsWith('//')) return null;
	return resolveAsset ? resolveAsset(path) : path;
}

function safeSourceHref(href: string | undefined): string | null {
	if (!href) return null;
	if (href.startsWith('https://') || href.startsWith('http://') || href.startsWith('/'))
		return href;
	return null;
}

function renderParagraph(paragraph: string, paper: WhitePaper): string {
	return whitePaperInlineParts(paragraph, paper.sources)
		.map((part) => {
			if (part.kind === 'text') return escapeHtml(part.text);
			return `<sup class="fn"><a href="#fn-${part.number}">${part.number}</a></sup>`;
		})
		.join('');
}

/**
 * Standalone US Letter document for print and for the PDF script.
 * No scripts, no forms, and no third-party requests.
 */
export function renderWhitePaperDocument(
	paper: WhitePaper,
	options: WhitePaperPrintOptions = {}
): string {
	const date = formatAbsoluteDate(`${paper.publishedAt}T00:00:00.000Z`);
	const kicker = paper.placeholder ? 'Placeholder white paper' : 'White paper';
	const coverSrc = safeAsset(paper.coverImage, options.resolveAsset);
	const cover = coverSrc
		? `<figure class="cover-slot"><img src="${escapeHtml(coverSrc)}" alt="${escapeHtml(paper.coverImageAlt)}" /></figure>`
		: `<figure class="cover-slot"><div class="cover-slot-empty"><p>Cover image</p><p>${escapeHtml(paper.coverImageAlt)}</p></div></figure>`;
	const sections = paper.sections
		.map(
			(section) => `<section>
				<h2>${escapeHtml(section.heading)}</h2>
				${section.paragraphs.map((paragraph) => `<p>${renderParagraph(paragraph, paper)}</p>`).join('')}
			</section>`
		)
		.join('');
	const notes = paper.sources
		.map((source) => {
			const href = safeSourceHref(source.href);
			const label = href
				? `<a href="${escapeHtml(href)}">${escapeHtml(source.label)}</a>`
				: escapeHtml(source.label);
			return `<li id="fn-${source.number}" value="${source.number}">${label}</li>`;
		})
		.join('');
	const leaf = leafMarkSvg({ size: 72, variant: 'light' });

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(paper.title)} — Aevani</title>
<style>
${options.fontFaceCss ?? ''}
:root {
	--primary: #2E6B4F;
	--secondary: #1E4A36;
	--accent: #8FD8B4;
	--base: #F4F1EA;
	--ink: #1C3527;
	--font-display: 'Familjen Grotesk Variable', 'Familjen Grotesk', sans-serif;
	--font-body: 'Instrument Sans Variable', 'Instrument Sans', sans-serif;
	--font-mono: 'JetBrains Mono', ui-monospace, monospace;
}
@page {
	size: letter;
	margin: 0.78in 0.7in 0.68in;
}
* { box-sizing: border-box; }
html, body {
	margin: 0;
	padding: 0;
	background: var(--base);
	color: var(--ink);
	font-family: var(--font-body);
	font-size: 11pt;
	line-height: 1.5;
}
.wordmark {
	margin: 0;
	font-family: var(--font-display);
	font-weight: 700;
	letter-spacing: 0.14em;
	line-height: 1;
}
.cover {
	break-after: page;
	page-break-after: always;
	min-height: 8.9in;
	display: flex;
	flex-direction: column;
	background: var(--base);
}
.cover-brand {
	display: flex;
	align-items: center;
	gap: 0.85rem;
}
.cover .wordmark { font-size: 22pt; color: var(--ink); }
.kicker {
	margin: 1.6rem 0 0;
	font-family: var(--font-mono);
	font-size: 9pt;
	font-weight: 700;
	letter-spacing: 0.16em;
	text-transform: uppercase;
	color: var(--primary);
}
h1 {
	margin: 0.45rem 0 0;
	font-family: var(--font-display);
	font-weight: 700;
	font-size: 32pt;
	line-height: 1.05;
	letter-spacing: -0.02em;
	color: var(--ink);
}
.summary {
	margin: 1rem 0 0;
	max-width: 38rem;
	font-size: 13pt;
	line-height: 1.45;
	color: var(--secondary);
}
.cover-slot {
	margin: 1.4rem 0 0;
	width: 100%;
	max-width: 6.4in;
}
.cover-slot img,
.cover-slot-empty {
	display: block;
	width: 100%;
	height: 2.7in;
	object-fit: cover;
	background: #E7F6EE;
	border: 1px solid var(--accent);
	border-radius: 12px;
}
.cover-slot-empty {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: flex-end;
	height: 2.7in;
	margin: 0;
	padding: 1rem 1.1rem;
	color: var(--secondary);
}
.cover-slot-empty p { margin: 0; }
.cover-slot-empty p:first-child {
	font-family: var(--font-mono);
	font-size: 8.5pt;
	font-weight: 700;
	letter-spacing: 0.14em;
	text-transform: uppercase;
	color: var(--primary);
}
.cover-meta {
	margin-top: auto;
	padding-top: 1.5rem;
	font-family: var(--font-mono);
	font-size: 9pt;
	letter-spacing: 0.04em;
	color: var(--secondary);
}
.body { padding-top: 0.15in; }
.body h2 {
	margin: 1.35rem 0 0.4rem;
	font-family: var(--font-display);
	font-weight: 700;
	font-size: 16pt;
	line-height: 1.2;
	color: var(--secondary);
}
.body h2:first-child { margin-top: 0; }
.body p { margin: 0.45rem 0 0; }
.fn {
	font-family: var(--font-mono);
	font-size: 0.72em;
	line-height: 0;
}
.fn a, .notes a { color: var(--primary); text-decoration: none; }
.notes {
	margin-top: 1.8rem;
	padding-top: 0.7rem;
	border-top: 1px solid var(--secondary);
}
.notes h2 {
	margin: 0 0 0.45rem;
	font-family: var(--font-mono);
	font-size: 8.5pt;
	font-weight: 700;
	letter-spacing: 0.16em;
	text-transform: uppercase;
	color: var(--primary);
}
.notes ol {
	margin: 0;
	padding: 0 0 0 1.4rem;
	font-size: 9pt;
	line-height: 1.4;
	color: var(--secondary);
}
.notes li { margin: 0.28rem 0; padding-left: 0.2rem; }
</style>
</head>
<body>
<article>
	<section class="cover">
		<div class="cover-brand">${leaf}<p class="wordmark">AEVANI</p></div>
		<p class="kicker">${escapeHtml(kicker)}</p>
		<h1>${escapeHtml(paper.title)}</h1>
		<p class="summary">${escapeHtml(paper.summary)}</p>
		${cover}
		<p class="cover-meta"><time datetime="${escapeHtml(paper.publishedAt)}">${escapeHtml(date)}</time><br />${WHITE_PAPER_OPERATOR_LINE}</p>
	</section>
	<div class="body">
		${sections}
		<section class="notes">
			<h2>Notes</h2>
			<ol>${notes}</ol>
		</section>
	</div>
</article>
</body>
</html>`;
}

export const whitePaperLeafPaths = LEAF_MARK_PATHS;

/** Chromium's PDF header. `page.pdf` repeats this on every Letter page. */
export function whitePaperHeaderTemplate(paper: WhitePaper, fontFaceCss = ''): string {
	const leaf = leafMarkSvg({ size: 16, variant: 'light' });
	const title = escapeHtml(paper.title);
	return `<style>${fontFaceCss}
		.banner { box-sizing: border-box; width: 100%; padding: 0 0.7in; display: flex; justify-content: space-between; align-items: center; gap: 12px; color: #1E4A36; font-size: 9px; }
		.brand { display: inline-flex; align-items: center; gap: 6px; }
		.wordmark { font-family: 'Familjen Grotesk Variable', 'Familjen Grotesk', sans-serif; font-weight: 700; letter-spacing: 0.14em; }
		.paper-name { font-family: 'Instrument Sans Variable', 'Instrument Sans', sans-serif; text-align: right; }
	</style>
	<div class="banner"><span class="brand">${leaf}<span class="wordmark">AEVANI</span></span><span class="paper-name">${title}</span></div>`;
}

/** Chromium's PDF footer, with the operator line and the real page number. */
export function whitePaperFooterTemplate(fontFaceCss = ''): string {
	return `<style>${fontFaceCss}
		.banner { box-sizing: border-box; width: 100%; padding: 0 0.7in; display: flex; justify-content: space-between; align-items: center; gap: 12px; color: #1E4A36; font-family: 'Instrument Sans Variable', 'Instrument Sans', sans-serif; font-size: 8px; border-top: 1px solid #8FD8B4; padding-top: 4px; }
	</style>
	<div class="banner"><span>${WHITE_PAPER_OPERATOR_LINE}</span><span class="pageNumber"></span></div>`;
}
