import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, adminProcedure, router } from './trpc';
import { ProductService } from '../services/product';
import { AuditLogService } from '../services/auditLog';

export const productsRouter = router({
	getCategories: publicProcedure.query(() => ProductService.getCategories()),

	getProducts: publicProcedure
		.input(z.object({
			categoryId: z.number().optional(),
			search: z.string().optional(),
			featured: z.boolean().optional(),
			limit: z.number().min(1).max(50).default(20),
			offset: z.number().min(0).default(0),
			sortBy: z.enum(['name', 'price', 'created']).default('created'),
			sortOrder: z.enum(['asc', 'desc']).default('desc')
		}))
		.query(({ input }) => ProductService.getProducts(input)),

	getProduct: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input }) => {
			const product = await ProductService.getProductBySlug(input.slug);
			if (!product) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
			}
			return product;
		}),

	createProduct: adminProcedure
		.input(z.object({
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
		}))
		.mutation(async ({ ctx, input }) => {
			const product = await ProductService.createProduct(input);
			await AuditLogService.log(ctx.user.id, 'create_product', { 
				productId: product.id, 
				productName: product.name 
			});
			return product;
		}),

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
			const { id, ...updateData } = input;
			const product = await ProductService.updateProduct(id, updateData);
			await AuditLogService.log(ctx.user.id, 'update_product', { 
				productId: product.id, 
				productName: product.name 
			});
			return product;
		}),

	deleteProduct: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			await ProductService.deleteProduct(input.id);
			await AuditLogService.log(ctx.user.id, 'delete_product', { productId: input.id });
			return { success: true };
		}),

	createCategory: adminProcedure
		.input(z.object({
			name: z.string().min(1),
			slug: z.string().min(1),
			description: z.string().optional(),
			parentId: z.number().optional(),
			sortOrder: z.number().default(0)
		}))
		.mutation(({ input }) => ProductService.createCategory(input)),

	getAllCategories: adminProcedure.query(() => ProductService.getAllCategories()),

	addProductImage: adminProcedure
		.input(z.object({
			productId: z.number(),
			fileId: z.string().uuid(),
			altText: z.string().optional(),
			isMain: z.boolean().default(false),
			sortOrder: z.number().optional()
		}))
		.mutation(({ input }) => ProductService.addProductImage(
			input.productId,
			input.fileId,
			input.altText,
			input.isMain,
			input.sortOrder
		)),

	updateProductImage: adminProcedure
		.input(z.object({
			imageId: z.number(),
			fileId: z.string().uuid().optional(),
			altText: z.string().optional(),
			isMain: z.boolean().optional(),
			sortOrder: z.number().optional()
		}))
		.mutation(({ input }) => {
			const { imageId, ...updates } = input;
			return ProductService.updateProductImage(imageId, updates);
		}),

	deleteProductImage: adminProcedure
		.input(z.object({ imageId: z.number() }))
		.mutation(({ input }) => ProductService.deleteProductImage(input.imageId).then(() => ({ success: true }))),

	getProductImages: adminProcedure
		.input(z.object({ productId: z.number() }))
		.query(({ input }) => ProductService.getProductImages(input.productId)),

	getAllProducts: adminProcedure
		.input(z.object({
			limit: z.number().min(1).max(100).default(50),
			offset: z.number().min(0).default(0),
			search: z.string().optional(),
			categoryId: z.number().optional(),
			isActive: z.boolean().optional()
		}))
		.query(({ input }) => ProductService.getAllProducts(input))
});

export type ProductsRouter = typeof productsRouter;
