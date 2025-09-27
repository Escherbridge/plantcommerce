import { eq, and, like, or, desc, asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

export interface ProductWithImages {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	shortDescription: string | null;
	sku: string;
	price: string;
	comparePrice: string | null;
	costPrice: string | null;
	stockQuantity: number;
	trackInventory: boolean;
	weight: string | null;
	dimensions: any;
	categoryId: number;
	isActive: boolean;
	isFeatured: boolean;
	tags: any;
	metaTitle: string | null;
	metaDescription: string | null;
	createdAt: Date;
	updatedAt: Date;
	category: {
		id: number;
		name: string;
		slug: string;
		description: string | null;
	};
	images: Array<{
		id: number;
		url: string;
		altText: string | null;
		sortOrder: number;
		isMain: boolean;
	}>;
}

export interface CreateProductParams {
	name: string;
	slug: string;
	description?: string;
	shortDescription?: string;
	sku: string;
	price: string;
	comparePrice?: string;
	costPrice?: string;
	stockQuantity?: number;
	trackInventory?: boolean;
	weight?: string;
	dimensions?: {
		length?: number;
		width?: number;
		height?: number;
	};
	categoryId: number;
	tags?: string[];
	metaTitle?: string;
	metaDescription?: string;
	isFeatured?: boolean;
}

export interface UpdateProductParams {
	name?: string;
	slug?: string;
	description?: string;
	shortDescription?: string;
	sku?: string;
	price?: string;
	comparePrice?: string;
	costPrice?: string;
	stockQuantity?: number;
	trackInventory?: boolean;
	weight?: string;
	dimensions?: {
		length?: number;
		width?: number;
		height?: number;
	};
	categoryId?: number;
	tags?: string[];
	metaTitle?: string;
	metaDescription?: string;
	isFeatured?: boolean;
	isActive?: boolean;
}

export interface ProductImage {
	id: number;
	url: string;
	altText: string | null;
	sortOrder: number;
	isMain: boolean;
}

export class ProductService {
	/**
	 * Create new product
	 */
	static async createProduct(params: CreateProductParams): Promise<table.Product> {
		// Check if slug or SKU already exists
		const existingProduct = await db
			.select()
			.from(table.product)
			.where(
				or(
					eq(table.product.slug, params.slug),
					eq(table.product.sku, params.sku)
				)
			)
			.limit(1);

		if (existingProduct.length > 0) {
			if (existingProduct[0].slug === params.slug) {
				throw new Error('Slug already exists');
			}
			if (existingProduct[0].sku === params.sku) {
				throw new Error('SKU already exists');
			}
		}

		// Verify category exists
		const categoryResult = await db
			.select()
			.from(table.productCategory)
			.where(eq(table.productCategory.id, params.categoryId))
			.limit(1);

		if (categoryResult.length === 0) {
			throw new Error('Category not found');
		}

		const productData: typeof table.product.$inferInsert = {
			name: params.name,
			slug: params.slug,
			description: params.description || null,
			shortDescription: params.shortDescription || null,
			sku: params.sku,
			price: params.price,
			comparePrice: params.comparePrice || null,
			costPrice: params.costPrice || null,
			stockQuantity: params.stockQuantity || 0,
			trackInventory: params.trackInventory || true,
			weight: params.weight || null,
			dimensions: params.dimensions ? JSON.stringify(params.dimensions) : null,
			categoryId: params.categoryId,
			isActive: true,
			isFeatured: params.isFeatured || false,
			tags: params.tags ? JSON.stringify(params.tags) : null,
			metaTitle: params.metaTitle || null,
			metaDescription: params.metaDescription || null
		};

		const [product] = await db.insert(table.product).values(productData).returning();
		return product;
	}

	/**
	 * Update product
	 */
	static async updateProduct(productId: number, params: UpdateProductParams): Promise<table.Product> {
		// Check if new slug or SKU conflicts with existing products
		if (params.slug || params.sku) {
			const conditions = [];
			if (params.slug) conditions.push(eq(table.product.slug, params.slug));
			if (params.sku) conditions.push(eq(table.product.sku, params.sku));

			const existingProduct = await db
				.select()
				.from(table.product)
				.where(or(...conditions))
				.limit(1);

			if (existingProduct.length > 0 && existingProduct[0].id !== productId) {
				if (existingProduct[0].slug === params.slug) {
					throw new Error('Slug already exists');
				}
				if (existingProduct[0].sku === params.sku) {
					throw new Error('SKU already exists');
				}
			}
		}

		// Verify category exists if being updated
		if (params.categoryId) {
			const categoryResult = await db
				.select()
				.from(table.productCategory)
				.where(eq(table.productCategory.id, params.categoryId))
				.limit(1);

			if (categoryResult.length === 0) {
				throw new Error('Category not found');
			}
		}

		// Build update object
		const updateData: Partial<typeof table.product.$inferInsert> = {
			updatedAt: new Date()
		};

		// Copy all defined parameters
		Object.keys(params).forEach(key => {
			const value = params[key as keyof UpdateProductParams];
			if (value !== undefined) {
				if (key === 'dimensions' && value) {
					updateData.dimensions = JSON.stringify(value);
				} else if (key === 'tags' && value) {
					updateData.tags = JSON.stringify(value);
				} else {
					(updateData as any)[key] = value;
				}
			}
		});

		const [updatedProduct] = await db
			.update(table.product)
			.set(updateData)
			.where(eq(table.product.id, productId))
			.returning();

		if (!updatedProduct) {
			throw new Error('Product not found');
		}

		return updatedProduct;
	}

	/**
	 * Get product by ID with full details
	 */
	static async getProductById(productId: number): Promise<ProductWithImages | null> {
		const productResult = await db
			.select({
				product: table.product,
				category: table.productCategory
			})
			.from(table.product)
			.innerJoin(table.productCategory, eq(table.product.categoryId, table.productCategory.id))
			.where(eq(table.product.id, productId))
			.limit(1);

		if (productResult.length === 0) {
			return null;
		}

		const { product, category } = productResult[0];

		// Get product images
		const images = await db
			.select()
			.from(table.productImage)
			.where(eq(table.productImage.productId, productId))
			.orderBy(asc(table.productImage.sortOrder));

		return {
			...product,
			dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
			tags: product.tags ? JSON.parse(product.tags) : null,
			category: {
				id: category.id,
				name: category.name,
				slug: category.slug,
				description: category.description
			},
			images: images.map(img => ({
				id: img.id,
				url: img.url,
				altText: img.altText,
				sortOrder: img.sortOrder,
				isMain: img.isMain
			}))
		};
	}

	/**
	 * Get product by slug
	 */
	static async getProductBySlug(slug: string): Promise<ProductWithImages | null> {
		const productResult = await db
			.select()
			.from(table.product)
			.where(and(
				eq(table.product.slug, slug),
				eq(table.product.isActive, true)
			))
			.limit(1);

		if (productResult.length === 0) {
			return null;
		}

		return await this.getProductById(productResult[0].id);
	}

	/**
	 * Delete product
	 */
	static async deleteProduct(productId: number): Promise<void> {
		// This will cascade delete related records (images, cart items, etc.)
		const result = await db
			.delete(table.product)
			.where(eq(table.product.id, productId))
			.returning();

		if (result.length === 0) {
			throw new Error('Product not found');
		}
	}

	/**
	 * Update product stock
	 */
	static async updateStock(productId: number, quantity: number): Promise<void> {
		const result = await db
			.update(table.product)
			.set({ 
				stockQuantity: quantity,
				updatedAt: new Date()
			})
			.where(eq(table.product.id, productId))
			.returning();

		if (result.length === 0) {
			throw new Error('Product not found');
		}
	}

	/**
	 * Add product image
	 */
	static async addProductImage(
		productId: number,
		url: string,
		altText?: string,
		isMain: boolean = false,
		sortOrder?: number
	): Promise<ProductImage> {
		// Verify product exists
		const productResult = await db
			.select()
			.from(table.product)
			.where(eq(table.product.id, productId))
			.limit(1);

		if (productResult.length === 0) {
			throw new Error('Product not found');
		}

		// If this is the main image, unset other main images
		if (isMain) {
			await db
				.update(table.productImage)
				.set({ isMain: false })
				.where(and(
					eq(table.productImage.productId, productId),
					eq(table.productImage.isMain, true)
				));
		}

		// Get next sort order if not provided
		if (sortOrder === undefined) {
			const lastImage = await db
				.select()
				.from(table.productImage)
				.where(eq(table.productImage.productId, productId))
				.orderBy(desc(table.productImage.sortOrder))
				.limit(1);

			sortOrder = lastImage.length > 0 ? lastImage[0].sortOrder + 1 : 0;
		}

		const imageData: typeof table.productImage.$inferInsert = {
			productId,
			url,
			altText: altText || null,
			sortOrder,
			isMain
		};

		const [image] = await db.insert(table.productImage).values(imageData).returning();

		return {
			id: image.id,
			url: image.url,
			altText: image.altText,
			sortOrder: image.sortOrder,
			isMain: image.isMain
		};
	}

	/**
	 * Delete product image
	 */
	static async deleteProductImage(imageId: number): Promise<void> {
		const result = await db
			.delete(table.productImage)
			.where(eq(table.productImage.id, imageId))
			.returning();

		if (result.length === 0) {
			throw new Error('Image not found');
		}
	}

	/**
	 * Update product image
	 */
	static async updateProductImage(
		imageId: number,
		updates: {
			url?: string;
			altText?: string;
			isMain?: boolean;
			sortOrder?: number;
		}
	): Promise<ProductImage> {
		// If setting as main, unset other main images for the same product
		if (updates.isMain) {
			const imageResult = await db
				.select()
				.from(table.productImage)
				.where(eq(table.productImage.id, imageId))
				.limit(1);

			if (imageResult.length > 0) {
				await db
					.update(table.productImage)
					.set({ isMain: false })
					.where(and(
						eq(table.productImage.productId, imageResult[0].productId),
						eq(table.productImage.isMain, true)
					));
			}
		}

		const [updatedImage] = await db
			.update(table.productImage)
			.set(updates)
			.where(eq(table.productImage.id, imageId))
			.returning();

		if (!updatedImage) {
			throw new Error('Image not found');
		}

		return {
			id: updatedImage.id,
			url: updatedImage.url,
			altText: updatedImage.altText,
			sortOrder: updatedImage.sortOrder,
			isMain: updatedImage.isMain
		};
	}

	/**
	 * Get low stock products
	 */
	static async getLowStockProducts(threshold: number = 10): Promise<Array<{
		id: number;
		name: string;
		sku: string;
		stockQuantity: number;
		price: string;
	}>> {
		const products = await db
			.select({
				id: table.product.id,
				name: table.product.name,
				sku: table.product.sku,
				stockQuantity: table.product.stockQuantity,
				price: table.product.price
			})
			.from(table.product)
			.where(and(
				eq(table.product.isActive, true),
				eq(table.product.trackInventory, true)
				// Note: Would use lt() for less than comparison, but using a workaround
			));

		// Filter in JavaScript for now (could be optimized with SQL function)
		return products.filter(product => product.stockQuantity <= threshold);
	}

	/**
	 * Get featured products
	 */
	static async getFeaturedProducts(limit: number = 10): Promise<Array<{
		id: number;
		name: string;
		slug: string;
		price: string;
		shortDescription: string | null;
		mainImage: string | null;
	}>> {
		const products = await db
			.select({
				product: table.product,
				image: table.productImage
			})
			.from(table.product)
			.leftJoin(table.productImage, and(
				eq(table.product.id, table.productImage.productId),
				eq(table.productImage.isMain, true)
			))
			.where(and(
				eq(table.product.isActive, true),
				eq(table.product.isFeatured, true)
			))
			.orderBy(desc(table.product.updatedAt))
			.limit(limit);

		return products.map(({ product, image }) => ({
			id: product.id,
			name: product.name,
			slug: product.slug,
			price: product.price,
			shortDescription: product.shortDescription,
			mainImage: image?.url || null
		}));
	}
}

export default ProductService;
