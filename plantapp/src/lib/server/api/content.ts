import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, adminProcedure, router } from './trpc';
import { ContentService } from '../services/content';

export const contentRouter = router({
	/**
	 * Get published content pages (public)
	 */
	getPublishedPages: publicProcedure
		.input(
			z.object({
				type: z.enum(['page', 'blog_post', 'guide', 'faq']).optional(),
				limit: z.number().min(1).max(50).default(20),
				offset: z.number().min(0).default(0),
				search: z.string().optional()
			})
		)
		.query(async ({ input }) => {
			try {
				return await ContentService.getPublishedPages(input);
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to retrieve content pages'
				});
			}
		}),

	/**
	 * Get single published page by slug (public)
	 */
	getPage: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input }) => {
			try {
				const page = await ContentService.getPageBySlug(input.slug);
				
				if (!page) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Page not found'
					});
				}

				return page;
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to retrieve page'
				});
			}
		}),

	/**
	 * Create content page (protected - admins and content creators)
	 */
	createPage: protectedProcedure
		.input(
			z.object({
				title: z.string().min(1),
				slug: z.string().min(1),
				content: z.string().optional(),
				excerpt: z.string().optional(),
				type: z.enum(['page', 'blog_post', 'guide', 'faq']).default('page'),
				featuredImageUrl: z.string().optional(),
				metaTitle: z.string().optional(),
				metaDescription: z.string().optional(),
				tags: z.array(z.string()).optional(),
				status: z.enum(['draft', 'published']).default('draft'),
				publishedAt: z.date().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				// Only admins can publish immediately
				const finalStatus = input.status === 'published' && ctx.user.role !== 'admin' 
					? 'draft' 
					: input.status;

				const page = await ContentService.createPage({
					...input,
					status: finalStatus,
					authorId: ctx.user.id
				});
				
				return page;
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to create page'
				});
			}
		}),

	/**
	 * Update content page (protected - author or admin)
	 */
	updatePage: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				title: z.string().min(1).optional(),
				slug: z.string().min(1).optional(),
				content: z.string().optional(),
				excerpt: z.string().optional(),
				type: z.enum(['page', 'blog_post', 'guide', 'faq']).optional(),
				featuredImageUrl: z.string().optional(),
				metaTitle: z.string().optional(),
				metaDescription: z.string().optional(),
				tags: z.array(z.string()).optional(),
				status: z.enum(['draft', 'published', 'archived']).optional(),
				publishedAt: z.date().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const { id, status, ...updateData } = input;

				// Only admins can change status to published
				const finalStatus = status === 'published' && ctx.user.role !== 'admin' 
					? undefined // Don't change status if not admin
					: status;

				const updatedPage = await ContentService.updatePage(
					id,
					{ ...updateData, status: finalStatus },
					ctx.user.id,
					ctx.user.role
				);

				return updatedPage;
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to update page'
				});
			}
		}),

	/**
	 * Delete content page (protected - author or admin)
	 */
	deletePage: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			try {
				await ContentService.deletePage(input.id, ctx.user.id, ctx.user.role);
				return { success: true };
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to delete page'
				});
			}
		}),

	/**
	 * Get user's content pages (protected)
	 */
	getMyPages: protectedProcedure
		.input(
			z.object({
				status: z.enum(['draft', 'published', 'archived']).optional(),
				type: z.enum(['page', 'blog_post', 'guide', 'faq']).optional(),
				limit: z.number().min(1).max(50).default(20),
				offset: z.number().min(0).default(0)
			})
		)
		.query(async ({ ctx, input }) => {
			try {
				return await ContentService.getUserPages({
					...input,
					authorId: ctx.user.id
				});
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to retrieve pages'
				});
			}
		}),

	/**
	 * Get all content pages for admin management
	 */
	getAllPages: adminProcedure
		.input(
			z.object({
				status: z.enum(['draft', 'published', 'archived']).optional(),
				type: z.enum(['page', 'blog_post', 'guide', 'faq']).optional(),
				authorId: z.string().optional(),
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
				search: z.string().optional()
			})
		)
		.query(async ({ input }) => {
			try {
				return await ContentService.getAllPages(input);
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to retrieve pages'
				});
			}
		})
});

export type ContentRouter = typeof contentRouter;
