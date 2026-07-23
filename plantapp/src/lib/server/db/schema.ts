import {
	pgTable,
	serial,
	integer,
	bigint,
	text,
	timestamp,
	decimal,
	boolean,
	uuid,
	varchar,
	jsonb,
	index,
	uniqueIndex,
	check,
	foreignKey,
	type AnyPgColumn
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ======= USER MANAGEMENT =======
export const user = pgTable(
	'user',
	{
		id: text('id').primaryKey(),
		username: text('username').notNull().unique(),
		email: text('email').notNull().unique(),
		passwordHash: text('password_hash').notNull(),
		firstName: text('first_name'),
		lastName: text('last_name'),
		avatarFileId: text('avatar_file_id'), // Reference to file table
		role: text('role', { enum: ['admin', 'customer', 'affiliate', 'instructor'] })
			.notNull()
			.default('customer'),
		isActive: boolean('is_active').notNull().default(true),
		emailVerified: boolean('email_verified').notNull().default(false),
		pendingEmail: text('pending_email'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		pendingEmailIdx: uniqueIndex('user_pending_email_unique').on(table.pendingEmail)
	})
);

export const emailVerificationToken = pgTable(
	'email_verification_token',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		email: text('email').notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
	},
	(table) => ({
		userIdx: uniqueIndex('email_verification_token_user_idx').on(table.userId),
		expiresIdx: index('email_verification_token_expires_idx').on(table.expiresAt)
	})
);

/** Dual-proof capability state for a staged recovery-email replacement. */
export const emailChangeCapability = pgTable(
	'email_change_capability',
	{
		userId: text('user_id')
			.primaryKey()
			.references(() => user.id),
		previousEmail: text('previous_email').notNull(),
		pendingEmail: text('pending_email').notNull(),
		newEmailTokenHash: text('new_email_token_hash'),
		previousEmailTokenHash: text('previous_email_token_hash'),
		newEmailProvedAt: timestamp('new_email_proved_at', { withTimezone: true, mode: 'date' }),
		previousEmailConfirmedAt: timestamp('previous_email_confirmed_at', {
			withTimezone: true,
			mode: 'date'
		}),
		expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		newEmailTokenIdx: uniqueIndex('email_change_capability_new_token_idx').on(
			table.newEmailTokenHash
		),
		previousEmailTokenIdx: uniqueIndex('email_change_capability_previous_token_idx').on(
			table.previousEmailTokenHash
		),
		expiresIdx: index('email_change_capability_expires_idx').on(table.expiresAt)
	})
);

export const passwordResetToken = pgTable(
	'password_reset_token',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		email: text('email').notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		userIdx: uniqueIndex('password_reset_token_user_idx').on(table.userId),
		expiresIdx: index('password_reset_token_expires_idx').on(table.expiresAt)
	})
);

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
	rememberMe: boolean('remember_me').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.defaultNow()
});

// ======= AUTHENTICATION SECURITY =======
export const loginAttempts = pgTable(
	'login_attempts',
	{
		id: serial('id').primaryKey(),
		identifier: text('identifier').notNull(), // IP address or user ID
		identifierType: text('identifier_type', { enum: ['ip', 'user'] }).notNull(),
		attempts: integer('attempts').notNull().default(1),
		lastAttempt: timestamp('last_attempt', { withTimezone: true, mode: 'date' })
			.notNull()
			.defaultNow(),
		blockedUntil: timestamp('blocked_until', { withTimezone: true, mode: 'date' }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		identifierIdx: uniqueIndex('login_attempts_identifier_idx').on(
			table.identifier,
			table.identifierType
		),
		blockedIdx: index('login_attempts_blocked_idx').on(table.blockedUntil)
	})
);

export const accountLocks = pgTable(
	'account_locks',
	{
		id: serial('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		reason: text('reason').notNull(), // 'failed_attempts', 'suspicious_activity'
		lockedAt: timestamp('locked_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		unlockToken: text('unlock_token'),
		unlockedAt: timestamp('unlocked_at', { withTimezone: true, mode: 'date' })
	},
	(table) => ({
		userIdx: index('account_locks_user_idx').on(table.userId),
		tokenIdx: index('account_locks_token_idx').on(table.unlockToken)
	})
);

export const socialAccounts = pgTable(
	'social_accounts',
	{
		id: serial('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		provider: text('provider').notNull(), // 'google', 'facebook', etc.
		providerUserId: text('provider_user_id').notNull(),
		email: text('email'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		userIdx: index('social_accounts_user_idx').on(table.userId),
		providerIdx: uniqueIndex('social_accounts_provider_idx').on(
			table.provider,
			table.providerUserId
		)
	})
);

// ======= PRODUCT CATALOG =======
export const productCategory = pgTable('product_category', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	parentId: integer('parent_id').references((): AnyPgColumn => productCategory.id),
	sortOrder: integer('sort_order').notNull().default(0),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const product = pgTable(
	'product',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		slug: text('slug').notNull().unique(),
		description: text('description'),
		shortDescription: text('short_description'),
		sku: text('sku').notNull().unique(),
		price: decimal('price', { precision: 10, scale: 2 }).notNull(),
		comparePrice: decimal('compare_price', { precision: 10, scale: 2 }),
		costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
		stockQuantity: integer('stock_quantity').notNull().default(0),
		reservedQuantity: integer('reserved_quantity').notNull().default(0),
		trackInventory: boolean('track_inventory').notNull().default(true),
		weight: decimal('weight', { precision: 8, scale: 2 }),
		dimensions: text('dimensions'), // JSON string: {length, width, height}
		categoryId: integer('category_id')
			.notNull()
			.references(() => productCategory.id),
		isActive: boolean('is_active').notNull().default(true),
		isFeatured: boolean('is_featured').notNull().default(false),
		tags: text('tags'), // JSON array of tags
		metaTitle: text('meta_title'),
		metaDescription: text('meta_description'),
		// Product-detail fields (Aevani product page anatomy, design-spec §5). All additive/nullable.
		descriptionHtml: text('description_html'),
		keyFeatures: jsonb('key_features').$type<string[]>(),
		stats: jsonb('stats').$type<{ value: string; label: string }[]>(),
		specs: jsonb('specs').$type<{ label: string; value: string }[]>(),
		inTheBox: jsonb('in_the_box').$type<string[]>(),
		faqs: jsonb('faqs').$type<{ q: string; a: string }[]>(),
		badges: jsonb('badges').$type<string[]>(),
		testBedNote: text('test_bed_note'),
		warranty: text('warranty'),
		shippingNote: text('shipping_note'),
		bundleOffer: jsonb('bundle_offer').$type<{
			title: string;
			price: string;
			compareAt: string;
			blurb: string;
		} | null>(),
		relatedProductIds: jsonb('related_product_ids').$type<number[]>(),
		currency: text('currency').notNull().default('USD'),
		ratingAverage: decimal('rating_average', { precision: 3, scale: 2 }),
		reviewCount: integer('review_count').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		nameIdx: index('product_name_idx').on(table.name),
		skuIdx: index('product_sku_idx').on(table.sku),
		categoryIdx: index('product_category_idx').on(table.categoryId),
		activeIdx: index('product_active_idx').on(table.isActive),
		featuredIdx: index('product_featured_idx').on(table.isFeatured),
		reservedQuantityNonnegative: check(
			'product_reserved_quantity_nonnegative_check',
			sql`${table.reservedQuantity} >= 0`
		)
	})
);

export const productImage = pgTable('product_image', {
	id: serial('id').primaryKey(),
	productId: integer('product_id')
		.notNull()
		.references(() => product.id, { onDelete: 'cascade' }),
	fileId: text('file_id').notNull(), // Reference to file table
	altText: text('alt_text'),
	sortOrder: integer('sort_order').notNull().default(0),
	isMain: boolean('is_main').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

// Customer reviews for a product (Aevani product page anatomy, design-spec §5 buy box + ratings).
export const productReview = pgTable(
	'product_review',
	{
		id: serial('id').primaryKey(),
		productId: integer('product_id')
			.notNull()
			.references(() => product.id, { onDelete: 'cascade' }),
		authorName: text('author_name').notNull(),
		rating: integer('rating').notNull(),
		title: text('title'),
		body: text('body').notNull(),
		isVerifiedPurchase: boolean('is_verified_purchase').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		productIdx: index('product_review_product_idx').on(table.productId),
		ratingRange: check('product_review_rating_range_check', sql`${table.rating} between 1 and 5`)
	})
);

// ======= AFFILIATE SYSTEM =======
export const affiliate = pgTable(
	'affiliate',
	{
		id: serial('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		affiliateCode: text('affiliate_code').notNull().unique(),
		commissionRate: decimal('commission_rate', { precision: 5, scale: 4 })
			.notNull()
			.default('0.05'), // 5% default
		totalEarnings: decimal('total_earnings', { precision: 12, scale: 2 }).notNull().default('0.00'),
		totalClicks: integer('total_clicks').notNull().default(0),
		totalConversions: integer('total_conversions').notNull().default(0),
		isActive: boolean('is_active').notNull().default(true),
		status: text('status', { enum: ['pending', 'active', 'rejected', 'suspended'] })
			.notNull()
			.default('pending'),
		website: text('website'),
		socialMedia: text('social_media'),
		audience: text('audience'),
		promotionMethod: text('promotion_method'),
		monthlyTraffic: text('monthly_traffic'),
		whyJoin: text('why_join'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		codeIdx: uniqueIndex('affiliate_code_idx').on(table.affiliateCode),
		userIdx: uniqueIndex('affiliate_user_idx').on(table.userId),
		statusIdx: index('affiliate_status_idx').on(table.status)
	})
);

export const affiliateLink = pgTable(
	'affiliate_link',
	{
		id: serial('id').primaryKey(),
		affiliateId: integer('affiliate_id')
			.notNull()
			.references(() => affiliate.id, { onDelete: 'cascade' }),
		productId: integer('product_id')
			.notNull()
			.references(() => product.id, { onDelete: 'cascade' }),
		linkCode: text('link_code').notNull().unique(), // Unique identifier for the link
		originalUrl: text('original_url').notNull(), // The product URL without affiliate params
		affiliateUrl: text('affiliate_url').notNull(), // The full affiliate URL
		clicks: integer('clicks').notNull().default(0),
		conversions: integer('conversions').notNull().default(0),
		earnings: decimal('earnings', { precision: 10, scale: 2 }).notNull().default('0.00'),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		linkCodeIdx: uniqueIndex('affiliate_link_code_idx').on(table.linkCode),
		affiliateIdx: index('affiliate_link_affiliate_idx').on(table.affiliateId),
		productIdx: index('affiliate_link_product_idx').on(table.productId)
	})
);

export const affiliateClick = pgTable(
	'affiliate_click',
	{
		id: serial('id').primaryKey(),
		affiliateLinkId: integer('affiliate_link_id')
			.notNull()
			.references(() => affiliateLink.id, { onDelete: 'cascade' }),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		referer: text('referer'),
		sessionId: text('session_id'), // Track anonymous sessions
		userId: text('user_id').references(() => user.id), // If user is logged in
		clickedAt: timestamp('clicked_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		linkIdx: index('affiliate_click_link_idx').on(table.affiliateLinkId),
		sessionIdx: index('affiliate_click_session_idx').on(table.sessionId),
		dateIdx: index('affiliate_click_date_idx').on(table.clickedAt)
	})
);

// Server-issued affiliate attribution capabilities. Do not persist raw IP, user-agent, or cookie values.
export const affiliateAttribution = pgTable(
	'affiliate_attribution',
	{
		id: text('id').primaryKey(),
		capabilityHash: text('capability_hash').notNull(),
		affiliateLinkId: integer('affiliate_link_id')
			.notNull()
			.references(() => affiliateLink.id, { onDelete: 'cascade' }),
		clientHash: text('client_hash').notNull(),
		userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
		issuedAt: timestamp('issued_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
		consumedAt: timestamp('consumed_at', { withTimezone: true, mode: 'date' }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		capabilityHashIdx: uniqueIndex('affiliate_attribution_capability_hash_idx').on(
			table.capabilityHash
		),
		linkIdx: index('affiliate_attribution_link_idx').on(table.affiliateLinkId),
		clientExpiresIdx: index('affiliate_attribution_client_expires_idx').on(
			table.clientHash,
			table.expiresAt
		),
		expiresIdx: index('affiliate_attribution_expires_idx').on(table.expiresAt),
		consumedIdx: index('affiliate_attribution_consumed_idx').on(table.consumedAt)
	})
);

// Click records are emitted only for a first qualifying click in a rolling 24-hour window.
export const affiliateAttributionClick = pgTable(
	'affiliate_attribution_click',
	{
		id: serial('id').primaryKey(),
		affiliateAttributionId: text('affiliate_attribution_id').references(
			() => affiliateAttribution.id,
			{
				onDelete: 'set null'
			}
		),
		affiliateLinkId: integer('affiliate_link_id')
			.notNull()
			.references(() => affiliateLink.id, { onDelete: 'cascade' }),
		clientHash: text('client_hash').notNull(),
		userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
		clickedAt: timestamp('clicked_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		linkDateIdx: index('affiliate_attribution_click_link_date_idx').on(
			table.affiliateLinkId,
			table.clickedAt
		),
		clientDateIdx: index('affiliate_attribution_click_client_date_idx').on(
			table.clientHash,
			table.clickedAt
		),
		attributionIdx: index('affiliate_attribution_click_attribution_idx').on(
			table.affiliateAttributionId
		)
	})
);

// A single row per link/client makes rolling-window click deduplication atomic.
export const affiliateClickDedupe = pgTable(
	'affiliate_click_dedupe',
	{
		id: serial('id').primaryKey(),
		affiliateLinkId: integer('affiliate_link_id')
			.notNull()
			.references(() => affiliateLink.id, { onDelete: 'cascade' }),
		clientHash: text('client_hash').notNull(),
		lastClickedAt: timestamp('last_clicked_at', { withTimezone: true, mode: 'date' }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		linkClientIdx: uniqueIndex('affiliate_click_dedupe_link_client_idx').on(
			table.affiliateLinkId,
			table.clientHash
		),
		lastClickedIdx: index('affiliate_click_dedupe_last_clicked_idx').on(table.lastClickedAt)
	})
);

// Versioned commission policy definitions; ledger rows retain their own policy snapshot.
export const affiliateTier = pgTable(
	'affiliate_tier',
	{
		id: text('id').primaryKey(),
		code: text('code').notNull(),
		version: integer('version').notNull(),
		commissionRateBps: integer('commission_rate_bps').notNull(),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		codeVersionIdx: uniqueIndex('affiliate_tier_code_version_idx').on(table.code, table.version),
		activeIdx: index('affiliate_tier_active_idx').on(table.isActive),
		versionPositive: check('affiliate_tier_version_check', sql`${table.version} >= 0`),
		rateRange: check(
			'affiliate_tier_rate_bps_check',
			sql`${table.commissionRateBps} >= 0 AND ${table.commissionRateBps} <= 10000`
		)
	})
);

// Acceptance records are append-only evidence for the terms/disclosure version used by a ledger entry.
export const affiliateTermsAcceptance = pgTable(
	'affiliate_terms_acceptance',
	{
		id: text('id').primaryKey(),
		affiliateId: integer('affiliate_id')
			.notNull()
			.references(() => affiliate.id, { onDelete: 'restrict' }),
		termsVersion: text('terms_version').notNull(),
		disclosureVersion: text('disclosure_version').notNull(),
		acceptanceReference: text('acceptance_reference').notNull(),
		acceptedAt: timestamp('accepted_at', { withTimezone: true, mode: 'date' }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		acceptanceReferenceIdx: uniqueIndex('affiliate_terms_acceptance_reference_idx').on(
			table.acceptanceReference
		),
		affiliateVersionIdx: uniqueIndex('affiliate_terms_acceptance_version_idx').on(
			table.affiliateId,
			table.termsVersion,
			table.disclosureVersion
		),
		affiliateAcceptedIdx: index('affiliate_terms_acceptance_affiliate_accepted_idx').on(
			table.affiliateId,
			table.acceptedAt
		)
	})
);

// A payout is an immutable payout instruction/reference. Provider disbursement is intentionally out of scope.
export const affiliatePayout = pgTable(
	'affiliate_payout',
	{
		id: text('id').primaryKey(),
		affiliateId: integer('affiliate_id')
			.notNull()
			.references(() => affiliate.id, { onDelete: 'restrict' }),
		payoutReference: text('payout_reference').notNull(),
		currency: varchar('currency', { length: 3 }).notNull(),
		amountMinor: bigint('amount_minor', { mode: 'number' }).notNull(),
		periodStart: timestamp('period_start', { withTimezone: true, mode: 'date' }),
		periodEnd: timestamp('period_end', { withTimezone: true, mode: 'date' }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		payoutReferenceIdx: uniqueIndex('affiliate_payout_reference_idx').on(table.payoutReference),
		affiliateCreatedIdx: index('affiliate_payout_affiliate_created_idx').on(
			table.affiliateId,
			table.createdAt
		),
		amountPositive: check(
			'affiliate_payout_amount_check',
			sql`${table.amountMinor} > 0 AND ${table.amountMinor} <= 9007199254740991`
		),
		currencyFormat: check('affiliate_payout_currency_check', sql`${table.currency} ~ '^[a-z]{3}$'`),
		periodOrder: check(
			'affiliate_payout_period_check',
			sql`${table.periodStart} IS NULL OR ${table.periodEnd} IS NULL OR ${table.periodStart} <= ${table.periodEnd}`
		)
	})
);

// ======= ORDERS & SHOPPING =======
export const cart = pgTable(
	'cart',
	{
		id: serial('id').primaryKey(),
		userId: text('user_id').references(() => user.id), // Null for guest carts
		sessionId: text('session_id'), // For guest carts
		affiliateLinkId: integer('affiliate_link_id').references(() => affiliateLink.id), // Track affiliate attribution
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		userIdentityIdx: uniqueIndex('cart_user_id_unique')
			.on(table.userId)
			.where(sql`${table.userId} IS NOT NULL`),
		guestIdentityIdx: uniqueIndex('cart_session_id_unique')
			.on(table.sessionId)
			.where(sql`${table.sessionId} IS NOT NULL`),
		identity: check(
			'cart_identity_check',
			sql`(${table.userId} IS NULL) <> (${table.sessionId} IS NULL)`
		)
	})
);

export const cartItem = pgTable('cart_item', {
	id: serial('id').primaryKey(),
	cartId: integer('cart_id')
		.notNull()
		.references(() => cart.id, { onDelete: 'cascade' }),
	productId: integer('product_id')
		.notNull()
		.references(() => product.id),
	quantity: integer('quantity').notNull().default(1),
	unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const wishlistItem = pgTable(
	'wishlist_item',
	{
		id: serial('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		productId: integer('product_id')
			.notNull()
			.references(() => product.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		userIdx: index('wishlist_item_user_idx').on(table.userId),
		uniqueItem: uniqueIndex('wishlist_item_unique_idx').on(table.userId, table.productId)
	})
);

export const checkoutDraft = pgTable(
	'checkout_draft',
	{
		id: text('id').primaryKey(),
		reference: text('reference').notNull().unique(),
		userId: text('user_id').references(() => user.id),
		guestSubjectHash: text('guest_subject_hash'),
		sourceCartId: integer('source_cart_id'),
		sourceCartUpdatedAt: timestamp('source_cart_updated_at', { withTimezone: true, mode: 'date' }),
		affiliateLinkId: integer('affiliate_link_id').references(() => affiliateLink.id),
		affiliateCommissionMinor: bigint('affiliate_commission_minor', { mode: 'number' })
			.notNull()
			.default(0),
		affiliateId: integer('affiliate_id').references(() => affiliate.id),
		affiliateCommissionRateBps: integer('affiliate_commission_rate_bps'),
		affiliateTierCode: text('affiliate_tier_code').notNull().default('legacy-rate'),
		affiliateTierVersion: integer('affiliate_tier_version').notNull().default(0),
		affiliateTermsVersion: text('affiliate_terms_version').notNull().default('unrecorded'),
		affiliateDisclosureVersion: text('affiliate_disclosure_version')
			.notNull()
			.default('unrecorded'),
		affiliateTermsAcceptanceId: text('affiliate_terms_acceptance_id').references(
			() => affiliateTermsAcceptance.id
		),
		status: text('status', {
			enum: [
				'pending_session',
				'checkout_created',
				'quarantined',
				'paid',
				'fulfilled',
				'expired',
				'failed'
			]
		})
			.notNull()
			.default('pending_session'),
		currency: varchar('currency', { length: 3 }).notNull(),
		subtotalMinor: bigint('subtotal_minor', { mode: 'number' }).notNull(),
		taxMinor: bigint('tax_minor', { mode: 'number' }).notNull(),
		shippingMinor: bigint('shipping_minor', { mode: 'number' }).notNull(),
		discountMinor: bigint('discount_minor', { mode: 'number' }).notNull(),
		totalMinor: bigint('total_minor', { mode: 'number' }).notNull(),
		snapshotHash: text('snapshot_hash').notNull(),
		customerEmail: text('customer_email'),
		customerPhone: text('customer_phone'),
		shippingAddress: text('shipping_address'),
		billingAddress: text('billing_address'),
		reservationReleasedAt: timestamp('reservation_released_at', {
			withTimezone: true,
			mode: 'date'
		}),
		expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		referenceIdx: uniqueIndex('checkout_draft_reference_idx').on(table.reference),
		userStatusIdx: index('checkout_draft_user_status_idx').on(table.userId, table.status),
		guestStatusIdx: index('checkout_draft_guest_status_idx').on(
			table.guestSubjectHash,
			table.status
		),
		expiresIdx: index('checkout_draft_expires_idx').on(table.expiresAt),
		activeSourceCartIdx: uniqueIndex('checkout_draft_active_source_cart_idx')
			.on(table.sourceCartId)
			.where(
				sql`${table.sourceCartId} IS NOT NULL AND ${table.status} IN ('pending_session', 'checkout_created', 'quarantined', 'paid')`
			),
		buyerIdentity: check(
			'checkout_draft_buyer_identity_check',
			sql`(${table.userId} IS NULL) <> (${table.guestSubjectHash} IS NULL)`
		),
		guestSubjectHashFormat: check(
			'checkout_draft_guest_subject_hash_check',
			sql`${table.guestSubjectHash} IS NULL OR ${table.guestSubjectHash} ~ '^[0-9a-f]{64}$'`
		),
		currencyFormat: check('checkout_draft_currency_check', sql`${table.currency} ~ '^[a-z]{3}$'`),
		amountsNonnegative: check(
			'checkout_draft_amounts_nonnegative_check',
			sql`${table.subtotalMinor} >= 0 AND ${table.taxMinor} >= 0 AND ${table.shippingMinor} >= 0 AND ${table.discountMinor} >= 0 AND ${table.totalMinor} >= 0 AND ${table.affiliateCommissionMinor} >= 0`
		),
		affiliatePolicyPair: check(
			'checkout_draft_affiliate_policy_pair_check',
			sql`(${table.affiliateId} IS NULL) = (${table.affiliateCommissionRateBps} IS NULL)`
		),
		affiliateRateRange: check(
			'checkout_draft_affiliate_rate_bps_check',
			sql`${table.affiliateCommissionRateBps} IS NULL OR (${table.affiliateCommissionRateBps} >= 0 AND ${table.affiliateCommissionRateBps} <= 10000)`
		),
		affiliateTierVersionValid: check(
			'checkout_draft_affiliate_tier_version_check',
			sql`${table.affiliateTierVersion} >= 0`
		),
		safeMinorValues: check(
			'checkout_draft_safe_minor_check',
			sql`${table.subtotalMinor} <= 9007199254740991 AND ${table.taxMinor} <= 9007199254740991 AND ${table.shippingMinor} <= 9007199254740991 AND ${table.discountMinor} <= 9007199254740991 AND ${table.totalMinor} <= 9007199254740991 AND ${table.affiliateCommissionMinor} <= 9007199254740991`
		),
		totalMatches: check(
			'checkout_draft_total_check',
			sql`${table.totalMinor} = ${table.subtotalMinor} + ${table.taxMinor} + ${table.shippingMinor} - ${table.discountMinor}`
		)
	})
);

export const checkoutDraftItem = pgTable(
	'checkout_draft_item',
	{
		id: serial('id').primaryKey(),
		draftId: text('draft_id')
			.notNull()
			.references(() => checkoutDraft.id, { onDelete: 'cascade' }),
		productId: integer('product_id')
			.notNull()
			.references(() => product.id),
		productName: text('product_name').notNull(),
		productSku: text('product_sku').notNull(),
		quantity: integer('quantity').notNull(),
		unitPriceMinor: bigint('unit_price_minor', { mode: 'number' }).notNull(),
		totalPriceMinor: bigint('total_price_minor', { mode: 'number' }).notNull(),
		trackInventory: boolean('track_inventory').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		draftIdx: index('checkout_draft_item_draft_idx').on(table.draftId),
		uniqueProductIdx: uniqueIndex('checkout_draft_item_product_idx').on(
			table.draftId,
			table.productId
		),
		quantityPositive: check('checkout_draft_item_quantity_check', sql`${table.quantity} > 0`),
		amountsNonnegative: check(
			'checkout_draft_item_price_check',
			sql`${table.unitPriceMinor} >= 0 AND ${table.totalPriceMinor} >= 0`
		),
		safeMinorValues: check(
			'checkout_draft_item_safe_minor_check',
			sql`${table.unitPriceMinor} <= 9007199254740991 AND ${table.totalPriceMinor} <= 9007199254740991`
		),
		totalMatches: check(
			'checkout_draft_item_total_check',
			sql`${table.totalPriceMinor} = ${table.unitPriceMinor} * ${table.quantity}`
		)
	})
);

export const checkoutInventoryReservation = pgTable(
	'checkout_inventory_reservation',
	{
		id: serial('id').primaryKey(),
		draftId: text('draft_id')
			.notNull()
			.references(() => checkoutDraft.id, { onDelete: 'cascade' }),
		productId: integer('product_id')
			.notNull()
			.references(() => product.id),
		quantity: integer('quantity').notNull(),
		status: text('status', { enum: ['active', 'released', 'consumed'] })
			.notNull()
			.default('active'),
		releasedAt: timestamp('released_at', { withTimezone: true, mode: 'date' }),
		consumedAt: timestamp('consumed_at', { withTimezone: true, mode: 'date' }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		draftProductIdx: uniqueIndex('checkout_inventory_reservation_draft_product_idx').on(
			table.draftId,
			table.productId
		),
		statusIdx: index('checkout_inventory_reservation_status_idx').on(table.status),
		quantityPositive: check(
			'checkout_inventory_reservation_quantity_check',
			sql`${table.quantity} > 0`
		),
		statusTimestamps: check(
			'checkout_inventory_reservation_status_timestamp_check',
			sql`(${table.status} = 'active' AND ${table.releasedAt} IS NULL AND ${table.consumedAt} IS NULL) OR (${table.status} = 'released' AND ${table.releasedAt} IS NOT NULL AND ${table.consumedAt} IS NULL) OR (${table.status} = 'consumed' AND ${table.consumedAt} IS NOT NULL AND ${table.releasedAt} IS NULL)`
		)
	})
);

export const order = pgTable(
	'order',
	{
		id: serial('id').primaryKey(),
		orderNumber: text('order_number').notNull().unique(),
		checkoutDraftId: text('checkout_draft_id').references(() => checkoutDraft.id),
		userId: text('user_id').references(() => user.id),
		affiliateLinkId: integer('affiliate_link_id').references(() => affiliateLink.id), // Track affiliate attribution
		status: text('status', {
			enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
		})
			.notNull()
			.default('pending'),
		totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
		subtotalAmount: decimal('subtotal_amount', { precision: 10, scale: 2 }).notNull(),
		taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).notNull().default('0.00'),
		shippingAmount: decimal('shipping_amount', { precision: 10, scale: 2 })
			.notNull()
			.default('0.00'),
		discountAmount: decimal('discount_amount', { precision: 10, scale: 2 })
			.notNull()
			.default('0.00'),
		affiliateCommission: decimal('affiliate_commission', { precision: 10, scale: 2 })
			.notNull()
			.default('0.00'),
		shippingAddress: text('shipping_address'), // JSON object
		billingAddress: text('billing_address'), // JSON object
		customerEmail: text('customer_email').notNull(),
		customerPhone: text('customer_phone'),
		notes: text('notes'),
		stripeSessionId: text('stripe_session_id'), // Stripe Checkout session ID
		stripePaymentIntentId: text('stripe_payment_intent_id'), // Stripe PaymentIntent ID
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		orderNumberIdx: uniqueIndex('order_number_idx').on(table.orderNumber),
		userIdx: index('order_user_idx').on(table.userId),
		statusIdx: index('order_status_idx').on(table.status),
		affiliateIdx: index('order_affiliate_idx').on(table.affiliateLinkId),
		dateIdx: index('order_date_idx').on(table.createdAt),
		checkoutDraftIdx: uniqueIndex('order_checkout_draft_id_unique')
			.on(table.checkoutDraftId)
			.where(sql`${table.checkoutDraftId} IS NOT NULL`),
		stripeSessionIdx: uniqueIndex('order_stripe_session_idx')
			.on(table.stripeSessionId)
			.where(sql`${table.stripeSessionId} IS NOT NULL`),
		stripePaymentIntentIdx: uniqueIndex('order_stripe_payment_intent_idx')
			.on(table.stripePaymentIntentId)
			.where(sql`${table.stripePaymentIntentId} IS NOT NULL`)
	})
);

export const orderItem = pgTable('order_item', {
	id: serial('id').primaryKey(),
	orderId: integer('order_id')
		.notNull()
		.references(() => order.id, { onDelete: 'cascade' }),
	productId: integer('product_id')
		.notNull()
		.references(() => product.id),
	productName: text('product_name').notNull(), // Snapshot at time of order
	productSku: text('product_sku').notNull(), // Snapshot at time of order
	quantity: integer('quantity').notNull(),
	unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
	totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const catalogSeedCategory = pgTable(
	'catalog_seed_category',
	{
		sourceId: text('source_id').primaryKey(),
		manifestVersion: text('manifest_version').notNull(),
		manifestHash: text('manifest_hash').notNull(),
		categoryId: integer('category_id')
			.notNull()
			.references(() => productCategory.id, { onDelete: 'restrict' }),
		managedSnapshot: jsonb('managed_snapshot').notNull(),
		managedHash: text('managed_hash').notNull(),
		isRetired: boolean('is_retired').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		categoryIdx: uniqueIndex('catalog_seed_category_category_idx').on(table.categoryId),
		retiredIdx: index('catalog_seed_category_retired_idx').on(table.isRetired),
		manifestHashFormat: check(
			'catalog_seed_category_manifest_hash_check',
			sql`${table.manifestHash} ~ '^[0-9a-f]{64}$'`
		),
		managedHashFormat: check(
			'catalog_seed_category_managed_hash_check',
			sql`${table.managedHash} ~ '^[0-9a-f]{64}$'`
		)
	})
);

export const catalogSeedCollection = pgTable(
	'catalog_seed_collection',
	{
		sourceId: text('source_id').primaryKey(),
		manifestVersion: text('manifest_version').notNull(),
		manifestHash: text('manifest_hash').notNull(),
		categoryId: integer('category_id')
			.notNull()
			.references(() => productCategory.id, { onDelete: 'restrict' }),
		managedSnapshot: jsonb('managed_snapshot').notNull(),
		managedHash: text('managed_hash').notNull(),
		isRetired: boolean('is_retired').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		categoryIdx: uniqueIndex('catalog_seed_collection_category_idx').on(table.categoryId),
		retiredIdx: index('catalog_seed_collection_retired_idx').on(table.isRetired),
		manifestHashFormat: check(
			'catalog_seed_collection_manifest_hash_check',
			sql`${table.manifestHash} ~ '^[0-9a-f]{64}$'`
		),
		managedHashFormat: check(
			'catalog_seed_collection_managed_hash_check',
			sql`${table.managedHash} ~ '^[0-9a-f]{64}$'`
		)
	})
);

export const catalogSeedItem = pgTable(
	'catalog_seed_item',
	{
		sourceId: text('source_id').primaryKey(),
		manifestVersion: text('manifest_version').notNull(),
		manifestHash: text('manifest_hash').notNull(),
		productId: integer('product_id')
			.notNull()
			.references(() => product.id, { onDelete: 'restrict' }),
		offeringKind: text('offering_kind', {
			enum: ['aevani_owned', 'affiliate_only', 'hybrid', 'educational']
		}).notNull(),
		priceSemantics: text('price_semantics', { enum: ['unpriced', 'verified_price'] }).notNull(),
		managedFields: jsonb('managed_fields').notNull(),
		managedSnapshot: jsonb('managed_snapshot').notNull(),
		managedHash: text('managed_hash').notNull(),
		isRetired: boolean('is_retired').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		productIdx: uniqueIndex('catalog_seed_item_product_idx').on(table.productId),
		retiredIdx: index('catalog_seed_item_retired_idx').on(table.isRetired),
		manifestHashFormat: check(
			'catalog_seed_item_manifest_hash_check',
			sql`${table.manifestHash} ~ '^[0-9a-f]{64}$'`
		),
		managedHashFormat: check(
			'catalog_seed_item_managed_hash_check',
			sql`${table.managedHash} ~ '^[0-9a-f]{64}$'`
		)
	})
);

export const catalogSeedRun = pgTable(
	'catalog_seed_run',
	{
		runId: text('run_id').primaryKey(),
		action: text('action', { enum: ['apply', 'rollback'] }).notNull(),
		status: text('status', { enum: ['running', 'applied', 'rolled_back', 'failed'] }).notNull(),
		manifestVersion: text('manifest_version').notNull(),
		manifestHash: text('manifest_hash').notNull(),
		releaseId: text('release_id').notNull(),
		releaseCommit: text('release_commit').notNull(),
		schemaFingerprint: text('schema_fingerprint').notNull(),
		rollbackOfRunId: text('rollback_of_run_id').references(
			(): AnyPgColumn => catalogSeedRun.runId,
			{ onDelete: 'restrict' }
		),
		preimage: jsonb('preimage').notNull(),
		changes: jsonb('changes').notNull(),
		changeHash: text('change_hash').notNull(),
		summary: jsonb('summary').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' })
	},
	(table) => ({
		createdIdx: index('catalog_seed_run_created_idx').on(table.createdAt),
		manifestIdx: index('catalog_seed_run_manifest_idx').on(table.manifestHash, table.completedAt),
		manifestHashFormat: check(
			'catalog_seed_run_manifest_hash_check',
			sql`${table.manifestHash} ~ '^[0-9a-f]{64}$'`
		),
		changeHashFormat: check(
			'catalog_seed_run_change_hash_check',
			sql`${table.changeHash} ~ '^[0-9a-f]{64}$'`
		)
	})
);

export const checkoutPaymentAttempt = pgTable(
	'checkout_payment_attempt',
	{
		id: text('id').primaryKey(),
		draftId: text('draft_id')
			.notNull()
			.references(() => checkoutDraft.id, { onDelete: 'cascade' }),
		attemptNumber: integer('attempt_number').notNull(),
		provider: text('provider', { enum: ['stripe'] })
			.notNull()
			.default('stripe'),
		providerIdempotencyKey: text('provider_idempotency_key').notNull().unique(),
		stripeSessionId: text('stripe_session_id'),
		stripePaymentIntentId: text('stripe_payment_intent_id'),
		status: text('status', {
			enum: [
				'pending_session',
				'checkout_created',
				'quarantined',
				'paid',
				'expired',
				'failed',
				'superseded'
			]
		})
			.notNull()
			.default('pending_session'),
		amountMinor: bigint('amount_minor', { mode: 'number' }).notNull(),
		currency: varchar('currency', { length: 3 }).notNull(),
		lastErrorCode: text('last_error_code'),
		lastErrorMessage: text('last_error_message'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		draftAttemptIdx: uniqueIndex('checkout_payment_attempt_draft_attempt_idx').on(
			table.draftId,
			table.attemptNumber
		),
		idDraftIdx: uniqueIndex('checkout_payment_attempt_id_draft_unique').on(table.id, table.draftId),
		draftIdx: index('checkout_payment_attempt_draft_idx').on(table.draftId),
		activeDraftIdx: uniqueIndex('checkout_payment_attempt_active_draft_idx')
			.on(table.draftId)
			.where(
				sql`${table.status} IN ('pending_session', 'checkout_created', 'quarantined', 'paid')`
			),
		sessionIdx: uniqueIndex('checkout_payment_attempt_stripe_session_idx').on(
			table.stripeSessionId
		),
		paymentIntentIdx: uniqueIndex('checkout_payment_attempt_payment_intent_idx').on(
			table.stripePaymentIntentId
		),
		attemptNumberPositive: check(
			'checkout_payment_attempt_number_check',
			sql`${table.attemptNumber} > 0`
		),
		amountNonnegative: check(
			'checkout_payment_attempt_amount_check',
			sql`${table.amountMinor} >= 0`
		),
		safeMinorAmount: check(
			'checkout_payment_attempt_safe_minor_check',
			sql`${table.amountMinor} <= 9007199254740991`
		),
		currencyFormat: check(
			'checkout_payment_attempt_currency_check',
			sql`${table.currency} ~ '^[a-z]{3}$'`
		)
	})
);

export const stripeWebhookEvent = pgTable(
	'stripe_webhook_event',
	{
		id: text('id').primaryKey(),
		draftId: text('draft_id'),
		paymentAttemptId: text('payment_attempt_id'),
		eventType: text('event_type').notNull(),
		status: text('status', { enum: ['received', 'processing', 'processed', 'ignored', 'failed'] })
			.notNull()
			.default('received'),
		attemptCount: integer('attempt_count').notNull().default(0),
		lastErrorCode: text('last_error_code'),
		lastErrorMessage: text('last_error_message'),
		payloadDigest: text('payload_digest').notNull(),
		receivedAt: timestamp('received_at', { withTimezone: true, mode: 'date' })
			.notNull()
			.defaultNow(),
		processingAt: timestamp('processing_at', { withTimezone: true, mode: 'date' }),
		processedAt: timestamp('processed_at', { withTimezone: true, mode: 'date' })
	},
	(table) => ({
		draftIdx: index('stripe_webhook_event_draft_idx').on(table.draftId),
		attemptIdx: index('stripe_webhook_event_attempt_idx').on(table.paymentAttemptId),
		statusIdx: index('stripe_webhook_event_status_idx').on(table.status),
		attemptDraftFk: foreignKey({
			columns: [table.paymentAttemptId, table.draftId],
			foreignColumns: [checkoutPaymentAttempt.id, checkoutPaymentAttempt.draftId],
			name: 'stripe_webhook_event_payment_attempt_draft_fk'
		}),
		attemptCountNonnegative: check(
			'stripe_webhook_event_attempt_count_check',
			sql`${table.attemptCount} >= 0`
		),
		payloadDigestFormat: check(
			'stripe_webhook_event_payload_digest_check',
			sql`${table.payloadDigest} ~ '^[0-9a-f]{64}$'`
		),
		attemptLink: check(
			'stripe_webhook_event_attempt_link_check',
			sql`(${table.paymentAttemptId} IS NULL) = (${table.draftId} IS NULL)`
		),
		lifecycleTimestamps: check(
			'stripe_webhook_event_lifecycle_timestamp_check',
			sql`(${table.status} = 'received' AND ${table.processingAt} IS NULL AND ${table.processedAt} IS NULL) OR (${table.status} IN ('processing', 'failed') AND ${table.processingAt} IS NOT NULL AND ${table.processedAt} IS NULL) OR (${table.status} IN ('processed', 'ignored') AND ${table.processingAt} IS NOT NULL AND ${table.processedAt} IS NOT NULL)`
		)
	})
);

// A commission fact is immutable. Monetary changes and lifecycle transitions are appended below.
export const affiliateCommissionLedger = pgTable(
	'affiliate_commission_ledger',
	{
		id: text('id').primaryKey(),
		affiliateId: integer('affiliate_id')
			.notNull()
			.references(() => affiliate.id, { onDelete: 'restrict' }),
		affiliateLinkId: integer('affiliate_link_id')
			.notNull()
			.references(() => affiliateLink.id, { onDelete: 'restrict' }),
		sourceOrderId: integer('source_order_id')
			.notNull()
			.references(() => order.id, { onDelete: 'restrict' }),
		sourceCheckoutDraftId: text('source_checkout_draft_id')
			.notNull()
			.references(() => checkoutDraft.id, { onDelete: 'restrict' }),
		sourceStripeWebhookEventId: text('source_stripe_webhook_event_id')
			.notNull()
			.references(() => stripeWebhookEvent.id, { onDelete: 'restrict' }),
		sourceReference: text('source_reference').notNull(),
		currency: varchar('currency', { length: 3 }).notNull(),
		quotedAmountMinor: bigint('quoted_amount_minor', { mode: 'number' }).notNull(),
		commissionRateBps: integer('commission_rate_bps').notNull(),
		draftSnapshotHash: text('draft_snapshot_hash').notNull(),
		tierCode: text('tier_code').notNull(),
		tierVersion: integer('tier_version').notNull(),
		termsVersion: text('terms_version').notNull(),
		disclosureVersion: text('disclosure_version').notNull(),
		termsAcceptanceId: text('terms_acceptance_id').references(() => affiliateTermsAcceptance.id, {
			onDelete: 'restrict'
		}),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		sourceOrderIdx: uniqueIndex('affiliate_commission_ledger_source_order_idx').on(
			table.sourceOrderId
		),
		sourceDraftIdx: uniqueIndex('affiliate_commission_ledger_source_draft_idx').on(
			table.sourceCheckoutDraftId
		),
		sourceReferenceIdx: uniqueIndex('affiliate_commission_ledger_source_reference_idx').on(
			table.sourceReference
		),
		affiliateCreatedIdx: index('affiliate_commission_ledger_affiliate_created_idx').on(
			table.affiliateId,
			table.createdAt
		),
		linkCreatedIdx: index('affiliate_commission_ledger_link_created_idx').on(
			table.affiliateLinkId,
			table.createdAt
		),
		amountPositive: check(
			'affiliate_commission_ledger_amount_check',
			sql`${table.quotedAmountMinor} > 0 AND ${table.quotedAmountMinor} <= 9007199254740991`
		),
		rateRange: check(
			'affiliate_commission_ledger_rate_bps_check',
			sql`${table.commissionRateBps} >= 0 AND ${table.commissionRateBps} <= 10000`
		),
		currencyFormat: check(
			'affiliate_commission_ledger_currency_check',
			sql`${table.currency} ~ '^[a-z]{3}$'`
		),
		tierVersionValid: check(
			'affiliate_commission_ledger_tier_version_check',
			sql`${table.tierVersion} >= 0`
		),
		snapshotHashFormat: check(
			'affiliate_commission_ledger_snapshot_hash_check',
			sql`${table.draftSnapshotHash} ~ '^[0-9a-f]{64}$'`
		)
	})
);

// Pending, approval, reversal, payable, and paid records form the immutable commission ledger.
export const affiliateCommissionLedgerEvent = pgTable(
	'affiliate_commission_ledger_event',
	{
		id: text('id').primaryKey(),
		commissionId: text('commission_id')
			.notNull()
			.references(() => affiliateCommissionLedger.id, { onDelete: 'restrict' }),
		eventType: text('event_type', {
			enum: ['pending', 'approved', 'reversed', 'payable', 'paid']
		}).notNull(),
		amountDeltaMinor: bigint('amount_delta_minor', { mode: 'number' }).notNull(),
		currency: varchar('currency', { length: 3 }).notNull(),
		payoutId: text('payout_id').references(() => affiliatePayout.id, { onDelete: 'restrict' }),
		eventReference: text('event_reference').notNull(),
		causationReference: text('causation_reference'),
		reasonCode: text('reason_code', {
			enum: ['initial_accrual', 'refund', 'chargeback', 'manual_adjustment', 'payout']
		}).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		eventReferenceIdx: uniqueIndex('affiliate_commission_ledger_event_reference_idx').on(
			table.eventReference
		),
		singleLifecycleIdx: uniqueIndex('affiliate_commission_ledger_event_single_lifecycle_idx')
			.on(table.commissionId, table.eventType)
			.where(sql`${table.eventType} IN ('pending', 'approved', 'payable', 'paid')`),
		commissionCreatedIdx: index('affiliate_commission_ledger_event_commission_created_idx').on(
			table.commissionId,
			table.createdAt
		),
		payoutCreatedIdx: index('affiliate_commission_ledger_event_payout_created_idx').on(
			table.payoutId,
			table.createdAt
		),
		amountRange: check(
			'affiliate_commission_ledger_event_amount_range_check',
			sql`${table.amountDeltaMinor} >= -9007199254740991 AND ${table.amountDeltaMinor} <= 9007199254740991`
		),
		eventAmountShape: check(
			'affiliate_commission_ledger_event_amount_shape_check',
			sql`(${table.eventType} = 'pending' AND ${table.amountDeltaMinor} > 0) OR (${table.eventType} = 'reversed' AND ${table.amountDeltaMinor} < 0) OR (${table.eventType} IN ('approved', 'payable', 'paid') AND ${table.amountDeltaMinor} = 0)`
		),
		currencyFormat: check(
			'affiliate_commission_ledger_event_currency_check',
			sql`${table.currency} ~ '^[a-z]{3}$'`
		),
		payoutLifecycleLink: check(
			'affiliate_commission_ledger_event_payout_link_check',
			sql`(${table.eventType} IN ('payable', 'paid')) = (${table.payoutId} IS NOT NULL)`
		)
	})
);

export const guestOrderAccessGrant = pgTable(
	'guest_order_access_grant',
	{
		id: text('id').primaryKey(),
		draftId: text('draft_id')
			.notNull()
			.references(() => checkoutDraft.id, { onDelete: 'cascade' }),
		tokenHash: text('token_hash').notNull().unique(),
		scope: text('scope', { enum: ['confirmation'] })
			.notNull()
			.default('confirmation'),
		expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
		revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'date' }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		draftIdx: index('guest_order_access_grant_draft_idx').on(table.draftId),
		expiresIdx: index('guest_order_access_grant_expires_idx').on(table.expiresAt),
		tokenHashFormat: check(
			'guest_order_access_grant_token_hash_check',
			sql`${table.tokenHash} ~ '^[0-9a-f]{64}$'`
		)
	})
);

// ======= FILE STORAGE =======
export const file = pgTable(
	'file',
	{
		id: text('id').primaryKey(), // UUID v4
		filename: text('filename').notNull(),
		originalFilename: text('original_filename').notNull(),
		mimeType: text('mime_type').notNull(),
		fileSize: integer('file_size').notNull(), // Size in bytes
		bucketPath: text('bucket_path').notNull(), // Full S3 object key
		bucketName: text('bucket_name').notNull().default('aevani-assets'),
		entityType: text('entity_type', { enum: ['user', 'product', 'content', 'lms', 'general'] })
			.notNull()
			.default('general'),
		entityId: text('entity_id'), // Foreign key to the related entity (user.id, product.id, etc.)
		uploadedBy: text('uploaded_by').references(() => user.id),
		isPublic: boolean('is_public').notNull().default(false),
		metadata: text('metadata'), // JSON string for additional file info
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		bucketPathIdx: uniqueIndex('file_bucket_path_idx').on(table.bucketPath),
		entityIdx: index('file_entity_idx').on(table.entityType, table.entityId),
		uploadedByIdx: index('file_uploaded_by_idx').on(table.uploadedBy),
		createdIdx: index('file_created_idx').on(table.createdAt)
	})
);

// ======= CMS CONTENT =======
export const contentPage = pgTable(
	'content_page',
	{
		id: serial('id').primaryKey(),
		title: text('title').notNull(),
		slug: text('slug').notNull().unique(),
		content: text('content'), // Rich text/markdown content
		excerpt: text('excerpt'),
		type: text('type', { enum: ['page', 'blog_post', 'guide', 'faq'] })
			.notNull()
			.default('page'),
		status: text('status', { enum: ['draft', 'published', 'archived'] })
			.notNull()
			.default('draft'),
		authorId: text('author_id')
			.notNull()
			.references(() => user.id),
		featuredImageFileId: text('featured_image_file_id'), // Reference to file table
		metaTitle: text('meta_title'),
		metaDescription: text('meta_description'),
		tags: text('tags'), // JSON array
		publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => ({
		slugIdx: uniqueIndex('content_page_slug_idx').on(table.slug),
		typeIdx: index('content_page_type_idx').on(table.type),
		statusIdx: index('content_page_status_idx').on(table.status),
		authorIdx: index('content_page_author_idx').on(table.authorId),
		publishedIdx: index('content_page_published_idx').on(table.publishedAt)
	})
);

// ======= AUDIT LOG =======
export const auditLog = pgTable('audit_log', {
	id: serial('id').primaryKey(),
	timestamp: timestamp('timestamp', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	userId: text('user_id').references(() => user.id),
	action: text('action').notNull(),
	details: text('details') // JSON string for additional details
});

// ======= NOTIFICATIONS =======
export const notification = pgTable(
	'notification',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		type: text('type', {
			enum: ['order_update', 'affiliate_earning', 'affiliate_conversion', 'admin_alert', 'system']
		}).notNull(),
		title: text('title').notNull(),
		message: text('message').notNull(),
		isRead: boolean('is_read').notNull().default(false),
		link: text('link'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		userReadIdx: index('notification_user_read_idx').on(table.userId, table.isRead),
		createdIdx: index('notification_created_idx').on(table.createdAt)
	})
);

// ======= RELATIONS ========
export const userRelations = relations(user, ({ many, one }) => ({
	sessions: many(session),
	affiliate: one(affiliate),
	contentPages: many(contentPage),
	orders: many(order),
	uploadedFiles: many(file, { relationName: 'file_uploaded_by' }),
	avatarFile: one(file, {
		fields: [user.avatarFileId],
		references: [file.id],
		relationName: 'user_avatar_file'
	}),
	notifications: many(notification)
}));

export const affiliateRelations = relations(affiliate, ({ one, many }) => ({
	user: one(user, {
		fields: [affiliate.userId],
		references: [user.id]
	}),
	links: many(affiliateLink),
	termsAcceptances: many(affiliateTermsAcceptance),
	payouts: many(affiliatePayout),
	commissionLedgerEntries: many(affiliateCommissionLedger)
}));

export const affiliateLinkRelations = relations(affiliateLink, ({ one, many }) => ({
	affiliate: one(affiliate, {
		fields: [affiliateLink.affiliateId],
		references: [affiliate.id]
	}),
	product: one(product, {
		fields: [affiliateLink.productId],
		references: [product.id]
	}),
	clicks: many(affiliateClick),
	attributions: many(affiliateAttribution),
	attributionClicks: many(affiliateAttributionClick),
	clickDedupeRecords: many(affiliateClickDedupe),
	orders: many(order),
	commissionLedgerEntries: many(affiliateCommissionLedger)
}));

export const affiliateTermsAcceptanceRelations = relations(affiliateTermsAcceptance, ({ one }) => ({
	affiliate: one(affiliate, {
		fields: [affiliateTermsAcceptance.affiliateId],
		references: [affiliate.id]
	})
}));

export const affiliatePayoutRelations = relations(affiliatePayout, ({ one, many }) => ({
	affiliate: one(affiliate, {
		fields: [affiliatePayout.affiliateId],
		references: [affiliate.id]
	}),
	ledgerEvents: many(affiliateCommissionLedgerEvent)
}));

export const affiliateAttributionRelations = relations(affiliateAttribution, ({ one, many }) => ({
	affiliateLink: one(affiliateLink, {
		fields: [affiliateAttribution.affiliateLinkId],
		references: [affiliateLink.id]
	}),
	clicks: many(affiliateAttributionClick)
}));

export const affiliateAttributionClickRelations = relations(
	affiliateAttributionClick,
	({ one }) => ({
		affiliateLink: one(affiliateLink, {
			fields: [affiliateAttributionClick.affiliateLinkId],
			references: [affiliateLink.id]
		}),
		attribution: one(affiliateAttribution, {
			fields: [affiliateAttributionClick.affiliateAttributionId],
			references: [affiliateAttribution.id]
		})
	})
);

export const affiliateClickDedupeRelations = relations(affiliateClickDedupe, ({ one }) => ({
	affiliateLink: one(affiliateLink, {
		fields: [affiliateClickDedupe.affiliateLinkId],
		references: [affiliateLink.id]
	})
}));

export const productRelations = relations(product, ({ one, many }) => ({
	category: one(productCategory, {
		fields: [product.categoryId],
		references: [productCategory.id]
	}),
	images: many(productImage),
	reviews: many(productReview),
	affiliateLinks: many(affiliateLink),
	cartItems: many(cartItem),
	orderItems: many(orderItem)
}));

export const productReviewRelations = relations(productReview, ({ one }) => ({
	product: one(product, {
		fields: [productReview.productId],
		references: [product.id]
	})
}));

export const productImageRelations = relations(productImage, ({ one }) => ({
	product: one(product, {
		fields: [productImage.productId],
		references: [product.id]
	}),
	file: one(file, {
		fields: [productImage.fileId],
		references: [file.id],
		relationName: 'product_image_file'
	})
}));

export const productCategoryRelations = relations(productCategory, ({ one, many }) => ({
	parent: one(productCategory, {
		fields: [productCategory.parentId],
		references: [productCategory.id]
	}),
	children: many(productCategory),
	products: many(product)
}));

export const orderRelations = relations(order, ({ one, many }) => ({
	user: one(user, {
		fields: [order.userId],
		references: [user.id]
	}),
	affiliateLink: one(affiliateLink, {
		fields: [order.affiliateLinkId],
		references: [affiliateLink.id]
	}),
	items: many(orderItem),
	commissionLedgerEntries: many(affiliateCommissionLedger)
}));

export const affiliateCommissionLedgerRelations = relations(
	affiliateCommissionLedger,
	({ one, many }) => ({
		affiliate: one(affiliate, {
			fields: [affiliateCommissionLedger.affiliateId],
			references: [affiliate.id]
		}),
		affiliateLink: one(affiliateLink, {
			fields: [affiliateCommissionLedger.affiliateLinkId],
			references: [affiliateLink.id]
		}),
		sourceOrder: one(order, {
			fields: [affiliateCommissionLedger.sourceOrderId],
			references: [order.id]
		}),
		sourceCheckoutDraft: one(checkoutDraft, {
			fields: [affiliateCommissionLedger.sourceCheckoutDraftId],
			references: [checkoutDraft.id]
		}),
		sourceStripeWebhookEvent: one(stripeWebhookEvent, {
			fields: [affiliateCommissionLedger.sourceStripeWebhookEventId],
			references: [stripeWebhookEvent.id]
		}),
		events: many(affiliateCommissionLedgerEvent)
	})
);

export const affiliateCommissionLedgerEventRelations = relations(
	affiliateCommissionLedgerEvent,
	({ one }) => ({
		commission: one(affiliateCommissionLedger, {
			fields: [affiliateCommissionLedgerEvent.commissionId],
			references: [affiliateCommissionLedger.id]
		}),
		payout: one(affiliatePayout, {
			fields: [affiliateCommissionLedgerEvent.payoutId],
			references: [affiliatePayout.id]
		})
	})
);

export const fileRelations = relations(file, ({ one }) => ({
	uploadedBy: one(user, {
		fields: [file.uploadedBy],
		references: [user.id],
		relationName: 'file_uploaded_by'
	})
}));

export const contentPageRelations = relations(contentPage, ({ one }) => ({
	author: one(user, {
		fields: [contentPage.authorId],
		references: [user.id]
	}),
	featuredImageFile: one(file, {
		fields: [contentPage.featuredImageFileId],
		references: [file.id],
		relationName: 'content_page_featured_image'
	})
}));

// ======= CMS SEO FIELDS =======
export const cmsSeoFields = pgTable(
	'cms_seo_fields',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		pageId: text('page_id').notNull().unique(),
		pageType: text('page_type', {
			enum: ['page', 'product', 'category', 'post', 'home']
		})
			.notNull()
			.default('page'),
		metaTitle: text('meta_title'),
		metaDescription: text('meta_description'),
		ogTitle: text('og_title'),
		ogDescription: text('og_description'),
		ogImage: text('og_image'),
		robots: text('robots').default('index, follow'),
		canonicalUrl: text('canonical_url'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
	},
	(table) => ({
		pageIdIdx: uniqueIndex('cms_seo_page_id_idx').on(table.pageId)
	})
);

export const cmsContent = pgTable(
	'cms_content',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		slug: text('slug').notNull().unique(),
		title: text('title').notNull(),
		content: text('content'),
		excerpt: text('excerpt'),
		status: text('status', {
			enum: ['draft', 'published', 'archived']
		})
			.notNull()
			.default('draft'),
		authorId: text('author_id').references(() => user.id), // ← FIXED: text not uuid
		seoFieldsId: uuid('seo_fields_id').references(() => cmsSeoFields.id),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
		publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' })
	},
	(table) => ({
		slugIdx: uniqueIndex('cms_content_slug_idx').on(table.slug),
		statusIdx: index('cms_content_status_idx').on(table.status),
		authorIdx: index('cms_content_author_idx').on(table.authorId)
	})
);

// ======= EXPORTED TYPES =======
export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Product = typeof product.$inferSelect;
export type ProductReview = typeof productReview.$inferSelect;
export type ProductCategory = typeof productCategory.$inferSelect;
export type CatalogSeedCategory = typeof catalogSeedCategory.$inferSelect;
export type CatalogSeedCollection = typeof catalogSeedCollection.$inferSelect;
export type CatalogSeedItem = typeof catalogSeedItem.$inferSelect;
export type CatalogSeedRun = typeof catalogSeedRun.$inferSelect;
export type Affiliate = typeof affiliate.$inferSelect;
export type AffiliateLink = typeof affiliateLink.$inferSelect;
export type AffiliateAttribution = typeof affiliateAttribution.$inferSelect;
export type AffiliateAttributionClick = typeof affiliateAttributionClick.$inferSelect;
export type AffiliateClickDedupe = typeof affiliateClickDedupe.$inferSelect;
export type AffiliateTier = typeof affiliateTier.$inferSelect;
export type AffiliateTermsAcceptance = typeof affiliateTermsAcceptance.$inferSelect;
export type AffiliatePayout = typeof affiliatePayout.$inferSelect;
export type AffiliateCommissionLedger = typeof affiliateCommissionLedger.$inferSelect;
export type AffiliateCommissionLedgerEvent = typeof affiliateCommissionLedgerEvent.$inferSelect;
export type Order = typeof order.$inferSelect;
export type ContentPage = typeof contentPage.$inferSelect;
export type File = typeof file.$inferSelect;
export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type AccountLock = typeof accountLocks.$inferSelect;
export type EmailChangeCapability = typeof emailChangeCapability.$inferSelect;
export type PasswordResetToken = typeof passwordResetToken.$inferSelect;
export type SocialAccount = typeof socialAccounts.$inferSelect;
export type Notification = typeof notification.$inferSelect;

export const notificationRelations = relations(notification, ({ one }) => ({
	user: one(user, {
		fields: [notification.userId],
		references: [user.id]
	})
}));
