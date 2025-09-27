import { eq, desc, asc, like, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

export interface CreateContentParams {
	title: string;
	slug: string;
	content?: string;
	excerpt?: string;
	type: 'page' | 'blog_post' | 'guide' | 'faq';
	featuredImageUrl?: string;
	metaTitle?: string;
	metaDescription?: string;
	tags?: string[];
	status: 'draft' | 'published';
	publishedAt?: Date;
	authorId: string;
}

export interface UpdateContentParams {
	title?: string;
	slug?: string;
	content?: string;
	excerpt?: string;
	type?: 'page' | 'blog_post' | 'guide' | 'faq';
	featuredImageUrl?: string;
	metaTitle?: string;
	metaDescription?: string;
	tags?: string[];
	status?: 'draft' | 'published' | 'archived';
	publishedAt?: Date;
}

export interface ContentFilter {
	type?: 'page' | 'blog_post' | 'guide' | 'faq';
	limit?: number;
	offset?: number;
	search?: string;
}

export interface AdminContentFilter extends ContentFilter {
	status?: 'draft' | 'published' | 'archived';
	authorId?: string;
}

export interface UserContentFilter {
	authorId: string;
	status?: 'draft' | 'published' | 'archived';
	type?: 'page' | 'blog_post' | 'guide' | 'faq';
	limit?: number;
	offset?: number;
}

export class ContentService {
	/**
	 * Get published content pages (public)
	 */
	static async getPublishedPages(filter: ContentFilter) {
		const { type, limit = 20, offset = 0, search } = filter;

		// Apply filters
		const conditions = [eq(table.contentPage.status, 'published')];

		if (type) {
			conditions.push(eq(table.contentPage.type, type));
		}

		if (search) {
			conditions.push(
				like(table.contentPage.title, `%${search}%`)
			);
		}

		return await db
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
			.where(and(...conditions))
			.orderBy(desc(table.contentPage.publishedAt))
			.limit(limit)
			.offset(offset);
	}

	/**
	 * Get single published page by slug (public)
	 */
	static async getPageBySlug(slug: string) {
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
					eq(table.contentPage.slug, slug),
					eq(table.contentPage.status, 'published')
				)
			)
			.limit(1);

		if (result.length === 0) {
			return null;
		}

		return result[0];
	}

	/**
	 * Create content page
	 */
	static async createPage(params: CreateContentParams): Promise<table.ContentPage> {
		// Check if slug already exists
		const existingPage = await db
			.select()
			.from(table.contentPage)
			.where(eq(table.contentPage.slug, params.slug))
			.limit(1);

		if (existingPage.length > 0) {
			throw new Error('Slug already exists');
		}

		const pageData: typeof table.contentPage.$inferInsert = {
			...params,
			tags: params.tags ? JSON.stringify(params.tags) : null,
			publishedAt: params.status === 'published' ? (params.publishedAt || new Date()) : null
		};

		const [page] = await db.insert(table.contentPage).values(pageData).returning();
		return page;
	}

	/**
	 * Update content page
	 */
	static async updatePage(pageId: number, params: UpdateContentParams, currentAuthorId: string, userRole: string): Promise<table.ContentPage> {
		// Check if page exists and user has permissions
		const existingPage = await db
			.select()
			.from(table.contentPage)
			.where(eq(table.contentPage.id, pageId))
			.limit(1);

		if (existingPage.length === 0) {
			throw new Error('Page not found');
		}

		const page = existingPage[0];

		// Only allow authors to edit their own pages, or admins to edit any
		if (page.authorId !== currentAuthorId && userRole !== 'admin') {
			throw new Error('You can only edit your own pages');
		}

		// Check for slug conflicts if updating slug
		if (params.slug && params.slug !== page.slug) {
			const slugConflict = await db
				.select()
				.from(table.contentPage)
				.where(eq(table.contentPage.slug, params.slug))
				.limit(1);

			if (slugConflict.length > 0) {
				throw new Error('Slug already exists');
			}
		}

		const updateData = {
			...params,
			tags: params.tags ? JSON.stringify(params.tags) : params.tags === undefined ? undefined : null,
			publishedAt: params.status === 'published' && !page.publishedAt 
				? (params.publishedAt || new Date()) 
				: params.publishedAt,
			updatedAt: new Date()
		};

		// Remove undefined values
		Object.keys(updateData).forEach(key => {
			if (updateData[key as keyof typeof updateData] === undefined) {
				delete updateData[key as keyof typeof updateData];
			}
		});

		const [updatedPage] = await db
			.update(table.contentPage)
			.set(updateData)
			.where(eq(table.contentPage.id, pageId))
			.returning();

		return updatedPage;
	}

	/**
	 * Delete content page
	 */
	static async deletePage(pageId: number, currentAuthorId: string, userRole: string): Promise<void> {
		// Check if page exists and user has permissions
		const existingPage = await db
			.select()
			.from(table.contentPage)
			.where(eq(table.contentPage.id, pageId))
			.limit(1);

		if (existingPage.length === 0) {
			throw new Error('Page not found');
		}

		const page = existingPage[0];

		// Only allow authors to delete their own pages, or admins to delete any
		if (page.authorId !== currentAuthorId && userRole !== 'admin') {
			throw new Error('You can only delete your own pages');
		}

		await db.delete(table.contentPage).where(eq(table.contentPage.id, pageId));
	}

	/**
	 * Get user's content pages
	 */
	static async getUserPages(filter: UserContentFilter) {
		const { authorId, status, type, limit = 20, offset = 0 } = filter;

		// Apply filters
		const conditions = [eq(table.contentPage.authorId, authorId)];

		if (status) {
			conditions.push(eq(table.contentPage.status, status));
		}

		if (type) {
			conditions.push(eq(table.contentPage.type, type));
		}

		return await db
			.select()
			.from(table.contentPage)
			.where(and(...conditions))
			.orderBy(desc(table.contentPage.updatedAt))
			.limit(limit)
			.offset(offset);
	}

	/**
	 * Get all content pages for admin management
	 */
	static async getAllPages(filter: AdminContentFilter) {
		const { status, type, authorId, limit = 50, offset = 0, search } = filter;

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
				like(table.contentPage.title, `%${search}%`)
			);
		}

		const baseQuery = db
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

		return conditions.length > 0
			? await baseQuery
				.where(and(...conditions))
				.orderBy(desc(table.contentPage.updatedAt))
				.limit(limit)
				.offset(offset)
			: await baseQuery
				.orderBy(desc(table.contentPage.updatedAt))
				.limit(limit)
				.offset(offset);
	}
}

export default ContentService;
