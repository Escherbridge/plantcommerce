import { pgTable, serial, integer, text, timestamp, decimal, boolean, uuid, varchar, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ======= USER MANAGEMENT =======
export const user = pgTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	firstName: text('first_name'),
	lastName: text('last_name'),
	avatarFileId: text('avatar_file_id'), // Reference to file table
	role: text('role', { enum: ['admin', 'customer', 'affiliate'] }).notNull().default('customer'),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

// ======= PRODUCT CATALOG =======
export const productCategory: any = pgTable('product_category', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	parentId: integer('parent_id').references(() => productCategory.id),
	sortOrder: integer('sort_order').notNull().default(0),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const product = pgTable('product', {
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
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	nameIdx: index('product_name_idx').on(table.name),
	skuIdx: index('product_sku_idx').on(table.sku),
	categoryIdx: index('product_category_idx').on(table.categoryId),
	activeIdx: index('product_active_idx').on(table.isActive),
	featuredIdx: index('product_featured_idx').on(table.isFeatured)
}));

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

// ======= AFFILIATE SYSTEM =======
export const affiliate = pgTable('affiliate', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	affiliateCode: text('affiliate_code').notNull().unique(),
	commissionRate: decimal('commission_rate', { precision: 5, scale: 4 }).notNull().default('0.05'), // 5% default
	totalEarnings: decimal('total_earnings', { precision: 12, scale: 2 }).notNull().default('0.00'),
	totalClicks: integer('total_clicks').notNull().default(0),
	totalConversions: integer('total_conversions').notNull().default(0),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	codeIdx: uniqueIndex('affiliate_code_idx').on(table.affiliateCode),
	userIdx: index('affiliate_user_idx').on(table.userId)
}));

export const affiliateLink = pgTable('affiliate_link', {
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
}, (table) => ({
	linkCodeIdx: uniqueIndex('affiliate_link_code_idx').on(table.linkCode),
	affiliateIdx: index('affiliate_link_affiliate_idx').on(table.affiliateId),
	productIdx: index('affiliate_link_product_idx').on(table.productId)
}));

export const affiliateClick = pgTable('affiliate_click', {
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
}, (table) => ({
	linkIdx: index('affiliate_click_link_idx').on(table.affiliateLinkId),
	sessionIdx: index('affiliate_click_session_idx').on(table.sessionId),
	dateIdx: index('affiliate_click_date_idx').on(table.clickedAt)
}));

// ======= ORDERS & SHOPPING =======
export const cart = pgTable('cart', {
	id: serial('id').primaryKey(),
	userId: text('user_id').references(() => user.id), // Null for guest carts
	sessionId: text('session_id'), // For guest carts
	affiliateLinkId: integer('affiliate_link_id').references(() => affiliateLink.id), // Track affiliate attribution
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

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

export const order = pgTable('order', {
	id: serial('id').primaryKey(),
	orderNumber: text('order_number').notNull().unique(),
	userId: text('user_id').references(() => user.id),
	affiliateLinkId: integer('affiliate_link_id').references(() => affiliateLink.id), // Track affiliate attribution
	status: text('status', { 
		enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] 
	}).notNull().default('pending'),
	totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
	subtotalAmount: decimal('subtotal_amount', { precision: 10, scale: 2 }).notNull(),
	taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).notNull().default('0.00'),
	shippingAmount: decimal('shipping_amount', { precision: 10, scale: 2 }).notNull().default('0.00'),
	discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).notNull().default('0.00'),
	affiliateCommission: decimal('affiliate_commission', { precision: 10, scale: 2 }).notNull().default('0.00'),
	shippingAddress: text('shipping_address'), // JSON object
	billingAddress: text('billing_address'), // JSON object
	customerEmail: text('customer_email').notNull(),
	customerPhone: text('customer_phone'),
	notes: text('notes'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	orderNumberIdx: uniqueIndex('order_number_idx').on(table.orderNumber),
	userIdx: index('order_user_idx').on(table.userId),
	statusIdx: index('order_status_idx').on(table.status),
	affiliateIdx: index('order_affiliate_idx').on(table.affiliateLinkId),
	dateIdx: index('order_date_idx').on(table.createdAt)
}));

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

// ======= FILE STORAGE =======
export const file = pgTable('file', {
	id: text('id').primaryKey(), // UUID v4
	filename: text('filename').notNull(),
	originalFilename: text('original_filename').notNull(),
	mimeType: text('mime_type').notNull(),
	fileSize: integer('file_size').notNull(), // Size in bytes
	bucketPath: text('bucket_path').notNull(), // Full GCS path
	bucketName: text('bucket_name').notNull().default('aevani-files'),
	entityType: text('entity_type', { enum: ['user', 'product', 'content', 'general'] }).notNull().default('general'),
	entityId: text('entity_id'), // Foreign key to the related entity (user.id, product.id, etc.)
	uploadedBy: text('uploaded_by').references(() => user.id),
	isPublic: boolean('is_public').notNull().default(false),
	metadata: text('metadata'), // JSON string for additional file info
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	bucketPathIdx: uniqueIndex('file_bucket_path_idx').on(table.bucketPath),
	entityIdx: index('file_entity_idx').on(table.entityType, table.entityId),
	uploadedByIdx: index('file_uploaded_by_idx').on(table.uploadedBy),
	createdIdx: index('file_created_idx').on(table.createdAt)
}));

// ======= CMS CONTENT =======
export const contentPage = pgTable('content_page', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	slug: text('slug').notNull().unique(),
	content: text('content'), // Rich text/markdown content
	excerpt: text('excerpt'),
	type: text('type', { enum: ['page', 'blog_post', 'guide', 'faq'] }).notNull().default('page'),
	status: text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('draft'),
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
}, (table) => ({
	slugIdx: uniqueIndex('content_page_slug_idx').on(table.slug),
	typeIdx: index('content_page_type_idx').on(table.type),
	statusIdx: index('content_page_status_idx').on(table.status),
	authorIdx: index('content_page_author_idx').on(table.authorId),
	publishedIdx: index('content_page_published_idx').on(table.publishedAt)
}));

// ======= AUDIT LOG =======
export const auditLog = pgTable('audit_log', {
	id: serial('id').primaryKey(),
	timestamp: timestamp('timestamp', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	userId: text('user_id').references(() => user.id),
	action: text('action').notNull(),
	details: text('details'), // JSON string for additional details
});

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
	})
}));

export const affiliateRelations = relations(affiliate, ({ one, many }) => ({
	user: one(user, {
		fields: [affiliate.userId],
		references: [user.id]
	}),
	links: many(affiliateLink)
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
	orders: many(order)
}));

export const productRelations = relations(product, ({ one, many }) => ({
	category: one(productCategory, {
		fields: [product.categoryId],
		references: [productCategory.id]
	}),
	images: many(productImage),
	affiliateLinks: many(affiliateLink),
	cartItems: many(cartItem),
	orderItems: many(orderItem)
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
	items: many(orderItem)
}));

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

// ======= EXPORTED TYPES =======
export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Product = typeof product.$inferSelect;
export type ProductCategory = typeof productCategory.$inferSelect;
export type Affiliate = typeof affiliate.$inferSelect;
export type AffiliateLink = typeof affiliateLink.$inferSelect;
export type Order = typeof order.$inferSelect;
export type ContentPage = typeof contentPage.$inferSelect;
export type File = typeof file.$inferSelect;
