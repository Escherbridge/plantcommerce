import { describe, expect, it } from 'vitest';
import { sanitizeRichText } from './sanitizeRichText';

describe('sanitizeRichText', () => {
	it('keeps the documented semantic markup and safe links', () => {
		expect(
			sanitizeRichText(
				'<h2>Soil <strong>basics</strong></h2><a href="/learn?topic=soil&level=1">Read more</a>'
			)
		).toBe(
			'<h2>Soil <strong>basics</strong></h2><a href="/learn?topic=soil&amp;level=1" rel="noopener noreferrer">Read more</a>'
		);
	});

	it('escapes unsupported tags and attributes instead of emitting them', () => {
		const result = sanitizeRichText('<script>alert(1)</script><p onclick="alert(1)">Safe</p>');

		expect(result).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
		expect(result).toContain('&lt;p onclick=&quot;alert(1)&quot;&gt;Safe&lt;/p&gt;');
		expect(result).not.toContain('<script>');
		expect(result).not.toContain('<p onclick=');
	});

	it('rejects dangerous and entity-obfuscated link protocols', () => {
		const result = sanitizeRichText(
			'<a href="java&#x73;cript:alert(1)">Unsafe</a><a href="https://example.com/docs">Safe</a>'
		);

		expect(result).toContain(
			'&lt;a href=&quot;java&amp;#x73;cript:alert(1)&quot;&gt;Unsafe&lt;/a&gt;'
		);
		expect(result).toContain(
			'<a href="https://example.com/docs" rel="noopener noreferrer">Safe</a>'
		);
		expect(result).not.toContain('<a href="java');
		expect(result).not.toContain('javascript:');
	});

	it('closes supported tags left open by stored content', () => {
		expect(sanitizeRichText('<p>Complete this lesson')).toBe('<p>Complete this lesson</p>');
	});

	it('preserves the full Quill toolbar output intact', () => {
		const quillOutput =
			'<h2>Title</h2><p>Body <strong>bold</strong> <em>i</em> <u>u</u></p>' +
			'<ul><li>a</li></ul><ol><li>b</li></ol><blockquote>q</blockquote>' +
			'<p><a href="https://x.com">link</a></p>';

		const result = sanitizeRichText(quillOutput);

		// Every formatting tag the restricted toolbar can emit survives.
		expect(result).toContain('<h2>Title</h2>');
		expect(result).toContain('<strong>bold</strong>');
		expect(result).toContain('<em>i</em>');
		expect(result).toContain('<u>u</u>');
		expect(result).toContain('<ul><li>a</li></ul>');
		expect(result).toContain('<ol><li>b</li></ol>');
		expect(result).toContain('<blockquote>q</blockquote>');
		// The link keeps its href and gains the hardening rel attribute.
		expect(result).toContain('rel="noopener noreferrer">link</a>');
		expect(result).toContain('href="https://x.com');

		// Full expected shape (URL normalization appends the trailing slash).
		expect(result).toBe(
			'<h2>Title</h2><p>Body <strong>bold</strong> <em>i</em> <u>u</u></p>' +
				'<ul><li>a</li></ul><ol><li>b</li></ol><blockquote>q</blockquote>' +
				'<p><a href="https://x.com/" rel="noopener noreferrer">link</a></p>'
		);
	});

	it('neutralizes script injection', () => {
		const result = sanitizeRichText("<script>alert('xss')</script>");

		expect(result).not.toContain('<script>');
		expect(result).not.toContain('</script>');
		expect(result).toContain('&lt;script&gt;');
	});

	it('neutralizes an image onerror handler', () => {
		const result = sanitizeRichText('<img src=x onerror=alert(1)>');

		// No live <img> tag is emitted; the whole token is escaped.
		expect(result).not.toContain('<img');
		expect(result).toContain('&lt;img');
	});

	it('drops javascript: links', () => {
		const result = sanitizeRichText('<a href="javascript:alert(1)">click</a>');

		// No live anchor pointing at a javascript: URL survives.
		expect(result).not.toContain('<a href="javascript');
		expect(result).not.toContain('href="javascript:');
		expect(result).toContain('&lt;a href=&quot;javascript:');
	});

	it('strips inline event-handler attributes', () => {
		const result = sanitizeRichText('<p onclick="alert(1)">hi</p>');

		// The paragraph is escaped rather than emitted with an onclick handler.
		expect(result).not.toContain('<p onclick');
		expect(result).not.toContain('onclick="alert(1)">hi</p>');
		expect(result).toContain('&lt;p onclick=&quot;alert(1)&quot;&gt;');
	});

	it('rejects style tags and inline style attributes', () => {
		const styleTag = sanitizeRichText('<style>body{color:red}</style>');
		expect(styleTag).not.toContain('<style>');
		expect(styleTag).not.toContain('</style>');
		expect(styleTag).toContain('&lt;style&gt;');

		const inlineStyle = sanitizeRichText('<p style="color:red">red</p>');
		expect(inlineStyle).not.toContain('<p style');
		expect(inlineStyle).not.toContain('style="color');
		expect(inlineStyle).toContain('&lt;p style=&quot;color:red&quot;&gt;');
	});

	it('rejects iframe embeds', () => {
		const result = sanitizeRichText('<iframe src="evil"></iframe>');

		expect(result).not.toContain('<iframe');
		expect(result).not.toContain('</iframe>');
		expect(result).toContain('&lt;iframe');
	});
});
