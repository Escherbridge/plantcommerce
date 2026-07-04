import { eq, and, desc, sum, count, gte, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { encodeBase64url } from '@oslojs/encoding';

export interface AffiliateStats {
	totalEarnings: number;
	totalClicks: number;
	totalConversions: number;
	conversionRate: number;
	recentLinks: Array<{
		id: number;
		productName: string;
		clicks: number;
		conversions: number;
		earnings: number;
	}>;
}

export interface CreateAffiliateLinkParams {
	affiliateId: number;
	productId: number;
	customCode?: string;
}

export interface AffiliateClickData {
	ipAddress?: string;
	userAgent?: string;
	referer?: string;
	sessionId?: string;
	userId?: string;
}

export class AffiliateService {
	/**
	 * Create or retrieve an affiliate record for a user
	 */
	static async createAffiliate(userId: string, customCode?: string, applicationData?: {
		website?: string;
		socialMedia?: string;
		audience?: string;
		promotionMethod?: string;
		monthlyTraffic?: string;
		whyJoin?: string;
	}): Promise<table.Affiliate> {
		// Check if affiliate already exists
		const existing = await db
			.select()
			.from(table.affiliate)
			.where(eq(table.affiliate.userId, userId))
			.limit(1);

		if (existing.length > 0) {
			return existing[0];
		}

		// Generate unique affiliate code
		const affiliateCode = customCode || this.generateAffiliateCode();

		// Ensure code is unique
		await this.ensureUniqueAffiliateCode(affiliateCode);

		const newAffiliate: typeof table.affiliate.$inferInsert = {
			userId,
			affiliateCode,
			commissionRate: '0.05', // 5% default
			totalEarnings: '0.00',
			totalClicks: 0,
			totalConversions: 0,
			isActive: true,
			status: 'pending', // Start as pending approval
			website: applicationData?.website,
			socialMedia: applicationData?.socialMedia,
			audience: applicationData?.audience,
			promotionMethod: applicationData?.promotionMethod,
			monthlyTraffic: applicationData?.monthlyTraffic,
			whyJoin: applicationData?.whyJoin
		};

		const [affiliate] = await db.insert(table.affiliate).values(newAffiliate).returning();
		return affiliate;
	}

	/**
	 * Generate an affiliate link for a specific product
	 */
	static async createAffiliateLink(params: CreateAffiliateLinkParams): Promise<table.AffiliateLink> {
		const { affiliateId, productId, customCode } = params;

		// Check if link already exists
		const existing = await db
			.select()
			.from(table.affiliateLink)
			.where(
				and(
					eq(table.affiliateLink.affiliateId, affiliateId),
					eq(table.affiliateLink.productId, productId)
				)
			)
			.limit(1);

		if (existing.length > 0) {
			return existing[0];
		}

		// Get product with category info and affiliate info
		const [productResult, affiliateResult] = await Promise.all([
			db.select({
				product: table.product,
				category: table.productCategory
			})
				.from(table.product)
				.innerJoin(table.productCategory, eq(table.product.categoryId, table.productCategory.id))
				.where(eq(table.product.id, productId))
				.limit(1),
			db.select().from(table.affiliate).where(eq(table.affiliate.id, affiliateId)).limit(1)
		]);

		if (productResult.length === 0) {
			throw new Error('Product not found');
		}

		if (affiliateResult.length === 0) {
			throw new Error('Affiliate not found');
		}

		const product = productResult[0].product;
		const category = productResult[0].category;

		// Resolve the parent category slug for the URL
		let categorySlug = category.slug;
		if (category.parentId) {
			const parentResult = await db
				.select()
				.from(table.productCategory)
				.where(eq(table.productCategory.id, category.parentId))
				.limit(1);
			if (parentResult.length > 0) {
				categorySlug = parentResult[0].slug;
			}
		}

		const affiliate = affiliateResult[0];

		// Generate unique link code
		const linkCode = customCode || this.generateLinkCode();
		await this.ensureUniqueLinkCode(linkCode);

		// Build URLs — product detail pages use /products/[category]/[slug]
		const originalUrl = `/products/${categorySlug}/${product.slug}`;
		const affiliateUrl = `/aff/${linkCode}`;

		const newLink: typeof table.affiliateLink.$inferInsert = {
			affiliateId,
			productId,
			linkCode,
			originalUrl,
			affiliateUrl,
			clicks: 0,
			conversions: 0,
			earnings: '0.00',
			isActive: true
		};

		const [link] = await db.insert(table.affiliateLink).values(newLink).returning();
		return link;
	}

	/**
	 * Track a click on an affiliate link
	 */
	static async trackClick(linkCode: string, clickData: AffiliateClickData): Promise<boolean> {
		// Get affiliate link with affiliate info
		const linkResult = await db
			.select({
				link: table.affiliateLink,
				affiliate: table.affiliate
			})
			.from(table.affiliateLink)
			.innerJoin(table.affiliate, eq(table.affiliateLink.affiliateId, table.affiliate.id))
			.where(
				and(
					eq(table.affiliateLink.linkCode, linkCode),
					eq(table.affiliateLink.isActive, true)
				)
			)
			.limit(1);

		if (linkResult.length === 0) {
			return false;
		}

		const { link, affiliate } = linkResult[0];

		// Record the click
		const clickRecord: typeof table.affiliateClick.$inferInsert = {
			affiliateLinkId: link.id,
			ipAddress: clickData.ipAddress,
			userAgent: clickData.userAgent,
			referer: clickData.referer,
			sessionId: clickData.sessionId,
			userId: clickData.userId
		};

		await Promise.all([
			// Insert click record
			db.insert(table.affiliateClick).values(clickRecord),
			// Update link click count
			db
				.update(table.affiliateLink)
				.set({ 
					clicks: link.clicks + 1,
					updatedAt: new Date()
				})
				.where(eq(table.affiliateLink.id, link.id)),
			// Update affiliate total clicks
			db
				.update(table.affiliate)
				.set({ 
					totalClicks: affiliate.totalClicks + 1,
					updatedAt: new Date()
				})
				.where(eq(table.affiliate.id, link.affiliateId))
		]);

		return true;
	}

	/**
	 * Process an affiliate conversion (when order is completed)
	 */
	static async processConversion(orderId: number): Promise<void> {
		// Get order with affiliate link
		const orderResult = await db
			.select({
				order: table.order,
				affiliate: table.affiliate,
				affiliateLink: table.affiliateLink
			})
			.from(table.order)
			.leftJoin(table.affiliateLink, eq(table.order.affiliateLinkId, table.affiliateLink.id))
			.leftJoin(table.affiliate, eq(table.affiliateLink.affiliateId, table.affiliate.id))
			.where(eq(table.order.id, orderId))
			.limit(1);

		if (orderResult.length === 0 || !orderResult[0].affiliate || !orderResult[0].affiliateLink) {
			return; // No affiliate attribution
		}

		const { order, affiliate, affiliateLink } = orderResult[0];

		// Calculate commission
		const commission = parseFloat(order.subtotalAmount) * parseFloat(affiliate.commissionRate);
		
		// Update order with commission
		await db
			.update(table.order)
			.set({
				affiliateCommission: commission.toFixed(2),
				updatedAt: new Date()
			})
			.where(eq(table.order.id, orderId));

		// Update affiliate link stats
		await db
			.update(table.affiliateLink)
			.set({
				conversions: affiliateLink.conversions + 1,
				earnings: (parseFloat(affiliateLink.earnings) + commission).toFixed(2),
				updatedAt: new Date()
			})
			.where(eq(table.affiliateLink.id, affiliateLink.id));

		// Update affiliate totals
		await db
			.update(table.affiliate)
			.set({
				totalConversions: affiliate.totalConversions + 1,
				totalEarnings: (parseFloat(affiliate.totalEarnings) + commission).toFixed(2),
				updatedAt: new Date()
			})
			.where(eq(table.affiliate.id, affiliate.id));
	}

	/**
	 * Get affiliate statistics
	 */
	static async getAffiliateStats(affiliateId: number): Promise<AffiliateStats> {
		// Get affiliate basic stats
		const affiliateResult = await db
			.select()
			.from(table.affiliate)
			.where(eq(table.affiliate.id, affiliateId))
			.limit(1);

		if (affiliateResult.length === 0) {
			throw new Error('Affiliate not found');
		}

		const affiliate = affiliateResult[0];

		// Get recent links with product names
		const recentLinks = await db
			.select({
				id: table.affiliateLink.id,
				productName: table.product.name,
				clicks: table.affiliateLink.clicks,
				conversions: table.affiliateLink.conversions,
				earnings: table.affiliateLink.earnings
			})
			.from(table.affiliateLink)
			.innerJoin(table.product, eq(table.affiliateLink.productId, table.product.id))
			.where(eq(table.affiliateLink.affiliateId, affiliateId))
			.orderBy(desc(table.affiliateLink.updatedAt))
			.limit(10);

		const conversionRate = affiliate.totalClicks > 0 
			? (affiliate.totalConversions / affiliate.totalClicks) * 100 
			: 0;

		return {
			totalEarnings: parseFloat(affiliate.totalEarnings),
			totalClicks: affiliate.totalClicks,
			totalConversions: affiliate.totalConversions,
			conversionRate: Math.round(conversionRate * 100) / 100,
			recentLinks: recentLinks.map(link => ({
				id: link.id,
				productName: link.productName,
				clicks: link.clicks,
				conversions: link.conversions,
				earnings: parseFloat(link.earnings)
			}))
		};
	}

	/**
	 * Get affiliate record by user ID
	 */
	static async getAffiliateByUserId(userId: string): Promise<table.Affiliate | null> {
		const result = await db
			.select()
			.from(table.affiliate)
			.where(eq(table.affiliate.userId, userId))
			.limit(1);

		return result.length > 0 ? result[0] : null;
	}

	/**
	 * Get affiliate links for a user
	 */
	static async getAffiliateLinks(userId: string) {
		// First get the affiliate record
		const affiliate = await this.getAffiliateByUserId(userId);
		if (!affiliate) {
			throw new Error('Affiliate account not found');
		}

		const links = await db
			.select({
				id: table.affiliateLink.id,
				linkCode: table.affiliateLink.linkCode,
				originalUrl: table.affiliateLink.originalUrl,
				affiliateUrl: table.affiliateLink.affiliateUrl,
				clicks: table.affiliateLink.clicks,
				conversions: table.affiliateLink.conversions,
				earnings: table.affiliateLink.earnings,
				isActive: table.affiliateLink.isActive,
				createdAt: table.affiliateLink.createdAt,
				product: {
					id: table.product.id,
					name: table.product.name,
					slug: table.product.slug,
					price: table.product.price,
					stockQuantity: table.product.stockQuantity
				}
			})
			.from(table.affiliateLink)
			.innerJoin(table.product, eq(table.affiliateLink.productId, table.product.id))
			.where(eq(table.affiliateLink.affiliateId, affiliate.id));

		return links;
	}

	/**
	 * Get affiliate link by code
	 */
	static async getLinkByCode(linkCode: string): Promise<table.AffiliateLink | null> {
		const result = await db
			.select()
			.from(table.affiliateLink)
			.where(
				and(
					eq(table.affiliateLink.linkCode, linkCode),
					eq(table.affiliateLink.isActive, true)
				)
			)
			.limit(1);

		return result.length > 0 ? result[0] : null;
	}

	/**
	 * Get affiliate link with product details by code
	 */
	static async getLinkWithProductByCode(linkCode: string) {
		const link = await this.getLinkByCode(linkCode);
		if (!link) {
			return null;
		}

		// Get product details
		const productResult = await db
			.select()
			.from(table.product)
			.where(eq(table.product.id, link.productId))
			.limit(1);

		if (productResult.length === 0) {
			throw new Error('Product not found');
		}

		return {
			...link,
			product: productResult[0]
		};
	}

	/**
	 * Toggle affiliate link status
	 */
	static async toggleLinkStatus(linkId: number, userId: string): Promise<{ success: boolean; isActive: boolean }> {
		// Verify user owns this link
		const linkResult = await db
			.select({
				link: table.affiliateLink,
				affiliate: table.affiliate
			})
			.from(table.affiliateLink)
			.innerJoin(table.affiliate, eq(table.affiliateLink.affiliateId, table.affiliate.id))
			.where(
				and(
					eq(table.affiliateLink.id, linkId),
					eq(table.affiliate.userId, userId)
				)
			)
			.limit(1);

		if (linkResult.length === 0) {
			throw new Error('Affiliate link not found or access denied');
		}

		const newStatus = !linkResult[0].link.isActive;
		
		await db
			.update(table.affiliateLink)
			.set({ 
				isActive: newStatus,
				updatedAt: new Date()
			})
			.where(eq(table.affiliateLink.id, linkId));

		return { success: true, isActive: newStatus };
	}

	/**
	 * Get earnings data for an affiliate, including history, current month, and pending payout
	 */
	static async getEarningsData(affiliateId: number): Promise<{
		totalEarnings: number;
		pendingPayout: number;
		currentMonthEarnings: number;
		lastMonthEarnings: number;
		history: Array<{
			date: string;
			orderId: string;
			productName: string;
			saleAmount: number;
			commissionRate: number;
			commission: number;
			status: string;
		}>;
	}> {
		// Get the affiliate record
		const affiliateResult = await db
			.select()
			.from(table.affiliate)
			.where(eq(table.affiliate.id, affiliateId))
			.limit(1);

		if (affiliateResult.length === 0) {
			throw new Error('Affiliate not found');
		}

		const affiliate = affiliateResult[0];

		// Get all orders attributed to this affiliate's links
		const orders = await db
			.select({
				orderId: table.order.id,
				orderNumber: table.order.orderNumber,
				subtotalAmount: table.order.subtotalAmount,
				affiliateCommission: table.order.affiliateCommission,
				orderStatus: table.order.status,
				createdAt: table.order.createdAt,
				linkId: table.affiliateLink.id,
				productId: table.affiliateLink.productId,
				productName: table.product.name
			})
			.from(table.order)
			.innerJoin(table.affiliateLink, eq(table.order.affiliateLinkId, table.affiliateLink.id))
			.innerJoin(table.product, eq(table.affiliateLink.productId, table.product.id))
			.where(eq(table.affiliateLink.affiliateId, affiliateId))
			.orderBy(desc(table.order.createdAt));

		// Calculate current month and last month earnings
		const now = new Date();
		const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

		let currentMonthEarnings = 0;
		let lastMonthEarnings = 0;
		let pendingPayout = 0;

		const history = orders.map((order) => {
			const commission = parseFloat(order.affiliateCommission);
			const orderDate = new Date(order.createdAt);

			// Current month earnings
			if (orderDate >= currentMonthStart) {
				currentMonthEarnings += commission;
			}

			// Last month earnings
			if (orderDate >= lastMonthStart && orderDate <= lastMonthEnd) {
				lastMonthEarnings += commission;
			}

			// Pending payout: commissions from orders that are confirmed/processing/shipped/delivered but not yet paid out
			// We consider all non-cancelled, non-refunded orders as pending until a payout system is built
			const isActiveOrder = !['cancelled', 'refunded'].includes(order.orderStatus);
			if (isActiveOrder && commission > 0) {
				pendingPayout += commission;
			}

			// Map order status to commission status
			let commissionStatus = 'processing';
			if (['delivered'].includes(order.orderStatus)) {
				commissionStatus = 'pending'; // Delivered but not yet paid out
			} else if (['cancelled', 'refunded'].includes(order.orderStatus)) {
				commissionStatus = 'cancelled';
			}

			return {
				date: order.createdAt.toISOString(),
				orderId: order.orderNumber,
				productName: order.productName,
				saleAmount: parseFloat(order.subtotalAmount),
				commissionRate: parseFloat(affiliate.commissionRate),
				commission,
				status: commissionStatus
			};
		});

		return {
			totalEarnings: parseFloat(affiliate.totalEarnings),
			pendingPayout: Math.round(pendingPayout * 100) / 100,
			currentMonthEarnings: Math.round(currentMonthEarnings * 100) / 100,
			lastMonthEarnings: Math.round(lastMonthEarnings * 100) / 100,
			history
		};
	}

	/**
	 * Get top performing links for an affiliate (for dashboard display)
	 */
	static async getTopPerformingLinks(affiliateId: number, limit: number = 10) {
		const links = await db
			.select({
				id: table.affiliateLink.id,
				linkCode: table.affiliateLink.linkCode,
				clicks: table.affiliateLink.clicks,
				conversions: table.affiliateLink.conversions,
				earnings: table.affiliateLink.earnings,
				productName: table.product.name,
				productSlug: table.product.slug
			})
			.from(table.affiliateLink)
			.innerJoin(table.product, eq(table.affiliateLink.productId, table.product.id))
			.where(eq(table.affiliateLink.affiliateId, affiliateId))
			.orderBy(desc(table.affiliateLink.clicks))
			.limit(limit);

		return links.map((link) => ({
			id: link.id,
			linkCode: link.linkCode,
			clicks: link.clicks,
			conversions: link.conversions,
			earnings: parseFloat(link.earnings),
			converted: link.conversions > 0,
			product: {
				name: link.productName,
				slug: link.productSlug
			}
		}));
	}

	/**
	 * Generate a unique affiliate code
	 */
	private static generateAffiliateCode(): string {
		const bytes = crypto.getRandomValues(new Uint8Array(6));
		return encodeBase64url(bytes).toUpperCase();
	}

	/**
	 * Generate a unique link code
	 */
	private static generateLinkCode(): string {
		const bytes = crypto.getRandomValues(new Uint8Array(8));
		return encodeBase64url(bytes);
	}

	/**
	 * Ensure affiliate code is unique
	 */
	private static async ensureUniqueAffiliateCode(code: string): Promise<void> {
		const existing = await db
			.select()
			.from(table.affiliate)
			.where(eq(table.affiliate.affiliateCode, code))
			.limit(1);

		if (existing.length > 0) {
			throw new Error('Affiliate code already exists');
		}
	}

	/**
	 * Ensure link code is unique
	 */
	private static async ensureUniqueLinkCode(code: string): Promise<void> {
		const existing = await db
			.select()
			.from(table.affiliateLink)
			.where(eq(table.affiliateLink.linkCode, code))
			.limit(1);

		if (existing.length > 0) {
			throw new Error('Link code already exists');
		}
	}
}

export default AffiliateService;
