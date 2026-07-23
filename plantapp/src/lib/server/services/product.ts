import { eq, and, ilike, or, desc, asc, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { FileService } from './file';
import { sanitizeLike } from '$lib/utils/string';

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
	reservedQuantity: number;
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
		fileId: string;
		url: string;
		altText: string | null;
		sortOrder: number;
		isMain: boolean;
		isMock?: boolean;
		caption?: string | null;
		role?: 'primary' | 'gallery' | 'diagram' | 'manual';
	}>;
	catalogDataClass?: 'verified' | 'research' | 'mock_test';
	catalogDisclosure?: string | null;
	catalogCategories?: Array<{ id: number; name: string; slug: string }>;
	catalogTags?: Array<{ slug: string; name: string }>;
	manufacturers?: Array<{
		name: string;
		status: 'unverified' | 'verified' | 'retired';
		websiteUrl: string | null;
	}>;
	contentAreas?: Array<{ slug: string; name: string }>;
	facets?: Array<{ key: string; name: string; value: string }>;
	guides?: Array<{
		slug: string;
		title: string;
		type: 'guide' | 'faq' | 'recommended' | 'required' | 'mentioned';
	}>;
}

function publicProductImageUrl(file: table.File | null, productId: number): string | null {
	if (
		!file ||
		!file.isPublic ||
		file.entityType !== 'product' ||
		file.entityId !== String(productId)
	) {
		return null;
	}

	return FileService.generatePublicUrl(file.bucketPath, true);
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
	fileId: string;
	url?: string; // This will be populated by joining with files or generating URL
	altText: string | null;
	sortOrder: number;
	isMain: boolean;
}

export interface ProductFilter {
	categoryId?: number;
	categoryIds?: number[];
	categorySlug?: string;
	search?: string;
	tag?: string;
	featured?: boolean;
	limit?: number;
	offset?: number;
	sortBy?: 'name' | 'price' | 'created';
	sortOrder?: 'asc' | 'desc';
}

export interface AdminProductFilter {
	limit?: number;
	offset?: number;
	search?: string;
	categoryId?: number;
	isActive?: boolean;
}

export interface CategoryParams {
	name: string;
	slug: string;
	description?: string;
	parentId?: number;
	sortOrder?: number;
}

type CatalogMetadata = Pick<
	ProductWithImages,
	| 'catalogDataClass'
	| 'catalogDisclosure'
	| 'catalogCategories'
	| 'catalogTags'
	| 'manufacturers'
	| 'contentAreas'
	| 'facets'
	| 'guides'
>;

const emptyCatalogMetadata = (): CatalogMetadata => ({
	catalogDataClass: 'research',
	catalogDisclosure: 'Catalogue metadata is being reviewed.',
	catalogCategories: [],
	catalogTags: [],
	manufacturers: [],
	contentAreas: [],
	facets: [],
	guides: []
});

async function enrichCatalogMetadata(
	products: Array<ProductWithImages>
): Promise<Array<ProductWithImages>> {
	if (!products.length) return products;
	const productIds = products.map((product) => product.id);

	try {
		const [profiles, categories, tags, manufacturers, areas, facets, guides] = await Promise.all([
			db
				.select({
					productId: table.productCatalogProfile.productId,
					dataClass: table.productCatalogProfile.dataClass,
					disclosure: table.productCatalogProfile.disclosure
				})
				.from(table.productCatalogProfile)
				.where(inArray(table.productCatalogProfile.productId, productIds)),
			db
				.select({
					productId: table.productCategoryAssignment.productId,
					id: table.productCategory.id,
					name: table.productCategory.name,
					slug: table.productCategory.slug
				})
				.from(table.productCategoryAssignment)
				.innerJoin(
					table.productCategory,
					eq(table.productCategoryAssignment.categoryId, table.productCategory.id)
				)
				.where(inArray(table.productCategoryAssignment.productId, productIds))
				.orderBy(asc(table.productCategoryAssignment.sortOrder)),
			db
				.select({
					productId: table.productTag.productId,
					slug: table.catalogTag.slug,
					name: table.catalogTag.name
				})
				.from(table.productTag)
				.innerJoin(table.catalogTag, eq(table.productTag.tagId, table.catalogTag.id))
				.where(inArray(table.productTag.productId, productIds))
				.orderBy(asc(table.catalogTag.name)),
			db
				.select({
					productId: table.productManufacturer.productId,
					name: table.catalogManufacturer.name,
					status: table.catalogManufacturer.verificationStatus,
					websiteUrl: table.catalogManufacturer.websiteUrl
				})
				.from(table.productManufacturer)
				.innerJoin(
					table.catalogManufacturer,
					eq(table.productManufacturer.manufacturerId, table.catalogManufacturer.id)
				)
				.where(inArray(table.productManufacturer.productId, productIds))
				.orderBy(asc(table.productManufacturer.sortOrder)),
			db
				.select({
					productId: table.productContentArea.productId,
					slug: table.catalogContentArea.slug,
					name: table.catalogContentArea.name
				})
				.from(table.productContentArea)
				.innerJoin(
					table.catalogContentArea,
					eq(table.productContentArea.contentAreaId, table.catalogContentArea.id)
				)
				.where(inArray(table.productContentArea.productId, productIds))
				.orderBy(asc(table.catalogContentArea.sortOrder)),
			db
				.select({
					productId: table.productAttributeValue.productId,
					key: table.catalogAttribute.slug,
					name: table.catalogAttribute.name,
					optionName: table.catalogAttributeOption.name,
					textValue: table.productAttributeValue.textValue,
					numberValue: table.productAttributeValue.numberValue,
					booleanValue: table.productAttributeValue.booleanValue
				})
				.from(table.productAttributeValue)
				.innerJoin(
					table.catalogAttribute,
					eq(table.productAttributeValue.attributeId, table.catalogAttribute.id)
				)
				.leftJoin(
					table.catalogAttributeOption,
					eq(table.productAttributeValue.optionId, table.catalogAttributeOption.id)
				)
				.where(inArray(table.productAttributeValue.productId, productIds))
				.orderBy(asc(table.catalogAttribute.sortOrder)),
			db
				.select({
					productId: table.productContentLink.productId,
					slug: table.contentPage.slug,
					title: table.contentPage.title,
					relationship: table.productContentLink.relationship
				})
				.from(table.productContentLink)
				.innerJoin(
					table.contentPage,
					eq(table.productContentLink.contentPageId, table.contentPage.id)
				)
				.where(inArray(table.productContentLink.productId, productIds))
				.orderBy(asc(table.productContentLink.sortOrder))
		]);

		const byProduct = new Map<number, CatalogMetadata>();
		for (const productId of productIds) byProduct.set(productId, emptyCatalogMetadata());
		for (const profile of profiles) {
			const metadata = byProduct.get(profile.productId);
			if (metadata) {
				metadata.catalogDataClass = profile.dataClass;
				metadata.catalogDisclosure = profile.disclosure;
			}
		}
		for (const row of categories) byProduct.get(row.productId)?.catalogCategories?.push(row);
		for (const row of tags) byProduct.get(row.productId)?.catalogTags?.push(row);
		for (const row of manufacturers) byProduct.get(row.productId)?.manufacturers?.push(row);
		for (const row of areas) byProduct.get(row.productId)?.contentAreas?.push(row);
		for (const row of facets) {
			const value =
				row.optionName ??
				row.textValue ??
				(row.numberValue == null ? null : String(row.numberValue)) ??
				(row.booleanValue == null ? null : String(row.booleanValue));
			if (value != null)
				byProduct.get(row.productId)?.facets?.push({ key: row.key, name: row.name, value });
		}
		for (const row of guides)
			byProduct
				.get(row.productId)
				?.guides?.push({ slug: row.slug, title: row.title, type: row.relationship });
		return products.map((product) => ({ ...product, ...byProduct.get(product.id) }));
	} catch (cause) {
		const isMissingTable =
			cause && typeof cause === 'object' && 'code' in cause && cause.code === '42P01';
		const isLegacyMockDb = cause instanceof TypeError && /not a function/.test(cause.message);
		if (isMissingTable || isLegacyMockDb) {
			return products;
		}
		throw cause;
	}
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
			.where(or(eq(table.product.slug, params.slug), eq(table.product.sku, params.sku)))
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
	static async updateProduct(
		productId: number,
		params: UpdateProductParams
	): Promise<table.Product> {
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
		Object.keys(params).forEach((key) => {
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

		// Get product images with file information
		const images = await db
			.select({
				image: table.productImage,
				file: table.file
			})
			.from(table.productImage)
			.leftJoin(table.file, eq(table.productImage.fileId, table.file.id))
			.where(eq(table.productImage.productId, productId))
			.orderBy(asc(table.productImage.sortOrder));

		const hydrated: ProductWithImages = {
			...product,
			dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
			tags: product.tags ? JSON.parse(product.tags) : null,
			category: {
				id: category.id,
				name: category.name,
				slug: category.slug,
				description: category.description
			},
			images: images.flatMap(({ image, file }) => {
				const url = publicProductImageUrl(file, productId);
				return url
					? [
							{
								id: image.id,
								fileId: image.fileId,
								url,
								altText: image.altText,
								sortOrder: image.sortOrder,
								isMain: image.isMain,
								isMock: file?.bucketPath.startsWith('AI-MockAssets/')
							}
						]
					: [];
			})
		};
		const [enriched] = await enrichCatalogMetadata([hydrated]);
		return enriched;
	}

	/**
	 * Get product by slug
	 */
	static async getProductBySlug(slug: string): Promise<ProductWithImages | null> {
		const productResult = await db
			.select()
			.from(table.product)
			.where(and(eq(table.product.slug, slug), eq(table.product.isActive, true)))
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
		fileId: string,
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

		await this.assertPublicProductFile(fileId, productId);

		// If this is the main image, unset other main images
		if (isMain) {
			await db
				.update(table.productImage)
				.set({ isMain: false })
				.where(
					and(eq(table.productImage.productId, productId), eq(table.productImage.isMain, true))
				);
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
			fileId,
			altText: altText || null,
			sortOrder,
			isMain
		};

		const [image] = await db.insert(table.productImage).values(imageData).returning();

		return {
			id: image.id,
			fileId: image.fileId,
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
			fileId?: string;
			altText?: string;
			isMain?: boolean;
			sortOrder?: number;
		}
	): Promise<ProductImage> {
		let existingImage: typeof table.productImage.$inferSelect | undefined;
		if (updates.isMain || updates.fileId) {
			const imageResult = await db
				.select()
				.from(table.productImage)
				.where(eq(table.productImage.id, imageId))
				.limit(1);

			existingImage = imageResult[0];
			if (!existingImage) {
				throw new Error('Image not found');
			}

			if (updates.fileId) {
				await this.assertPublicProductFile(updates.fileId, existingImage.productId);
			}

			if (updates.isMain) {
				await db
					.update(table.productImage)
					.set({ isMain: false })
					.where(
						and(
							eq(table.productImage.productId, existingImage.productId),
							eq(table.productImage.isMain, true)
						)
					);
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
			fileId: updatedImage.fileId,
			altText: updatedImage.altText,
			sortOrder: updatedImage.sortOrder,
			isMain: updatedImage.isMain
		};
	}

	/**
	 * Get low stock products
	 */
	static async getLowStockProducts(threshold: number = 10): Promise<
		Array<{
			id: number;
			name: string;
			sku: string;
			stockQuantity: number;
			price: string;
		}>
	> {
		const products = await db
			.select({
				id: table.product.id,
				name: table.product.name,
				sku: table.product.sku,
				stockQuantity: table.product.stockQuantity,
				price: table.product.price
			})
			.from(table.product)
			.where(
				and(
					eq(table.product.isActive, true),
					eq(table.product.trackInventory, true)
					// Note: Would use lt() for less than comparison, but using a workaround
				)
			);

		// Filter in JavaScript for now (could be optimized with SQL function)
		return products.filter((product) => product.stockQuantity <= threshold);
	}

	/**
	 * Get featured products
	 */
	static async getFeaturedProducts(limit: number = 10): Promise<
		Array<{
			id: number;
			name: string;
			slug: string;
			price: string;
			shortDescription: string | null;
			mainImage: string | null;
		}>
	> {
		const products = await db
			.select({
				product: table.product,
				image: table.productImage,
				file: table.file
			})
			.from(table.product)
			.leftJoin(
				table.productImage,
				and(eq(table.product.id, table.productImage.productId), eq(table.productImage.isMain, true))
			)
			.leftJoin(table.file, eq(table.productImage.fileId, table.file.id))
			.where(and(eq(table.product.isActive, true), eq(table.product.isFeatured, true)))
			.orderBy(desc(table.product.updatedAt))
			.limit(limit);

		return products.map(({ product, image, file }) => ({
			id: product.id,
			name: product.name,
			slug: product.slug,
			price: product.price,
			shortDescription: product.shortDescription,
			mainImage: publicProductImageUrl(file, product.id)
		}));
	}

	/**
	 * Get categories (public)
	 */
	static async getCategories() {
		return await db
			.select()
			.from(table.productCategory)
			.where(eq(table.productCategory.isActive, true))
			.orderBy(asc(table.productCategory.sortOrder), asc(table.productCategory.name));
	}

	/**
	 * Get all categories (admin)
	 */
	static async getAllCategories() {
		return await db
			.select()
			.from(table.productCategory)
			.orderBy(asc(table.productCategory.sortOrder), asc(table.productCategory.name));
	}

	/**
	 * Get products with filtering and pagination
	 */
	static async getProducts(filter: ProductFilter): Promise<
		Array<{
			product: table.Product & { images?: Array<{ url: string; altText: string | null }> };
			category: {
				id: number;
				name: string;
				slug: string;
			};
		}>
	> {
		const {
			categoryId,
			categoryIds,
			categorySlug,
			search,
			tag,
			featured,
			limit = 20,
			offset = 0,
			sortBy = 'created',
			sortOrder = 'desc'
		} = filter;

		// Build all conditions
		const conditions = [eq(table.product.isActive, true), eq(table.productCategory.isActive, true)];

		if (categorySlug) {
			const [category] = await db
				.select({ id: table.productCategory.id })
				.from(table.productCategory)
				.where(eq(table.productCategory.slug, categorySlug))
				.limit(1);
			if (!category) return [];
			try {
				const matching = await db
					.select({ productId: table.productCategoryAssignment.productId })
					.from(table.productCategoryAssignment)
					.where(eq(table.productCategoryAssignment.categoryId, category.id));
				const matchingIds = matching.map((row) => row.productId);
				if (!matchingIds.length) return [];
				conditions.push(inArray(table.product.id, matchingIds));
			} catch (cause) {
				if (!(cause && typeof cause === 'object' && 'code' in cause && cause.code === '42P01'))
					throw cause;
				conditions.push(eq(table.product.categoryId, category.id));
			}
		} else if (categoryIds && categoryIds.length > 0) {
			conditions.push(inArray(table.product.categoryId, categoryIds));
		} else if (categoryId) {
			conditions.push(eq(table.product.categoryId, categoryId));
		}

		if (search) {
			conditions.push(ilike(table.product.name, `%${sanitizeLike(search)}%`));
		}

		if (tag) {
			try {
				const matching = await db
					.select({ productId: table.productTag.productId })
					.from(table.productTag)
					.innerJoin(table.catalogTag, eq(table.productTag.tagId, table.catalogTag.id))
					.where(eq(table.catalogTag.slug, tag));
				const matchingIds = matching.map((row) => row.productId);
				if (!matchingIds.length) return [];
				conditions.push(inArray(table.product.id, matchingIds));
			} catch (cause) {
				if (!(cause && typeof cause === 'object' && 'code' in cause && cause.code === '42P01'))
					throw cause;
				conditions.push(ilike(table.product.tags, `%"${sanitizeLike(tag)}"%`));
			}
		}

		if (featured !== undefined) {
			conditions.push(eq(table.product.isFeatured, featured));
		}

		// Apply sorting
		const sortColumn =
			sortBy === 'name'
				? table.product.name
				: sortBy === 'price'
					? table.product.price
					: table.product.createdAt;

		const rows = await db
			.select({
				product: table.product,
				category: {
					id: table.productCategory.id,
					name: table.productCategory.name,
					slug: table.productCategory.slug
				},
				image: table.productImage,
				file: table.file
			})
			.from(table.product)
			.innerJoin(table.productCategory, eq(table.product.categoryId, table.productCategory.id))
			.leftJoin(
				table.productImage,
				and(eq(table.product.id, table.productImage.productId), eq(table.productImage.isMain, true))
			)
			.leftJoin(table.file, eq(table.productImage.fileId, table.file.id))
			.where(and(...conditions))
			.orderBy(sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn))
			.limit(limit)
			.offset(offset);

		// Attach image data to product
		const mapped = rows.map(({ product, category, image, file }) => {
			const url = publicProductImageUrl(file, product.id);
			return {
				...product,
				category,
				images: url
					? [
							{
								url,
								altText: image?.altText || product.shortDescription,
								isMock: file?.bucketPath.startsWith('AI-MockAssets/')
							}
						]
					: []
			};
		});
		return enrichCatalogMetadata(mapped as ProductWithImages[]).then((products) =>
			products.map((product) => ({ product, category: product.category }))
		);
	}

	/** Return normalized, filterable product tags with a legacy JSON fallback. */
	static async getTags(): Promise<Array<{ slug: string; name: string }>> {
		try {
			return await db
				.select({ slug: table.catalogTag.slug, name: table.catalogTag.name })
				.from(table.catalogTag)
				.where(and(eq(table.catalogTag.isActive, true), eq(table.catalogTag.isFilterable, true)))
				.orderBy(asc(table.catalogTag.name));
		} catch (cause) {
			if (!(cause && typeof cause === 'object' && 'code' in cause && cause.code === '42P01'))
				throw cause;
			const rows = await db.select({ tags: table.product.tags }).from(table.product);
			const tags = new Map<string, { slug: string; name: string }>();
			for (const row of rows) {
				if (!row.tags) continue;
				try {
					for (const value of JSON.parse(row.tags) as unknown[]) {
						if (typeof value !== 'string') continue;
						const slug = value
							.trim()
							.toLowerCase()
							.replace(/[^a-z0-9]+/g, '-');
						if (slug) tags.set(slug, { slug, name: value.trim() });
					}
				} catch {
					// Invalid legacy tags are surfaced by the enrichment preflight, not guessed here.
				}
			}
			return [...tags.values()].sort((left, right) => left.name.localeCompare(right.name));
		}
	}

	/**
	 * Get all products for admin management
	 */
	static async getAllProducts(filter: AdminProductFilter): Promise<
		Array<{
			product: table.Product;
			category: {
				id: number;
				name: string;
			};
		}>
	> {
		const { limit = 50, offset = 0, search, categoryId, isActive } = filter;

		// Apply filters
		const conditions = [];

		if (search) {
			const sanitizedSearch = sanitizeLike(search);
			conditions.push(
				or(
					ilike(table.product.name, `%${sanitizedSearch}%`),
					ilike(table.product.sku, `%${sanitizedSearch}%`)
				)
			);
		}

		if (categoryId) {
			conditions.push(eq(table.product.categoryId, categoryId));
		}

		if (isActive !== undefined) {
			conditions.push(eq(table.product.isActive, isActive));
		}

		const baseQuery = db
			.select({
				product: table.product,
				category: {
					id: table.productCategory.id,
					name: table.productCategory.name
				}
			})
			.from(table.product)
			.innerJoin(table.productCategory, eq(table.product.categoryId, table.productCategory.id));

		return conditions.length > 0
			? await baseQuery
					.where(and(...conditions))
					.orderBy(desc(table.product.updatedAt))
					.limit(limit)
					.offset(offset)
			: await baseQuery.orderBy(desc(table.product.updatedAt)).limit(limit).offset(offset);
	}

	/**
	 * Create product category
	 */
	static async createCategory(params: CategoryParams): Promise<table.ProductCategory> {
		// Check if slug already exists
		const existingCategory = await db
			.select()
			.from(table.productCategory)
			.where(eq(table.productCategory.slug, params.slug))
			.limit(1);

		if (existingCategory.length > 0) {
			throw new Error('Category slug already exists');
		}

		const categoryData: typeof table.productCategory.$inferInsert = {
			...params,
			sortOrder: params.sortOrder || 0,
			isActive: true
		};

		const [category] = await db.insert(table.productCategory).values(categoryData).returning();
		return category;
	}

	/**
	 * Get product images by product ID
	 */
	static async getProductImages(productId: number): Promise<
		Array<{
			id: number;
			url: string | null;
			altText: string | null;
			sortOrder: number;
			isMain: boolean;
			createdAt: Date;
		}>
	> {
		const images = await db
			.select({
				image: table.productImage,
				file: table.file
			})
			.from(table.productImage)
			.leftJoin(table.file, eq(table.productImage.fileId, table.file.id))
			.where(eq(table.productImage.productId, productId))
			.orderBy(asc(table.productImage.sortOrder));

		return images.map(({ image, file }) => ({
			id: image.id,
			url: publicProductImageUrl(file, productId),
			altText: image.altText,
			sortOrder: image.sortOrder,
			isMain: image.isMain,
			createdAt: image.createdAt
		}));
	}

	private static async assertPublicProductFile(fileId: string, productId: number): Promise<void> {
		const [file] = await db.select().from(table.file).where(eq(table.file.id, fileId)).limit(1);

		if (
			!file ||
			!file.isPublic ||
			file.entityType !== 'product' ||
			file.entityId !== String(productId)
		) {
			throw new Error('Product images must reference a public file assigned to this product');
		}
	}
}

export default ProductService;
