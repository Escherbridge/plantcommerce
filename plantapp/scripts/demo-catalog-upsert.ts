/**
 * Prod-safe, idempotent demo-catalogue upsert.
 *
 * Loads the canonical 40-product dataset (`src/lib/server/db/catalogDemo.ts`)
 * and UPSERTS ONLY catalogue data:
 *   - product_category   (by slug)
 *   - product            (by slug — insert or update catalogue columns)
 *   - file + product_image (reconciled per managed product)
 *   - product_review     (replaced per managed product)
 *
 * It NEVER deletes or touches users, orders, carts, wishlists, affiliates,
 * sessions, checkout drafts, LMS, or any other non-catalogue table, and it
 * never wipes anything. Inventory columns (stock/reserved quantity) on existing
 * products are deliberately preserved so a catalogue sync cannot clobber live
 * stock levels.
 *
 * Guard: refuses to run unless DEMO_CATALOG_UPSERT_CONFIRM === 'UPSERT_CATALOG'.
 *
 * Usage:
 *   DEMO_CATALOG_UPSERT_CONFIRM=UPSERT_CATALOG DATABASE_URL=... \
 *     npx tsx scripts/demo-catalog-upsert.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import * as schema from '../src/lib/server/db/schema';
import {
	demoCategories,
	demoProducts,
	computeRatingSummary,
	resolveAssetUrls,
	assetUrlToBucketPath,
	deriveProductColumns,
	type DemoCategory
} from '../src/lib/server/db/catalogDemo';

function requireConfirmation(): void {
	if (process.env.DEMO_CATALOG_UPSERT_CONFIRM !== 'UPSERT_CATALOG') {
		throw new Error(
			"Refusing to run: set DEMO_CATALOG_UPSERT_CONFIRM='UPSERT_CATALOG' to upsert the demo catalogue."
		);
	}
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	console.error('DATABASE_URL environment variable is required');
	process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema });

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Upsert one category by slug, resolving parent first. Returns its id. */
async function upsertCategory(
	tx: Tx,
	cat: DemoCategory,
	parentId: number | null,
	sortOrder: number
): Promise<number> {
	const [row] = await tx
		.insert(schema.productCategory)
		.values({
			name: cat.name,
			slug: cat.slug,
			description: cat.description,
			parentId,
			sortOrder,
			isActive: true,
			updatedAt: new Date()
		})
		.onConflictDoUpdate({
			target: schema.productCategory.slug,
			set: {
				name: cat.name,
				description: cat.description,
				parentId,
				sortOrder,
				isActive: true,
				updatedAt: new Date()
			}
		})
		.returning({ id: schema.productCategory.id });
	return row.id;
}

async function run(): Promise<void> {
	requireConfirmation();
	console.log('=== Aevani demo catalogue upsert (prod-safe, idempotent) ===\n');

	const summary = {
		categories: 0,
		productsInserted: 0,
		productsUpdated: 0,
		files: 0,
		images: 0,
		reviews: 0
	};

	await db.transaction(async (tx) => {
		// --- 1. Categories (parents first, then children) ---
		const categoryIdMap = new Map<string, number>(); // slug -> id
		for (let i = 0; i < demoCategories.length; i++) {
			const parent = demoCategories[i];
			const parentId = await upsertCategory(tx, parent, null, i);
			categoryIdMap.set(parent.slug, parentId);
			summary.categories++;

			for (let j = 0; j < (parent.children?.length ?? 0); j++) {
				const child = parent.children![j];
				const childId = await upsertCategory(tx, child, parentId, j);
				categoryIdMap.set(child.slug, childId);
				summary.categories++;
			}
		}

		// --- 2. Products (upsert by slug) + files + images + reviews ---
		const productIdMap = new Map<string, number>(); // slug -> id
		const fileIdByBucketPath = new Map<string, string>(); // bucketPath -> file.id

		for (const p of demoProducts) {
			const categoryId = categoryIdMap.get(p.categorySlug);
			if (!categoryId) {
				console.warn(`  [WARN] Category not found for "${p.name}" (slug: ${p.categorySlug})`);
				continue;
			}

			const derived = deriveProductColumns(p);
			const { ratingAverage, reviewCount } = computeRatingSummary(p.reviews);

			// Catalogue columns updated on every run. Inventory (stock/reserved)
			// and cost are set on INSERT only, never overwritten on existing rows.
			const catalogueColumns = {
				name: p.name,
				description: p.shortDescription,
				shortDescription: p.shortDescription,
				sku: p.sku,
				price: p.price,
				comparePrice: p.compareAt ?? null,
				categoryId,
				isActive: true,
				isFeatured: p.isFeatured,
				tags: JSON.stringify(derived.tags),
				metaTitle: derived.metaTitle,
				metaDescription: derived.metaDescription,
				descriptionHtml: p.descriptionHtml,
				keyFeatures: p.keyFeatures,
				stats: p.stats,
				specs: p.specs,
				inTheBox: p.inTheBox,
				faqs: p.faqs,
				badges: p.badges,
				testBedNote: p.testBedNote,
				warranty: p.warranty,
				shippingNote: p.shippingNote,
				bundleOffer: p.bundleOffer ?? null,
				currency: 'USD',
				ratingAverage,
				reviewCount,
				updatedAt: new Date()
			};

			const existing = await tx
				.select({ id: schema.product.id })
				.from(schema.product)
				.where(eq(schema.product.slug, p.slug))
				.limit(1);
			const isInsert = existing.length === 0;

			const [row] = await tx
				.insert(schema.product)
				.values({
					...catalogueColumns,
					slug: p.slug,
					costPrice: derived.costPrice,
					stockQuantity: derived.stockQuantity,
					trackInventory: true
				})
				.onConflictDoUpdate({
					target: schema.product.slug,
					set: catalogueColumns // note: stock/reserved/cost intentionally omitted
				})
				.returning({ id: schema.product.id });

			const productId = row.id;
			productIdMap.set(p.slug, productId);
			if (isInsert) summary.productsInserted++;
			else summary.productsUpdated++;

			// --- Files (upsert by bucketPath) + reconcile product_image ---
			const assetUrls = resolveAssetUrls(p);
			const desiredFileIds: string[] = [];
			for (const assetUrl of assetUrls) {
				const bucketPath = assetUrlToBucketPath(assetUrl);
				let fileId = fileIdByBucketPath.get(bucketPath);
				if (!fileId) {
					const basename = bucketPath.split('/').pop() ?? bucketPath;
					const [fileRow] = await tx
						.insert(schema.file)
						.values({
							id: randomUUID(),
							filename: basename,
							originalFilename: basename,
							mimeType: 'image/png',
							fileSize: 0,
							bucketPath,
							bucketName: process.env.S3_BUCKET_NAME || 'aevani-assets',
							entityType: 'product',
							entityId: String(productId),
							isPublic: true,
							metadata: JSON.stringify({ source: 'demo-catalog-upsert', assetKey: p.assetKey }),
							updatedAt: new Date()
						})
						.onConflictDoUpdate({
							target: schema.file.bucketPath,
							set: { isPublic: true, entityType: 'product', updatedAt: new Date() }
						})
						.returning({ id: schema.file.id });
					fileId = fileRow.id;
					fileIdByBucketPath.set(bucketPath, fileId);
					summary.files++;
				}
				desiredFileIds.push(fileId);
			}

			// Replace this product's image rows with the desired ordered set.
			await tx.delete(schema.productImage).where(eq(schema.productImage.productId, productId));
			for (let i = 0; i < desiredFileIds.length; i++) {
				await tx.insert(schema.productImage).values({
					productId,
					fileId: desiredFileIds[i],
					altText: p.name,
					sortOrder: i,
					isMain: i === 0
				});
				summary.images++;
			}

			// --- Reviews (replace by product) ---
			await tx.delete(schema.productReview).where(eq(schema.productReview.productId, productId));
			if (p.reviews.length > 0) {
				await tx.insert(schema.productReview).values(
					p.reviews.map((r) => ({
						productId,
						authorName: r.authorName,
						rating: r.rating,
						title: r.title,
						body: r.body,
						isVerifiedPurchase: r.isVerifiedPurchase
					}))
				);
				summary.reviews += p.reviews.length;
			}
		}

		// --- 3. Curated related products (3 peers referenced by slug), now that ids exist ---
		for (const p of demoProducts) {
			const id = productIdMap.get(p.slug);
			if (!id) continue;
			const related = p.relatedSlugs
				.map((slug) => productIdMap.get(slug))
				.filter((x): x is number => typeof x === 'number');
			await tx
				.update(schema.product)
				.set({ relatedProductIds: related.length > 0 ? related : null })
				.where(eq(schema.product.id, id));
		}
	});

	console.log('Upsert complete:');
	console.log(`  Categories upserted:   ${summary.categories}`);
	console.log(`  Products inserted:     ${summary.productsInserted}`);
	console.log(`  Products updated:      ${summary.productsUpdated}`);
	console.log(`  Asset files upserted:  ${summary.files}`);
	console.log(`  Product images:        ${summary.images}`);
	console.log(`  Product reviews:       ${summary.reviews}`);
	console.log('\n  No users, orders, carts, wishlists, affiliates, or inventory were modified.\n');
}

run()
	.then(async () => {
		await client.end();
		console.log('Done. Closing connection.');
		process.exit(0);
	})
	.catch(async (err) => {
		console.error('Demo catalogue upsert failed:', err);
		try {
			await client.end();
		} catch {
			// ignore
		}
		process.exit(1);
	});
