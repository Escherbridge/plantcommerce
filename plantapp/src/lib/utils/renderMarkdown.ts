import { Marked, type Token, type Tokens } from 'marked';
import { sanitizeRichText } from './sanitizeRichText';

const marked = new Marked({
	async: false,
	gfm: true,
	breaks: false
});

/**
 * A raw "<" in prose would be scanned as a tag. Hold it aside until after
 * sanitizeRichText has escaped the surrounding text.
 */
const lessThan = '\uE000';

function plain(value: string): string {
	return value.replaceAll('<', lessThan);
}

function renderBlocks(tokens: Token[]): string {
	let html = '';
	for (const token of tokens) html += renderBlock(token);
	return html;
}

function renderBlock(token: Token): string {
	switch (token.type) {
		case 'space':
			return '';
		case 'heading':
			return renderHeading(token as Tokens.Heading);
		case 'paragraph':
			return `<p>${renderInlines((token as Tokens.Paragraph).tokens)}</p>`;
		case 'text':
			return renderText(token as Tokens.Text);
		case 'list':
			return renderList(token as Tokens.List);
		case 'blockquote':
			return `<blockquote>${renderBlocks((token as Tokens.Blockquote).tokens)}</blockquote>`;
		case 'code':
			return `<pre><code>${plain((token as Tokens.Code).text)}</code></pre>`;
		case 'hr':
			return '<hr>';
		case 'html':
			return (token as Tokens.HTML).text;
		case 'table':
			return renderTable(token as Tokens.Table);
		default:
			return renderFallback(token);
	}
}

function renderHeading(token: Tokens.Heading): string {
	const depth = token.depth >= 1 && token.depth <= 6 ? token.depth : 6;
	return `<h${depth}>${renderInlines(token.tokens)}</h${depth}>`;
}

function renderList(token: Tokens.List): string {
	const tag = token.ordered ? 'ol' : 'ul';
	const items = token.items.map((item) => `<li>${renderBlocks(item.tokens)}</li>`).join('');
	return `<${tag}>${items}</${tag}>`;
}

function renderTable(token: Tokens.Table): string {
	return [token.header, ...token.rows]
		.map((row) => `<p>${row.map((cell) => renderInlines(cell.tokens)).join(' ')}</p>`)
		.join('');
}

function renderInlines(tokens: Token[] | undefined): string {
	if (!tokens) return '';
	let html = '';
	for (const token of tokens) html += renderInline(token);
	return html;
}

function renderInline(token: Token): string {
	switch (token.type) {
		case 'escape':
		case 'text':
			return renderText(token as Tokens.Text);
		case 'strong':
			return `<strong>${renderInlines((token as Tokens.Strong).tokens)}</strong>`;
		case 'em':
			return `<em>${renderInlines((token as Tokens.Em).tokens)}</em>`;
		case 'codespan':
			return `<code>${plain((token as Tokens.Codespan).text)}</code>`;
		case 'del':
			return `<del>${renderInlines((token as Tokens.Del).tokens)}</del>`;
		case 'br':
			return '<br>';
		case 'link':
			return renderLink(token as Tokens.Link);
		case 'image':
			return renderImage(token as Tokens.Image);
		case 'html':
			return (token as Tokens.HTML).text;
		default:
			return renderFallback(token);
	}
}

function renderText(token: Tokens.Text): string {
	if (token.tokens?.length) return renderInlines(token.tokens);
	return plain(token.text);
}

function renderLink(token: Tokens.Link): string {
	const label = renderInlines(token.tokens);
	const href = token.href.trim();
	if (!href || /[\u0000-\u0020"'<>`]/.test(href)) return label;
	return `<a href="${href}">${label}</a>`;
}

function renderImage(token: Tokens.Image): string {
	if (token.tokens?.length) return renderInlines(token.tokens);
	return plain(token.text);
}

function renderFallback(token: Token): string {
	if ('tokens' in token && token.tokens?.length) return renderInlines(token.tokens);
	if ('text' in token && typeof token.text === 'string') return plain(token.text);
	return '';
}

/**
 * Legacy CMS bodies (`content_page.content`) are Markdown. Structured research
 * guides do not use this path. The result is sanitized before `{@html}`.
 */
export function renderMarkdownBody(content: string | null | undefined): string {
	if (typeof content !== 'string' || !content.trim()) return '';
	return sanitizeRichText(renderBlocks(marked.lexer(content))).replaceAll(lessThan, '&lt;');
}
