import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';
import { getMockProducts } from '$lib/utils/mockProducts';

export const load: PageLoad = async (event) => {
	const { url } = event;
	const productSlug = url.searchParams.get('product');

	try {
		let product: any;
		let relatedProducts: any[] = [];

		if (productSlug) {
			// Fetch specific product by slug from database
			const dbProduct = await trpc(event).products.getProduct.query({ slug: productSlug });
			product = normalizeProduct(dbProduct);
		} else {
			// Fallback: get first featured product
			const results = await trpc(event).products.getProducts.query({
				featured: true,
				limit: 1,
				sortBy: 'created',
				sortOrder: 'desc'
			});
			const row = Array.isArray(results) && results.length > 0 ? results[0] : null;
			product = row ? normalizeProduct(row) : null;
		}

		if (product) {
			// Get related products from same category
			const relatedResults = await trpc(event).products.getProducts.query({
				categoryId: product.category?.id,
				limit: 5,
				sortBy: 'created',
				sortOrder: 'desc'
			});
			relatedProducts = (Array.isArray(relatedResults) ? relatedResults : [])
				.map(normalizeProduct)
				.filter((p: any) => p.id !== product.id)
				.slice(0, 4);
		}

		if (!product) {
			// Fallback to mock data
			const mockProducts = getMockProducts({ featured: true, limit: 1 });
			product = mockProducts[0];
			relatedProducts = getMockProducts({ featured: true, limit: 4 })
				.filter(p => p.id !== product.id);
		}

		const seoData = {
			title: `${product.name} | Aevani`,
			description: product.description || product.shortDescription || `Shop ${product.name} on Aevani.`,
			image: product.images?.[0]?.url || '/src/lib/images/AI-MockAssets/MAINHERO.png',
			type: 'product' as const,
			tags: [product.category?.name || 'Gardening']
		};

		return {
			product,
			relatedProducts,
			seo: seoData
		};
	} catch (error) {
		console.error('Error loading product detail, using mock data:', error);

		const mockProducts = getMockProducts({ featured: true, limit: 1 });
		const product = mockProducts[0];
		const relatedProducts = getMockProducts({ featured: true, limit: 4 })
			.filter(p => p.id !== product.id);

		return {
			product,
			relatedProducts,
			seo: {
				title: `${product.name} | Aevani`,
				description: product.description || product.shortDescription,
				image: product.images?.[0]?.url || '/src/lib/images/AI-MockAssets/MAINHERO.png',
				type: 'product' as const,
				tags: [product.category?.name || 'Gardening']
			}
		};
	}
};

/** Normalize DB product shape to template-expected flat shape */
function normalizeProduct(row: any) {
	const p = row.product ?? row;
	const cat = row.category ?? p.category;
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
		stockQuantity: p.stockQuantity ?? 0,
		inStock: (p.stockQuantity ?? 0) > 0,
		isFeatured: p.isFeatured,
		tags,
		category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
		images: p.images?.length
			? p.images.map((img: any) => ({
				url: img.url || `/src/lib/images/${img.bucketPath || 'AI-MockAssets/MAINHERO.png'}`,
				altText: img.altText || p.shortDescription
			}))
			: [],
		imageUrl: p.images?.[0]?.url || undefined,
		image: p.images?.[0]?.url || undefined
	};
}
