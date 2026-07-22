const allowedTags = new Set([
	'a',
	'blockquote',
	'b',
	'br',
	'code',
	'del',
	'em',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'hr',
	'i',
	'li',
	'ol',
	'p',
	'pre',
	's',
	'strong',
	'u',
	'ul'
]);

const voidTags = new Set(['br', 'hr']);
const urlNamedEntities: Record<string, string> = {
	amp: '&',
	apos: "'",
	colon: ':',
	gt: '>',
	lt: '<',
	newline: '\n',
	nbsp: '\u00a0',
	quot: '"',
	tab: '\t'
};

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function decodeUrlEntities(value: string): string {
	return value.replace(
		/&#x([0-9a-f]+);?|&#([0-9]+);?|&([a-z]+);?/gi,
		(match, hexadecimal, decimal, named) => {
			if (hexadecimal || decimal) {
				const codePoint = Number.parseInt(hexadecimal || decimal, hexadecimal ? 16 : 10);
				if (
					!Number.isSafeInteger(codePoint) ||
					codePoint < 0 ||
					codePoint > 0x10ffff ||
					(codePoint >= 0xd800 && codePoint <= 0xdfff)
				) {
					return '';
				}

				return String.fromCodePoint(codePoint);
			}

			return urlNamedEntities[named.toLowerCase()] ?? match;
		}
	);
}

function sanitizeHref(rawHref: string): string | null {
	const href = decodeUrlEntities(rawHref)
		.trim()
		.replace(/[\u0000-\u0020\u007f-\u00a0]/g, '');

	if (!href || href.startsWith('//')) {
		return null;
	}

	const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(href)?.[1]?.toLowerCase();
	if (!scheme) {
		return href;
	}

	if (scheme !== 'http' && scheme !== 'https' && scheme !== 'mailto') {
		return null;
	}

	try {
		const parsed = new URL(href);
		if (parsed.protocol !== `${scheme}:` || parsed.username || parsed.password) {
			return null;
		}
		return parsed.toString();
	} catch {
		return null;
	}
}

function sanitizeTag(token: string, openTags: string[]): string | null {
	const anchor = /^<a\s+href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))\s*>$/i.exec(token);
	if (anchor) {
		const href = sanitizeHref(anchor[1] ?? anchor[2] ?? anchor[3]);
		if (!href) {
			return null;
		}

		openTags.push('a');
		return `<a href="${escapeHtml(href)}" rel="noopener noreferrer">`;
	}

	const closing = /^<\/([a-z][a-z0-9]*)\s*>$/i.exec(token);
	if (closing) {
		const tag = closing[1].toLowerCase();
		if (!allowedTags.has(tag) || voidTags.has(tag) || openTags[openTags.length - 1] !== tag) {
			return null;
		}

		openTags.pop();
		return `</${tag}>`;
	}

	const voidTag = /^<(br|hr)\s*\/?>$/i.exec(token);
	if (voidTag) {
		return `<${voidTag[1].toLowerCase()}>`;
	}

	const opening = /^<([a-z][a-z0-9]*)\s*>$/i.exec(token);
	if (!opening) {
		return null;
	}

	const tag = opening[1].toLowerCase();
	if (!allowedTags.has(tag) || voidTags.has(tag) || tag === 'a') {
		return null;
	}

	openTags.push(tag);
	return `<${tag}>`;
}

/** See `src/lib/utils/AGENTS.md` for the supported stored-rich-text subset. */
export function sanitizeRichText(content: string | null | undefined): string {
	if (typeof content !== 'string' || !content) {
		return '';
	}

	const openTags: string[] = [];
	let sanitized = '';
	let textStart = 0;

	for (let start = content.indexOf('<'); start !== -1; start = content.indexOf('<', start + 1)) {
		const end = content.indexOf('>', start + 1);
		if (end === -1) {
			break;
		}

		sanitized += escapeHtml(content.slice(textStart, start));
		const token = content.slice(start, end + 1);
		sanitized += sanitizeTag(token, openTags) ?? escapeHtml(token);
		textStart = end + 1;
		start = end;
	}

	sanitized += escapeHtml(content.slice(textStart));
	return `${sanitized}${openTags
		.reverse()
		.map((tag) => `</${tag}>`)
		.join('')}`;
}
