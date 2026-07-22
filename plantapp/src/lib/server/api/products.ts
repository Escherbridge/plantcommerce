import { z } from 'zod';
import { publicProcedure, adminProcedure, router } from './trpc';
import { getCommerceAdapter } from '../commerce/adapter';

export const productsRouter = router({
	getCatalogAvailability: publicProcedure.query(async ({ ctx }) => {
		const adapter = await getCommerceAdapter(ctx.event);
		return { status: 'available' as const, reason: null, commerce: adapter.context };
	}),

	getCategories: publicProcedure.query(async ({ ctx }) => {
		const adapter = await getCommerceAdapter(ctx.event);
		return adapter.getCategories();
	}),

	getProducts: publicProcedure
		.input(
			z.object({
				categoryId: z.number().optional(),
				categoryIds: z.array(z.number()).optional(),
				categorySlug: z.string().optional(),
				search: z.string().optional(),
				featured: z.boolean().optional(),
				limit: z.number().min(1).max(50).default(20),
				offset: z.number().min(0).default(0),
				sortBy: z.enum(['name', 'price', 'created']).default('created'),
				sortOrder: z.enum(['asc', 'desc']).default('desc')
			})
		)
		.query(async ({ ctx, input }) => {
			const adapter = await getCommerceAdapter(ctx.event);
			let categorySlug = input.categorySlug;
			if (!categorySlug && input.categoryId) {
				const categories = await adapter.getCategories();
				categorySlug = categories.find((category) =>
					category.id.endsWith(`:${input.categoryId}`)
				)?.slug;
			}
			const categoryIds = input.categoryIds?.length
				? input.categoryIds
				: input.categoryId
					? [input.categoryId]
					: undefined;
			return adapter.getProducts({ ...input, categorySlug, categoryIds });
		}),

	getProduct: publicProcedure
		.input(z.object({ slug: z.string(), categorySlug: z.string().optional() }))
		.query(async ({ ctx, input }) => {
			const adapter = await getCommerceAdapter(ctx.event);
			if (input.categorySlug) return adapter.getProduct(input.categorySlug, input.slug);
			const categories = await adapter.getCategories();
			for (const category of categories) {
				const product = await adapter.getProduct(category.slug, input.slug);
				if (product) return product;
			}
			return null;
		}),

	createProduct: adminProcedure
		.input(
			z.object({
				name: z.string().min(1),
				slug: z.string().min(1),
				description: z.string().optional(),
				shortDescription: z.string().optional(),
				sku: z.string().min(1),
				price: z.string().regex(/^\d+(\.\d{2})?$/),
				comparePrice: z
					.string()
					.regex(/^\d+(\.\d{2})?$/)
					.optional(),
				costPrice: z
					.string()
					.regex(/^\d+(\.\d{2})?$/)
					.optional(),
				stockQuantity: z.number().min(0).default(0),
				trackInventory: z.boolean().default(true),
				weight: z
					.string()
					.regex(/^\d+(\.\d{2})?$/)
					.optional(),
				dimensions: z
					.object({
						length: z.number().optional(),
						width: z.number().optional(),
						height: z.number().optional()
					})
					.optional(),
				categoryId: z.number(),
				tags: z.array(z.string()).optional(),
				metaTitle: z.string().optional(),
				metaDescription: z.string().optional(),
				isFeatured: z.boolean().default(false)
			})
		)
		.mutation(async ({ ctx, input }) => {
			const [{ ProductService }, { AuditLogService }] = await Promise.all([
				import('../services/product'),
				import('../services/auditLog')
			]);
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
				price: z
					.string()
					.regex(/^\d+(\.\d{2})?$/)
					.optional(),
				comparePrice: z
					.string()
					.regex(/^\d+(\.\d{2})?$/)
					.optional(),
				costPrice: z
					.string()
					.regex(/^\d+(\.\d{2})?$/)
					.optional(),
				stockQuantity: z.number().min(0).optional(),
				trackInventory: z.boolean().optional(),
				weight: z
					.string()
					.regex(/^\d+(\.\d{2})?$/)
					.optional(),
				dimensions: z
					.object({
						length: z.number().optional(),
						width: z.number().optional(),
						height: z.number().optional()
					})
					.optional(),
				categoryId: z.number().optional(),
				tags: z.array(z.string()).optional(),
				metaTitle: z.string().optional(),
				metaDescription: z.string().optional(),
				isFeatured: z.boolean().optional(),
				isActive: z.boolean().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const [{ ProductService }, { AuditLogService }] = await Promise.all([
				import('../services/product'),
				import('../services/auditLog')
			]);
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
			const [{ ProductService }, { AuditLogService }] = await Promise.all([
				import('../services/product'),
				import('../services/auditLog')
			]);
			await ProductService.deleteProduct(input.id);
			await AuditLogService.log(ctx.user.id, 'delete_product', { productId: input.id });
			return { success: true };
		}),

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
		.mutation(async ({ input }) =>
			(await import('../services/product')).ProductService.createCategory(input)
		),

	getAllCategories: adminProcedure.query(async () =>
		(await import('../services/product')).ProductService.getAllCategories()
	),

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
		.mutation(async ({ input }) =>
			(await import('../services/product')).ProductService.addProductImage(
				input.productId,
				input.fileId,
				input.altText,
				input.isMain,
				input.sortOrder
			)
		),

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
			const { imageId, ...updates } = input;
			return (await import('../services/product')).ProductService.updateProductImage(
				imageId,
				updates
			);
		}),

	deleteProductImage: adminProcedure
		.input(z.object({ imageId: z.number() }))
		.mutation(async ({ input }) =>
			(await import('../services/product')).ProductService.deleteProductImage(input.imageId).then(
				() => ({ success: true })
			)
		),

	getProductImages: adminProcedure
		.input(z.object({ productId: z.number() }))
		.query(async ({ input }) =>
			(await import('../services/product')).ProductService.getProductImages(input.productId)
		),

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
		.query(async ({ input }) =>
			(await import('../services/product')).ProductService.getAllProducts(input)
		)
});

export type ProductsRouter = typeof productsRouter;
