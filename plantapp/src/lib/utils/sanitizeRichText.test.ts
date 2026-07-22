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
});
