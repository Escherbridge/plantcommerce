import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import {
	assertPublicCatalogAvailable,
	getPublicCatalogAvailability
} from '../catalogTruth/publicCatalog';
import { encodeBase64url } from '@oslojs/encoding';
import { invalidateUserSessions } from '../auth';

export type AffiliateStatus = 'pending' | 'active' | 'rejected' | 'suspended';

export class AffiliateAccessError extends Error {
	constructor(message: string = 'Active affiliate approval is required') {
		super(message);
		this.name = 'AffiliateAccessError';
	}
}

export class AffiliateNotFoundError extends Error {
	constructor() {
		super('Affiliate not found');
		this.name = 'AffiliateNotFoundError';
	}
}

export function isActiveApprovedAffiliate(
	affiliate: Pick<table.Affiliate, 'status' | 'isActive'>
): boolean {
	return affiliate.status === 'active' && affiliate.isActive;
}

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

export interface AffiliateApplicationData {
	website?: string;
	socialMedia?: string;
	audience?: string;
	promotionMethod?: string;
	monthlyTraffic?: string;
	whyJoin?: string;
}

export interface AffiliateCreateResult {
	affiliate: table.Affiliate;
	created: boolean;
}

export class AffiliateService {
	/** Create or retrieve a single affiliate owner record under a transaction-scoped identity lock. */
	static async createAffiliate(
		userId: string,
		customCode?: string,
		applicationData?: AffiliateApplicationData
	): Promise<table.Affiliate> {
		return (await this.createOrGetAffiliate(userId, customCode, applicationData)).affiliate;
	}

	/** Return whether this request, rather than a concurrent request, created the affiliate application. */
	static async createOrGetAffiliate(
		userId: string,
		customCode?: string,
		applicationData?: AffiliateApplicationData
	): Promise<AffiliateCreateResult> {
		return await db.transaction(async (tx) => {
			await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${`affiliate:user:${userId}`}))`);
			const [existing] = await tx
				.select()
				.from(table.affiliate)
				.where(eq(table.affiliate.userId, userId))
				.limit(1);
			if (existing) {
				return { affiliate: existing, created: false };
			}

			for (let attempt = 0; attempt < 5; attempt += 1) {
				const affiliateCode = customCode ?? this.generateAffiliateCode();
				if (customCode) {
					const [codeOwner] = await tx
						.select({ id: table.affiliate.id })
						.from(table.affiliate)
						.where(eq(table.affiliate.affiliateCode, affiliateCode))
						.limit(1);
					if (codeOwner) {
						throw new Error('Affiliate code already exists');
					}
				}

				const [affiliate] = await tx
					.insert(table.affiliate)
					.values({
						userId,
						affiliateCode,
						commissionRate: '0.05',
						totalEarnings: '0.00',
						totalClicks: 0,
						totalConversions: 0,
						isActive: false,
						status: 'pending',
						website: applicationData?.website,
						socialMedia: applicationData?.socialMedia,
						audience: applicationData?.audience,
						promotionMethod: applicationData?.promotionMethod,
						monthlyTraffic: applicationData?.monthlyTraffic,
						whyJoin: applicationData?.whyJoin
					})
					.onConflictDoNothing()
					.returning();
				if (affiliate) {
					return { affiliate, created: true };
				}

				const [winner] = await tx
					.select()
					.from(table.affiliate)
					.where(eq(table.affiliate.userId, userId))
					.limit(1);
				if (winner) {
					return { affiliate: winner, created: false };
				}
				if (customCode) {
					throw new Error('Affiliate code already exists');
				}
			}

			throw new Error('Unable to allocate a unique affiliate code');
		});
	}

	/**
	 * Change application state and keep the linked user role and sessions in sync.
	 */
	static async setAffiliateStatus(
		affiliateId: number,
		status: AffiliateStatus
	): Promise<table.Affiliate> {
		const affiliate = await this.getAffiliateById(affiliateId);
		if (!affiliate) {
			throw new AffiliateNotFoundError();
		}

		const isActive = status === 'active';
		const updatedAt = new Date();

		await db.transaction(async (tx) => {
			const [affiliateUser] = await tx
				.select({ role: table.user.role })
				.from(table.user)
				.where(eq(table.user.id, affiliate.userId))
				.limit(1);

			if (!affiliateUser) {
				throw new Error('Affiliate user not found');
			}

			await tx
				.update(table.affiliate)
				.set({ status, isActive, updatedAt })
				.where(eq(table.affiliate.id, affiliateId));

			// Administrators retain their administrative role. Everyone else is an
			// ordinary customer until their application is active and approved.
			if (affiliateUser.role !== 'admin') {
				await tx
					.update(table.user)
					.set({ role: isActive ? 'affiliate' : 'customer', updatedAt })
					.where(eq(table.user.id, affiliate.userId));
			}
		});

		await invalidateUserSessions(affiliate.userId);

		return {
			...affiliate,
			status,
			isActive,
			updatedAt
		};
	}

	static async approveAffiliate(affiliateId: number): Promise<table.Affiliate> {
		return this.setAffiliateStatus(affiliateId, 'active');
	}

	static async rejectAffiliate(affiliateId: number): Promise<table.Affiliate> {
		return this.setAffiliateStatus(affiliateId, 'rejected');
	}

	/**
	 * Generate an affiliate link for a specific product
	 */
	static async createAffiliateLink(
		params: CreateAffiliateLinkParams
	): Promise<table.AffiliateLink> {
		const { affiliateId, productId, customCode } = params;
		await this.requireActiveAffiliateById(affiliateId);
		assertPublicCatalogAvailable();

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

		// Get product with category info
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
			throw new Error('Product not found');
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
	 * Get affiliate statistics
	 */
	static async getAffiliateStats(affiliateId: number): Promise<AffiliateStats> {
		const affiliate = await this.requireActiveAffiliateById(affiliateId);

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

		const conversionRate =
			affiliate.totalClicks > 0 ? (affiliate.totalConversions / affiliate.totalClicks) * 100 : 0;

		return {
			totalEarnings: parseFloat(affiliate.totalEarnings),
			totalClicks: affiliate.totalClicks,
			totalConversions: affiliate.totalConversions,
			conversionRate: Math.round(conversionRate * 100) / 100,
			recentLinks: recentLinks.map((link) => ({
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

	static async getAffiliateById(affiliateId: number): Promise<table.Affiliate | null> {
		const result = await db
			.select()
			.from(table.affiliate)
			.where(eq(table.affiliate.id, affiliateId))
			.limit(1);

		return result.length > 0 ? result[0] : null;
	}

	static async requireActiveAffiliateByUserId(userId: string): Promise<table.Affiliate> {
		const affiliate = await this.getAffiliateByUserId(userId);
		if (!affiliate || !isActiveApprovedAffiliate(affiliate)) {
			throw new AffiliateAccessError();
		}

		return affiliate;
	}

	static async requireActiveAffiliateById(affiliateId: number): Promise<table.Affiliate> {
		const affiliate = await this.getAffiliateById(affiliateId);
		if (!affiliate || !isActiveApprovedAffiliate(affiliate)) {
			throw new AffiliateAccessError();
		}

		return affiliate;
	}

	/**
	 * Get affiliate links for a user
	 */
	static async getAffiliateLinks(userId: string) {
		// First get the affiliate record
		const affiliate = await this.requireActiveAffiliateByUserId(userId);

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
			.select({ link: table.affiliateLink })
			.from(table.affiliateLink)
			.innerJoin(table.affiliate, eq(table.affiliateLink.affiliateId, table.affiliate.id))
			.where(
				and(
					eq(table.affiliateLink.linkCode, linkCode),
					eq(table.affiliateLink.isActive, true),
					eq(table.affiliate.isActive, true),
					eq(table.affiliate.status, 'active')
				)
			)
			.limit(1);

		return result.length > 0 ? result[0].link : null;
	}

	/**
	 * Get affiliate link with product details by code
	 */
	static async getLinkWithProductByCode(linkCode: string) {
		if (getPublicCatalogAvailability().status !== 'available') {
			return null;
		}
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
	static async toggleLinkStatus(
		linkId: number,
		userId: string,
		isAdmin: boolean = false
	): Promise<{ success: boolean; isActive: boolean }> {
		// Load the link and its affiliate before checking ownership and status.
		const linkResult = await db
			.select({
				link: table.affiliateLink,
				affiliate: table.affiliate
			})
			.from(table.affiliateLink)
			.innerJoin(table.affiliate, eq(table.affiliateLink.affiliateId, table.affiliate.id))
			.where(eq(table.affiliateLink.id, linkId))
			.limit(1);

		if (linkResult.length === 0) {
			throw new Error('Affiliate link not found or access denied');
		}

		const { link, affiliate } = linkResult[0];
		if (!isActiveApprovedAffiliate(affiliate)) {
			throw new AffiliateAccessError();
		}

		if (!isAdmin && affiliate.userId !== userId) {
			throw new Error('Affiliate link not found or access denied');
		}

		const newStatus = !link.isActive;

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
		const affiliate = await this.requireActiveAffiliateById(affiliateId);

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
		await this.requireActiveAffiliateById(affiliateId);

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
