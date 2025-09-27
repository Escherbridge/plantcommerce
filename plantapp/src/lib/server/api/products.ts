import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, adminProcedure, router } from './trpc';
import { eq, desc, asc, like, and, or, isNotNull } from 'drizzle-orm';
import { db } from '../db';
import * as table from '../db/schema';

export const productsRouter = router({
	/**
	 * Get all product categories (public)
	 */
	getCategories: publicProcedure.query(async () => {
		return await db
			.select()
			.from(table.productCategory)
			.where(eq(table.productCategory.isActive, true))
			.orderBy(asc(table.productCategory.sortOrder), asc(table.productCategory.name));
	}),

	/**
	 * Get products with filtering and pagination (public)
	 */
	getProducts: publicProcedure
		.input(
			z.object({
				categoryId: z.number().optional(),
				search: z.string().optional(),
				featured: z.boolean().optional(),
				limit: z.number().min(1).max(50).default(20),
				offset: z.number().min(0).default(0),
				sortBy: z.enum(['name', 'price', 'created']).default('created'),
				sortOrder: z.enum(['asc', 'desc']).default('desc')
			})
		)
		.query(async ({ input }) => {
			const { categoryId, search, featured, limit, offset, sortBy, sortOrder } = input;

		// Build all conditions
		const conditions = [
			eq(table.product.isActive, true),
			eq(table.productCategory.isActive, true)
		];

		if (categoryId) {
			conditions.push(eq(table.product.categoryId, categoryId));
		}

		if (search) {
			conditions.push(
				like(table.product.name, `%${search}%`)
			);
		}

		if (featured !== undefined) {
			conditions.push(eq(table.product.isFeatured, featured));
		}

		// Apply sorting
		const sortColumn = sortBy === 'name' ? table.product.name : 
						 sortBy === 'price' ? table.product.price : 
						 table.product.createdAt;

		const query = db
			.select({
				product: table.product,
				category: {
					id: table.productCategory.id,
					name: table.productCategory.name,
					slug: table.productCategory.slug
				}
			})
			.from(table.product)
			.innerJoin(table.productCategory, eq(table.product.categoryId, table.productCategory.id))
			.where(and(...conditions))
			.orderBy(sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn))
			.limit(limit)
			.offset(offset);

			return await query;
		}),

	/**
	 * Get single product by slug (public)
	 */
	getProduct: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input }) => {
			const result = await db
				.select({
					product: table.product,
					category: table.productCategory,
					images: table.productImage
				})
				.from(table.product)
				.innerJoin(table.productCategory, eq(table.product.categoryId, table.productCategory.id))
				.leftJoin(table.productImage, eq(table.product.id, table.productImage.productId))
				.where(
					and(
						eq(table.product.slug, input.slug),
						eq(table.product.isActive, true)
					)
				);

			if (result.length === 0) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Product not found'
				});
			}

			// Group images by product
			const product = result[0].product;
			const category = result[0].category;
			const images = result.map(r => r.images).filter(Boolean);

			return {
				...product,
				category,
				images
			};
		}),

	/**
	 * Create product (admin only)
	 */
	createProduct: adminProcedure
		.input(
			z.object({
				name: z.string().min(1),
				slug: z.string().min(1),
				description: z.string().optional(),
				shortDescription: z.string().optional(),
				sku: z.string().min(1),
				price: z.string().regex(/^\d+(\.\d{2})?$/),
				comparePrice: z.string().regex(/^\d+(\.\d{2})?$/).optional(),
				costPrice: z.string().regex(/^\d+(\.\d{2})?$/).optional(),
				stockQuantity: z.number().min(0).default(0),
				trackInventory: z.boolean().default(true),
				weight: z.string().regex(/^\d+(\.\d{2})?$/).optional(),
				dimensions: z.object({
					length: z.number().optional(),
					width: z.number().optional(),
					height: z.number().optional()
				}).optional(),
				categoryId: z.number(),
				tags: z.array(z.string()).optional(),
				metaTitle: z.string().optional(),
				metaDescription: z.string().optional(),
				isFeatured: z.boolean().default(false)
			})
		)
		.mutation(async ({ input }) => {
			const productData: typeof table.product.$inferInsert = {
				...input,
				dimensions: input.dimensions ? JSON.stringify(input.dimensions) : null,
				tags: input.tags ? JSON.stringify(input.tags) : null,
				isActive: true
			};

			try {
				const [product] = await db.insert(table.product).values(productData).returning();
				return product;
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Failed to create product. SKU or slug may already exist.'
				});
			}
		}),

	/**
	 * Update product (admin only)
	 */
	updateProduct: adminProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string().min(1).optional(),
				slug: z.string().min(1).optional(),
				description: z.string().optional(),
				shortDescription: z.string().optional(),
				sku: z.string().min(1).optional(),
				price: z.string().regex(/^\d+(\.\d{2})?$/).optional(),
				comparePrice: z.string().regex(/^\d+(\.\d{2})?$/).optional(),
				costPrice: z.string().regex(/^\d+(\.\d{2})?$/).optional(),
				stockQuantity: z.number().min(0).optional(),
				trackInventory: z.boolean().optional(),
				weight: z.string().regex(/^\d+(\.\d{2})?$/).optional(),
				dimensions: z.object({
					length: z.number().optional(),
					width: z.number().optional(),
					height: z.number().optional()
				}).optional(),
				categoryId: z.number().optional(),
				tags: z.array(z.string()).optional(),
				metaTitle: z.string().optional(),
				metaDescription: z.string().optional(),
				isFeatured: z.boolean().optional(),
				isActive: z.boolean().optional()
			})
		)
		.mutation(async ({ input }) => {
			const { id, dimensions, tags, ...updateData } = input;

			const finalUpdateData = {
				...updateData,
				dimensions: dimensions ? JSON.stringify(dimensions) : undefined,
				tags: tags ? JSON.stringify(tags) : undefined,
				updatedAt: new Date()
			};

			// Remove undefined values
			Object.keys(finalUpdateData).forEach(key => {
				if (finalUpdateData[key as keyof typeof finalUpdateData] === undefined) {
					delete finalUpdateData[key as keyof typeof finalUpdateData];
				}
			});

			try {
				const [product] = await db
					.update(table.product)
					.set(finalUpdateData)
					.where(eq(table.product.id, id))
					.returning();

				if (!product) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Product not found'
					});
				}

				return product;
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Failed to update product'
				});
			}
		}),

	/**
	 * Delete product (admin only)
	 */
	deleteProduct: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input }) => {
			const result = await db
				.delete(table.product)
				.where(eq(table.product.id, input.id))
				.returning();

			if (result.length === 0) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Product not found'
				});
			}

			return { success: true };
		}),

	/**
	 * Create product category (admin only)
	 */
	createCategory: adminProcedure
		.input(
			z.object({
				name: z.string().min(1),
				slug: z.string().min(1),
				description: z.string().optional(),
				parentId: z.number().optional(),
				sortOrder: z.number().default(0)
			})
		)
		.mutation(async ({ input }) => {
			try {
				const [category] = await db.insert(table.productCategory).values({
					...input,
					isActive: true
				}).returning();
				return category;
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Failed to create category. Name or slug may already exist.'
				});
			}
		}),

	/**
	 * Get all categories for admin management
	 */
	getAllCategories: adminProcedure.query(async () => {
		return await db
			.select()
			.from(table.productCategory)
			.orderBy(asc(table.productCategory.sortOrder), asc(table.productCategory.name));
	}),

	/**
	 * Add product image (admin only)
	 */
	addProductImage: adminProcedure
		.input(
			z.object({
				productId: z.number(),
				url: z.string().url(),
				altText: z.string().optional(),
				isMain: z.boolean().default(false),
				sortOrder: z.number().optional()
			})
		)
		.mutation(async ({ input }) => {
			try {
				// Use the ProductService to add the image
				const ProductService = (await import('../services/product')).default;
				const image = await ProductService.addProductImage(
					input.productId,
					input.url,
					input.altText,
					input.isMain,
					input.sortOrder
				);
				return image;
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to add product image'
				});
			}
		}),

	/**
	 * Update product image (admin only)
	 */
	updateProductImage: adminProcedure
		.input(
			z.object({
				imageId: z.number(),
				url: z.string().url().optional(),
				altText: z.string().optional(),
				isMain: z.boolean().optional(),
				sortOrder: z.number().optional()
			})
		)
		.mutation(async ({ input }) => {
			try {
				const { imageId, ...updates } = input;
				const ProductService = (await import('../services/product')).default;
				const image = await ProductService.updateProductImage(imageId, updates);
				return image;
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to update product image'
				});
			}
		}),

	/**
	 * Delete product image (admin only)
	 */
	deleteProductImage: adminProcedure
		.input(z.object({ imageId: z.number() }))
		.mutation(async ({ input }) => {
			try {
				const ProductService = (await import('../services/product')).default;
				await ProductService.deleteProductImage(input.imageId);
				return { success: true };
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to delete product image'
				});
			}
		}),

	/**
	 * Get product images (admin only)
	 */
	getProductImages: adminProcedure
		.input(z.object({ productId: z.number() }))
		.query(async ({ input }) => {
			try {
				const images = await db
					.select()
					.from(table.productImage)
					.where(eq(table.productImage.productId, input.productId))
					.orderBy(asc(table.productImage.sortOrder));

				return images.map(img => ({
					id: img.id,
					url: img.url,
					altText: img.altText,
					sortOrder: img.sortOrder,
					isMain: img.isMain,
					createdAt: img.createdAt
				}));
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to retrieve product images'
				});
			}
		}),

	/**
	 * Get all products for admin management
	 */
	getAllProducts: adminProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
				search: z.string().optional(),
				categoryId: z.number().optional(),
				isActive: z.boolean().optional()
			})
		)
		.query(async ({ input }) => {
			const { limit, offset, search, categoryId, isActive } = input;

			// Apply filters
			const conditions = [];

			if (search) {
				conditions.push(
					or(
						like(table.product.name, `%${search}%`),
						like(table.product.sku, `%${search}%`)
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
				: await baseQuery
					.orderBy(desc(table.product.updatedAt))
					.limit(limit)
					.offset(offset);
		})
});

export type ProductsRouter = typeof productsRouter;
