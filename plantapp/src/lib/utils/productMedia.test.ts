import { describe, expect, it } from 'vitest';
import { getPublicProductImages } from './productMedia';

describe('getPublicProductImages', () => {
	it('keeps only explicitly supplied public image URLs', () => {
		expect(
			getPublicProductImages(
				[
					{ url: 'https://images.example.com/trowel.webp', altText: 'Garden trowel' },
					{ url: '/api/files/serve?path=AI-MockAssets%2FMAINHERO.png' },
					{ url: '/src/lib/images/product.png' },
					{ bucketPath: 'unresolved.webp' }
				],
				'Fallback description'
			)
		).toEqual([
			{ url: 'https://images.example.com/trowel.webp', altText: 'Garden trowel', isMock: false },
			{
				url: '/api/files/serve?path=AI-MockAssets%2FMAINHERO.png',
				altText: 'Fallback description',
				isMock: true
			}
		]);
	});

	it('uses the product description as alt text only for an approved image URL', () => {
		expect(getPublicProductImages([{ url: '/media/trowel.webp' }], 'Hand-forged trowel')).toEqual([
			{ url: '/media/trowel.webp', altText: 'Hand-forged trowel', isMock: false }
		]);
	});
});
