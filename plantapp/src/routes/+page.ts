import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';
import { getMockProducts } from '$lib/utils/mockProducts';

export const load: PageLoad = async (event) => {
	try {
		const results = await trpc(event).products.getProducts.query({
			featured: true,
			limit: 6,
			sortBy: 'created',
			sortOrder: 'desc'
		});

		// Normalize DB shape { product, category } to flat shape the template expects
		const featuredProducts = (Array.isArray(results) ? results : []).map((row: any) => {
			const p = row.product ?? row;
			const cat = row.category ?? p.category;
			// Parse tags if stored as JSON string
			const tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags ?? []);

			return {
				id: p.id,
				name: p.name,
				slug: p.slug,
				description: p.description,
				shortDescription: p.shortDescription,
				price: p.price,
				comparePrice: p.comparePrice,
				sku: p.sku,
				stockQuantity: p.stockQuantity,
				inStock: p.stockQuantity > 0,
				isFeatured: p.isFeatured,
				tags,
				category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
				// Images: use product images if available, otherwise construct from asset path
				images: p.images?.length
					? p.images.map((img: any) => ({
						url: img.url || `/src/lib/images/${img.bucketPath || 'AI-MockAssets/MAINHERO.png'}`,
						altText: img.altText || p.shortDescription
					}))
					: []
			};
		});

		return { featuredProducts };
	} catch (error) {
		console.error('Error loading featured products, using mock data:', error);
		return {
			featuredProducts: getMockProducts({ featured: true, limit: 6 })
		};
	}
};
