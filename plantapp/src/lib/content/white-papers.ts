/**
 * White papers.
 *
 * How to add a paper:
 * 1. Add an object to `whitePapers` with a unique slug, title, one-paragraph
 *    summary, coverImage (or null), publishedAt (`YYYY-MM-DD`), pdfPath,
 *    sections, and sources. Leave `published` false. Set `placeholder` false
 *    for a real paper.
 * 2. Put the PDF at `static/white-papers/<slug>.pdf`. From `plantapp`, run
 *    `npm run white-papers:pdf -- <slug>` to render the print template, or
 *    copy a finished PDF to that path. The public URL is `/white-papers/<slug>.pdf`.
 * 3. Optional cover: save the image under `static/` and set `coverImage` to
 *    its public path, such as `/white-papers/<slug>-cover.png`.
 * 4. When the paper is approved, set `published` to true. That lists it on
 *    `/white-papers`, serves `/white-papers/<slug>`, and adds both URLs to the
 *    sitemap and llms.txt. Until then the detail route returns 404.
 * 5. Header, footer, and mobile navigation do not link here. Add that link
 *    only after a paper is approved for the public site.
 *
 * The sample entry is a PLACEHOLDER. Do not set its `published` flag to true.
 */

export interface WhitePaperSource {
	/** Footnote number. Body paragraphs cite it as `[^1]`. */
	number: number;
	label: string;
	href?: string;
}

export interface WhitePaperSection {
	heading: string;
	paragraphs: readonly string[];
}

export interface WhitePaper {
	slug: string;
	title: string;
	/** One paragraph. Shown on the index and under the title. */
	summary: string;
	/** Public path of a static cover image, or null for an empty slot. */
	coverImage: string | null;
	coverImageAlt: string;
	/** Calendar date, `YYYY-MM-DD`. */
	publishedAt: string;
	/** Public path of the static PDF. A plain file link, with no gate. */
	pdfPath: string;
	/**
	 * Unpublished papers are omitted from the index, the sitemap, and llms.txt.
	 * Their detail route returns 404.
	 */
	published: boolean;
	/** True only for the template sample. A placeholder must stay unpublished. */
	placeholder: boolean;
	sections: readonly WhitePaperSection[];
	sources: readonly WhitePaperSource[];
}

export const WHITE_PAPER_OPERATOR_LINE =
	'operated by Escherbridge, LLC, Boise, Idaho · contact@escherbridge.com' as const;

const footnoteMarker = /\[\^(\d+)\]/g;

export interface WhitePaperTextPart {
	kind: 'text';
	text: string;
}

export interface WhitePaperNotePart {
	kind: 'note';
	number: number;
}

export type WhitePaperInlinePart = WhitePaperTextPart | WhitePaperNotePart;

/**
 * PLACEHOLDER ENTRY.
 * Title is "Example white paper". `published` is false on purpose.
 * This record is a template sample. It is excluded from the index, the
 * sitemap, and llms.txt, and `/white-papers/example-white-paper` returns 404.
 */
const placeholderWhitePaper = {
	slug: 'example-white-paper',
	title: 'Example white paper',
	summary:
		'This is a placeholder white paper for the Aevani template. It is not an approved paper, and it is not published.',
	coverImage: null,
	coverImageAlt: 'Cover image slot. This placeholder has no cover image.',
	publishedAt: '2026-11-16',
	pdfPath: '/white-papers/example-white-paper.pdf',
	published: false,
	placeholder: true,
	sections: [
		{
			heading: 'What this placeholder is',
			paragraphs: [
				'This record exists so the white paper page and the print template have a shape to follow. The title, the summary, the cover image slot, the date, and the PDF link all come from one typed file. This text is filler that names itself as a placeholder. It is not a finding and it is not advice.'
			]
		},
		{
			heading: 'How a finished paper is filed',
			paragraphs: [
				'A finished paper keeps the same fields. The cover image slot takes a static image, or it stays empty. The download is a plain link to a PDF file on this site. There is no form and no account in front of that file.[^1]'
			]
		},
		{
			heading: 'What stays off the public pages',
			paragraphs: [
				'Unpublished records do not appear on the white paper index. Their address returns a not-found page. They are left out of the sitemap and the public agent map. This placeholder stays in that state until someone replaces it with an approved paper and marks that paper published.'
			]
		}
	],
	sources: [
		{
			number: 1,
			label:
				'Placeholder source. This note is an empty slot for a real citation. It does not name a study or a product.'
		}
	]
} as const satisfies WhitePaper;

export const whitePapers: readonly WhitePaper[] = [placeholderWhitePaper];

export function publishedWhitePapers(papers: readonly WhitePaper[] = whitePapers): WhitePaper[] {
	return papers.filter((paper) => paper.published);
}

export function whitePaperBySlug(
	slug: string,
	papers: readonly WhitePaper[] = whitePapers
): WhitePaper | undefined {
	return papers.find((paper) => paper.slug === slug);
}

/** Index and detail paths for papers with `published: true`. Empty when none are. */
export function publishedWhitePaperPaths(papers: readonly WhitePaper[] = whitePapers): string[] {
	const published = publishedWhitePapers(papers);
	if (published.length === 0) return [];
	return ['/white-papers', ...published.map((paper) => `/white-papers/${paper.slug}`)];
}

export function publishedWhitePaperLastmods(
	papers: readonly WhitePaper[] = whitePapers
): [string, string][] {
	const entries: [string, string][] = [];
	let latest = '';
	for (const paper of publishedWhitePapers(papers)) {
		const day = paper.publishedAt.slice(0, 10);
		if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
		entries.push([`/white-papers/${paper.slug}`, day]);
		if (day > latest) latest = day;
	}
	if (latest) entries.push(['/white-papers', latest]);
	return entries;
}

export function isPublishedWhitePaperPath(
	pathname: string,
	papers: readonly WhitePaper[] = whitePapers
): boolean {
	const path = pathname === '/' ? pathname : pathname.replace(/\/+$/, '') || '/';
	return publishedWhitePaperPaths(papers).includes(path);
}

export function whitePaperLlmsEntries(
	papers: readonly WhitePaper[] = whitePapers
): { path: string; title: string }[] {
	const published = publishedWhitePapers(papers);
	if (published.length === 0) return [];
	return [
		{ path: '/white-papers', title: 'White papers' },
		...published.map((paper) => ({
			path: `/white-papers/${paper.slug}`,
			title: paper.title
		}))
	];
}

export function whitePaperInlineParts(
	paragraph: string,
	sources: readonly WhitePaperSource[]
): WhitePaperInlinePart[] {
	const known = new Set(sources.map((source) => source.number));
	const parts: WhitePaperInlinePart[] = [];
	let last = 0;
	for (const match of paragraph.matchAll(footnoteMarker)) {
		const index = match.index ?? 0;
		const number = Number(match[1]);
		if (!known.has(number)) continue;
		if (index > last) parts.push({ kind: 'text', text: paragraph.slice(last, index) });
		parts.push({ kind: 'note', number });
		last = index + match[0].length;
	}
	if (last < paragraph.length) parts.push({ kind: 'text', text: paragraph.slice(last) });
	if (parts.length === 0) parts.push({ kind: 'text', text: paragraph });
	return parts;
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Structural problems. Empty means the record can be rendered. */
export function whitePaperProblems(paper: WhitePaper): string[] {
	const problems: string[] = [];
	if (!slugPattern.test(paper.slug))
		problems.push('slug must be lowercase words separated by hyphens');
	if (!paper.title.trim()) problems.push('title is empty');
	if (!paper.summary.trim()) problems.push('summary is empty');
	if (paper.summary.includes('\n')) problems.push('summary must be one paragraph');
	if (!/^\d{4}-\d{2}-\d{2}$/.test(paper.publishedAt))
		problems.push('publishedAt must be YYYY-MM-DD');
	if (paper.pdfPath !== `/white-papers/${paper.slug}.pdf`) {
		problems.push('pdfPath must be /white-papers/<slug>.pdf');
	}
	if (paper.placeholder && paper.published) problems.push('a placeholder must stay unpublished');
	if (paper.coverImage && !paper.coverImage.startsWith('/')) {
		problems.push('coverImage must be a site path or null');
	}

	const numbers = paper.sources.map((source) => source.number);
	if (new Set(numbers).size !== numbers.length) problems.push('source numbers must be unique');

	const cited = new Set<number>();
	for (const section of paper.sections) {
		for (const paragraph of section.paragraphs) {
			for (const match of paragraph.matchAll(footnoteMarker)) cited.add(Number(match[1]));
		}
	}
	for (const number of cited) {
		if (!numbers.includes(number)) problems.push(`footnote ${number} has no source`);
	}
	for (const number of numbers) {
		if (!cited.has(number)) problems.push(`source ${number} is not cited`);
	}
	return problems;
}
