import { eq, and, desc, sum, count } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { generateId } from '@lucia-auth/adapter-drizzle';
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
	static async createAffiliate(userId: string, customCode?: string): Promise<table.Affiliate> {
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
			isActive: true
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

		// Get product and affiliate info
		const [productResult, affiliateResult] = await Promise.all([
			db.select().from(table.product).where(eq(table.product.id, productId)).limit(1),
			db.select().from(table.affiliate).where(eq(table.affiliate.id, affiliateId)).limit(1)
		]);

		if (productResult.length === 0) {
			throw new Error('Product not found');
		}

		if (affiliateResult.length === 0) {
			throw new Error('Affiliate not found');
		}

		const product = productResult[0];
		const affiliate = affiliateResult[0];

		// Generate unique link code
		const linkCode = customCode || this.generateLinkCode();
		await this.ensureUniqueLinkCode(linkCode);

		// Build URLs
		const originalUrl = `/products/${product.slug}`;
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
		// Get affiliate link
		const linkResult = await db
			.select()
			.from(table.affiliateLink)
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

		const link = linkResult[0];

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
					totalClicks: link.affiliate?.totalClicks ? link.affiliate.totalClicks + 1 : 1,
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
