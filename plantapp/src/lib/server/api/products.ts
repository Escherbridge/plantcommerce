import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, adminProcedure, router } from './trpc';
import { ProductService } from '../services/product';

export const productsRouter = router({
	/**
	 * Get all product categories (public)
	 */
	getCategories: publicProcedure.query(async () => {
		try {
			return await ProductService.getCategories();
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to retrieve categories'
			});
		}
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
			try {
				return await ProductService.getProducts(input);
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to retrieve products'
				});
			}
		}),

	/**
	 * Get single product by slug (public)
	 */
	getProduct: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input }) => {
			try {
				const product = await ProductService.getProductBySlug(input.slug);
				
				if (!product) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Product not found'
					});
				}

				return product;
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to retrieve product'
				});
			}
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
import { AuditLogService } from '../services/auditLog';

// ...

		.mutation(async ({ ctx, input }) => {
			try {
				const product = await ProductService.createProduct(input);
				// Audit log
				await AuditLogService.log(ctx.user.id, 'create_product', { productId: product.id, productName: product.name });
				return product;
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to create product'
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
		.mutation(async ({ ctx, input }) => {
			try {
				const { id, ...updateData } = input;
				const product = await ProductService.updateProduct(id, updateData);
				// Audit log
				await AuditLogService.log(ctx.user.id, 'update_product', { productId: product.id, productName: product.name });
				return product;
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to update product'
				});
			}
		}),

	/**
	 * Delete product (admin only)
	 */
	deleteProduct: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			try {
				await ProductService.deleteProduct(input.id);
				// Audit log
				await AuditLogService.log(ctx.user.id, 'delete_product', { productId: input.id });
				return { success: true };
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to delete product'
				});
			}
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
				const category = await ProductService.createCategory(input);
				return category;
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to create category'
				});
			}
		}),

	/**
	 * Get all categories for admin management
	 */
	getAllCategories: adminProcedure.query(async () => {
		try {
			return await ProductService.getAllCategories();
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to retrieve categories'
			});
		}
	}),

	/**
	 * Add product image (admin only)
	 */
	addProductImage: adminProcedure
		.input(
			z.object({
				productId: z.number(),
				fileId: z.string().uuid(),
				altText: z.string().optional(),
				isMain: z.boolean().default(false),
				sortOrder: z.number().optional()
			})
		)
		.mutation(async ({ input }) => {
			try {
				const image = await ProductService.addProductImage(
					input.productId,
					input.fileId,
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
				fileId: z.string().uuid().optional(),
				altText: z.string().optional(),
				isMain: z.boolean().optional(),
				sortOrder: z.number().optional()
			})
		)
		.mutation(async ({ input }) => {
			try {
				const { imageId, ...updates } = input;
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
				return await ProductService.getProductImages(input.productId);
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
			try {
				return await ProductService.getAllProducts(input);
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to retrieve products'
				});
			}
		})
});

export type ProductsRouter = typeof productsRouter;
