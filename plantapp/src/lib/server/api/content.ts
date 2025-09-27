import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, adminProcedure, router } from './trpc';
import { eq, desc, asc, like, and, or } from 'drizzle-orm';
import { db } from '../db';
import * as table from '../db/schema';

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
			const { type, limit, offset, search } = input;

			let query = db
				.select({
					id: table.contentPage.id,
					title: table.contentPage.title,
					slug: table.contentPage.slug,
					excerpt: table.contentPage.excerpt,
					type: table.contentPage.type,
					featuredImageUrl: table.contentPage.featuredImageUrl,
					publishedAt: table.contentPage.publishedAt,
					author: {
						username: table.user.username,
						firstName: table.user.firstName,
						lastName: table.user.lastName
					}
				})
				.from(table.contentPage)
				.innerJoin(table.user, eq(table.contentPage.authorId, table.user.id))
				.where(eq(table.contentPage.status, 'published'));

			// Apply filters
			const conditions = [eq(table.contentPage.status, 'published')];

			if (type) {
				conditions.push(eq(table.contentPage.type, type));
			}

			if (search) {
				conditions.push(
					or(
						like(table.contentPage.title, `%${search}%`),
						like(table.contentPage.excerpt, `%${search}%`)
					)
				);
			}

			query = query.where(and(...conditions));

			query = query
				.orderBy(desc(table.contentPage.publishedAt))
				.limit(limit)
				.offset(offset);

			return await query;
		}),

	/**
	 * Get single published page by slug (public)
	 */
	getPage: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input }) => {
			const result = await db
				.select({
					page: table.contentPage,
					author: {
						username: table.user.username,
						firstName: table.user.firstName,
						lastName: table.user.lastName
					}
				})
				.from(table.contentPage)
				.innerJoin(table.user, eq(table.contentPage.authorId, table.user.id))
				.where(
					and(
						eq(table.contentPage.slug, input.slug),
						eq(table.contentPage.status, 'published')
					)
				)
				.limit(1);

			if (result.length === 0) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Page not found'
				});
			}

			return result[0];
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
			// Only admins can publish immediately
			const finalStatus = input.status === 'published' && ctx.user.role !== 'admin' 
				? 'draft' 
				: input.status;

			const pageData: typeof table.contentPage.$inferInsert = {
				...input,
				status: finalStatus,
				authorId: ctx.user.id,
				tags: input.tags ? JSON.stringify(input.tags) : null,
				publishedAt: finalStatus === 'published' ? (input.publishedAt || new Date()) : null
			};

			try {
				const [page] = await db.insert(table.contentPage).values(pageData).returning();
				return page;
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Failed to create page. Slug may already exist.'
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
			const { id, tags, status, publishedAt, ...updateData } = input;

			// Check if user can edit this page
			const existingPage = await db
				.select()
				.from(table.contentPage)
				.where(eq(table.contentPage.id, id))
				.limit(1);

			if (existingPage.length === 0) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Page not found'
				});
			}

			const page = existingPage[0];

			// Only allow authors to edit their own pages, or admins to edit any
			if (page.authorId !== ctx.user.id && ctx.user.role !== 'admin') {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You can only edit your own pages'
				});
			}

			// Only admins can change status to published
			const finalStatus = status === 'published' && ctx.user.role !== 'admin' 
				? page.status 
				: status;

			const finalUpdateData = {
				...updateData,
				status: finalStatus,
				tags: tags ? JSON.stringify(tags) : undefined,
				publishedAt: finalStatus === 'published' && !page.publishedAt 
					? (publishedAt || new Date()) 
					: publishedAt,
				updatedAt: new Date()
			};

			// Remove undefined values
			Object.keys(finalUpdateData).forEach(key => 
				finalUpdateData[key] === undefined && delete finalUpdateData[key]
			);

			try {
				const [updatedPage] = await db
					.update(table.contentPage)
					.set(finalUpdateData)
					.where(eq(table.contentPage.id, id))
					.returning();

				return updatedPage;
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Failed to update page'
				});
			}
		}),

	/**
	 * Delete content page (protected - author or admin)
	 */
	deletePage: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			// Check if user can delete this page
			const existingPage = await db
				.select()
				.from(table.contentPage)
				.where(eq(table.contentPage.id, input.id))
				.limit(1);

			if (existingPage.length === 0) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Page not found'
				});
			}

			const page = existingPage[0];

			// Only allow authors to delete their own pages, or admins to delete any
			if (page.authorId !== ctx.user.id && ctx.user.role !== 'admin') {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You can only delete your own pages'
				});
			}

			await db.delete(table.contentPage).where(eq(table.contentPage.id, input.id));

			return { success: true };
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
			const { status, type, limit, offset } = input;

			let query = db
				.select()
				.from(table.contentPage)
				.where(eq(table.contentPage.authorId, ctx.user.id));

			// Apply filters
			const conditions = [eq(table.contentPage.authorId, ctx.user.id)];

			if (status) {
				conditions.push(eq(table.contentPage.status, status));
			}

			if (type) {
				conditions.push(eq(table.contentPage.type, type));
			}

			query = query.where(and(...conditions));

			query = query
				.orderBy(desc(table.contentPage.updatedAt))
				.limit(limit)
				.offset(offset);

			return await query;
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
			const { status, type, authorId, limit, offset, search } = input;

			let query = db
				.select({
					page: table.contentPage,
					author: {
						username: table.user.username,
						firstName: table.user.firstName,
						lastName: table.user.lastName
					}
				})
				.from(table.contentPage)
				.innerJoin(table.user, eq(table.contentPage.authorId, table.user.id));

			// Apply filters
			const conditions = [];

			if (status) {
				conditions.push(eq(table.contentPage.status, status));
			}

			if (type) {
				conditions.push(eq(table.contentPage.type, type));
			}

			if (authorId) {
				conditions.push(eq(table.contentPage.authorId, authorId));
			}

			if (search) {
				conditions.push(
					or(
						like(table.contentPage.title, `%${search}%`),
						like(table.contentPage.excerpt, `%${search}%`)
					)
				);
			}

			if (conditions.length > 0) {
				query = query.where(and(...conditions));
			}

			query = query
				.orderBy(desc(table.contentPage.updatedAt))
				.limit(limit)
				.offset(offset);

			return await query;
		})
});

export type ContentRouter = typeof contentRouter;
