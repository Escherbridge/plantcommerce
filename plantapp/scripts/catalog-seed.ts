import { createHash, randomUUID } from 'node:crypto';
import postgres from 'postgres';
import {
	assertLaunchCatalogManifest,
	launchCatalogCandidates,
	launchCatalogCategories,
	launchCatalogCollections,
	launchCatalogManifest,
	launchCatalogManifestHash,
	launchCatalogManifestNamespace,
	type LaunchCatalogCandidate,
	type LaunchCatalogCategory,
	type LaunchCatalogCollection
} from '../src/lib/server/catalogSeed/launchManifest';

type Sql = postgres.Sql;
type Command = 'plan' | 'apply' | 'verify' | 'rollback';
type JsonValue = string | number | boolean | null | JsonRecord | JsonValue[];
type JsonRecord = Record<string, JsonValue>;

type Identity = Readonly<{
	projectId: string;
	environmentId: string;
	serviceId: string;
	databaseId: string;
	releaseId: string;
	releaseCommit: string;
}>;

type ManagedCategoryRow = {
	source_id: string;
	manifest_version: string;
	manifest_hash: string;
	category_id: number;
	managed_snapshot: JsonRecord;
	managed_hash: string;
	is_retired: boolean;
	name: string;
	slug: string;
	description: string | null;
	parent_id: number | null;
	sort_order: number;
	is_active: boolean;
};

type ManagedProductRow = {
	source_id: string;
	manifest_version: string;
	manifest_hash: string;
	product_id: number;
	offering_kind: string;
	price_semantics: string;
	managed_fields: JsonValue;
	managed_snapshot: JsonRecord;
	managed_hash: string;
	is_retired: boolean;
	name: string;
	slug: string;
	description: string | null;
	short_description: string | null;
	sku: string;
	price: string;
	compare_price: string | null;
	cost_price: string | null;
	stock_quantity: number;
	reserved_quantity: number;
	track_inventory: boolean;
	weight: string | null;
	dimensions: string | null;
	category_id: number;
	is_active: boolean;
	is_featured: boolean;
	tags: string | null;
	meta_title: string | null;
	meta_description: string | null;
};

type ManagedCollectionRow = {
	source_id: string;
	manifest_version: string;
	manifest_hash: string;
	category_id: number;
	managed_snapshot: JsonRecord;
	managed_hash: string;
	is_retired: boolean;
};

type Preflight = {
	schemaFingerprint: string;
	seedTablesReady: boolean;
	counts: JsonRecord;
	invalidCommerceCount: number;
	orphanImageCount: number;
	multiplePrimaryImageCount: number;
	duplicateCategorySlugCount: number;
	duplicateProductSlugCount: number;
	duplicateProductSkuCount: number;
	duplicateBucketPathCount: number;
	categoryRows: ManagedCategoryRow[];
	collectionRows: ManagedCollectionRow[];
	productRows: ManagedProductRow[];
	matchingProductRows: Array<{ id: number; slug: string; sku: string }>;
	matchingCategoryRows: Array<{ id: number; slug: string }>;
};

type PlannedChange = Readonly<{
	sourceId: string;
	kind: 'category' | 'collection' | 'product';
	action: 'create' | 'update' | 'deactivate' | 'unchanged' | 'conflict';
	reason: string;
}>;

type Plan = Readonly<{
	changes: readonly PlannedChange[];
	conflicts: readonly PlannedChange[];
}>;

const catalogTables = [
	'product_category',
	'product',
	'file',
	'product_image',
	'catalog_seed_category',
	'catalog_seed_collection',
	'catalog_seed_item',
	'catalog_seed_run'
] as const;

function canonicalize(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(canonicalize);
	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value as JsonRecord)
				.sort(([left], [right]) => left.localeCompare(right))
				.map(([key, child]) => [key, canonicalize(child)])
		);
	}
	return value;
}

function hash(value: unknown): string {
	return createHash('sha256')
		.update(JSON.stringify(canonicalize(value)))
		.digest('hex');
}

function required(name: string): string {
	const value = process.env[name]?.trim();
	if (!value) throw new Error(`${name} is required.`);
	return value;
}

function readCommand(): Command {
	const command = process.argv[2];
	if (command === 'plan' || command === 'apply' || command === 'verify' || command === 'rollback')
		return command;
	throw new Error('Usage: npx tsx scripts/catalog-seed.ts <plan|apply|verify|rollback>');
}

function assertExactRuntimeIdentity(): Identity {
	const pairs = [
		['project ID', 'RAILWAY_PROJECT_ID', 'CATALOG_SEED_EXPECTED_RAILWAY_PROJECT_ID'],
		['environment ID', 'RAILWAY_ENVIRONMENT_ID', 'CATALOG_SEED_EXPECTED_RAILWAY_ENVIRONMENT_ID'],
		['service ID', 'RAILWAY_SERVICE_ID', 'CATALOG_SEED_EXPECTED_RAILWAY_SERVICE_ID'],
		['database ID', 'CATALOG_SEED_DATABASE_ID', 'CATALOG_SEED_EXPECTED_DATABASE_ID'],
		['release ID', 'RAILWAY_RELEASE_ID', 'CATALOG_SEED_EXPECTED_RELEASE_ID'],
		['release commit', 'RAILWAY_GIT_COMMIT_SHA', 'CATALOG_SEED_EXPECTED_RELEASE_COMMIT']
	] as const;

	for (const [label, actualName, expectedName] of pairs) {
		const actual = required(actualName);
		const expected = required(expectedName);
		if (actual !== expected)
			throw new Error(
				`Refusing catalog seed: Railway ${label} does not match its reviewed expected value.`
			);
	}

	return {
		projectId: required('RAILWAY_PROJECT_ID'),
		environmentId: required('RAILWAY_ENVIRONMENT_ID'),
		serviceId: required('RAILWAY_SERVICE_ID'),
		databaseId: required('CATALOG_SEED_DATABASE_ID'),
		releaseId: required('RAILWAY_RELEASE_ID'),
		releaseCommit: required('RAILWAY_GIT_COMMIT_SHA')
	};
}

function assertWriteConfirmation(
	command: Extract<Command, 'apply' | 'rollback'>,
	identity: Identity
): void {
	const expected = `${command}:${identity.releaseId}:${launchCatalogManifestHash}`;
	if (process.env.CATALOG_SEED_CONFIRMATION !== expected) {
		throw new Error(
			'Refusing catalog write: CATALOG_SEED_CONFIRMATION must contain the exact command, release ID, and manifest hash.'
		);
	}
}

function assertReviewedManifestHash(): void {
	if (required('CATALOG_SEED_EXPECTED_MANIFEST_HASH') !== launchCatalogManifestHash) {
		throw new Error(
			'Refusing catalog seed: expected manifest hash does not match the reviewed manifest.'
		);
	}
}

function categorySnapshot(
	row: Pick<
		ManagedCategoryRow,
		'name' | 'slug' | 'description' | 'parent_id' | 'sort_order' | 'is_active'
	>
): JsonRecord {
	return {
		name: row.name,
		slug: row.slug,
		description: row.description,
		parentId: row.parent_id,
		sortOrder: row.sort_order,
		isActive: row.is_active
	};
}

function productSnapshot(
	row: Pick<
		ManagedProductRow,
		| 'name'
		| 'slug'
		| 'description'
		| 'short_description'
		| 'sku'
		| 'price'
		| 'compare_price'
		| 'cost_price'
		| 'stock_quantity'
		| 'reserved_quantity'
		| 'track_inventory'
		| 'weight'
		| 'dimensions'
		| 'category_id'
		| 'is_active'
		| 'is_featured'
		| 'tags'
		| 'meta_title'
		| 'meta_description'
	>
): JsonRecord {
	return {
		name: row.name,
		slug: row.slug,
		description: row.description,
		shortDescription: row.short_description,
		sku: row.sku,
		price: String(row.price),
		comparePrice: row.compare_price === null ? null : String(row.compare_price),
		costPrice: row.cost_price === null ? null : String(row.cost_price),
		stockQuantity: row.stock_quantity,
		reservedQuantity: row.reserved_quantity,
		trackInventory: row.track_inventory,
		weight: row.weight === null ? null : String(row.weight),
		dimensions: row.dimensions,
		categoryId: row.category_id,
		isActive: row.is_active,
		isFeatured: row.is_featured,
		tags: row.tags,
		metaTitle: row.meta_title,
		metaDescription: row.meta_description
	};
}

function categoryDesiredSnapshot(
	category: LaunchCatalogCategory,
	parentId: number | null
): JsonRecord {
	return {
		name: category.name,
		slug: category.slug,
		description: category.description,
		parentId,
		sortOrder: category.sortOrder,
		isActive: true
	};
}

function collectionSnapshot(
	collection: LaunchCatalogCollection,
	categoryId: number | null
): JsonRecord {
	return {
		categoryId,
		categorySourceId: collection.categorySourceId,
		slug: collection.slug,
		name: collection.name,
		offeringKind: collection.offeringKind,
		priceSemantics: collection.price.semantics,
		customerFacing: collection.customerFacing,
		sellable: collection.sellable,
		isActive: collection.isActive
	};
}

function observedCollectionSnapshot(row: ManagedCollectionRow): JsonRecord {
	return { ...row.managed_snapshot, categoryId: row.category_id };
}

function productDesiredValues(candidate: LaunchCatalogCandidate, categoryId: number): JsonRecord {
	return {
		name: candidate.name,
		slug: candidate.slug,
		description: candidate.longDescription,
		shortDescription: candidate.shortDescription,
		sku: candidate.sku,
		price: '0.00',
		comparePrice: null,
		costPrice: null,
		stockQuantity: 0,
		reservedQuantity: 0,
		trackInventory: false,
		weight: null,
		dimensions: null,
		categoryId,
		isActive: false,
		isFeatured: false,
		tags: JSON.stringify(candidate.tags),
		metaTitle: null,
		metaDescription: null
	};
}

async function inspect(sql: Sql): Promise<Preflight> {
	const relationRows = await sql<Array<{ table_name: string; present: boolean }>>`
		WITH required(table_name) AS (
			VALUES ('product_category'), ('product'), ('file'), ('product_image'),
				('catalog_seed_category'), ('catalog_seed_collection'), ('catalog_seed_item'), ('catalog_seed_run')
		)
		SELECT table_name, to_regclass('public.' || table_name) IS NOT NULL AS present
		FROM required
		ORDER BY table_name
	`;
	const relationMap = new Map(relationRows.map((row) => [row.table_name, row.present]));
	for (const table of catalogTables.slice(0, 4)) {
		if (!relationMap.get(table)) throw new Error(`Catalog preflight requires public.${table}.`);
	}
	const seedTablesReady = catalogTables.slice(4).every((table) => relationMap.get(table));

	const columns = await sql<
		Array<{ table_name: string; column_name: string; data_type: string; is_nullable: string }>
	>`
		SELECT table_name, column_name, data_type, is_nullable
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name IN ('product_category', 'product', 'file', 'product_image', 'catalog_seed_category', 'catalog_seed_collection', 'catalog_seed_item', 'catalog_seed_run')
		ORDER BY table_name, ordinal_position
	`;
	const schemaFingerprint = hash({ relations: relationRows, columns });
	const [counts] = seedTablesReady
		? await sql<Array<JsonRecord>>`
			SELECT
				(SELECT count(*)::int FROM product_category) AS categories,
				(SELECT count(*)::int FROM product) AS products,
				(SELECT count(*)::int FROM file) AS files,
				(SELECT count(*)::int FROM product_image) AS product_images,
				(SELECT count(*)::int FROM product AS p LEFT JOIN catalog_seed_item AS item ON item.product_id = p.id WHERE item.product_id IS NULL) AS unmanaged_products
		`
		: await sql<Array<JsonRecord>>`
			SELECT
				(SELECT count(*)::int FROM product_category) AS categories,
				(SELECT count(*)::int FROM product) AS products,
				(SELECT count(*)::int FROM file) AS files,
				(SELECT count(*)::int FROM product_image) AS product_images,
				null::int AS unmanaged_products
		`;
	const [integrity] = await sql<
		Array<{
			invalid_commerce: number;
			orphan_images: number;
			multiple_primary_images: number;
			duplicate_category_slugs: number;
			duplicate_product_slugs: number;
			duplicate_product_skus: number;
			duplicate_bucket_paths: number;
		}>
	>`
		SELECT
			(SELECT count(*)::int FROM product WHERE price < 0 OR stock_quantity < 0 OR reserved_quantity < 0) AS invalid_commerce,
			(SELECT count(*)::int FROM product_image AS image LEFT JOIN file ON file.id = image.file_id WHERE file.id IS NULL) AS orphan_images,
			(SELECT count(*)::int FROM (SELECT product_id FROM product_image WHERE is_main GROUP BY product_id HAVING count(*) > 1) AS conflicts) AS multiple_primary_images,
			(SELECT count(*)::int FROM (SELECT slug FROM product_category GROUP BY slug HAVING count(*) > 1) AS duplicates) AS duplicate_category_slugs,
			(SELECT count(*)::int FROM (SELECT slug FROM product GROUP BY slug HAVING count(*) > 1) AS duplicates) AS duplicate_product_slugs,
			(SELECT count(*)::int FROM (SELECT sku FROM product GROUP BY sku HAVING count(*) > 1) AS duplicates) AS duplicate_product_skus,
			(SELECT count(*)::int FROM (SELECT bucket_path FROM file GROUP BY bucket_path HAVING count(*) > 1) AS duplicates) AS duplicate_bucket_paths
	`;
	const matchingProductRows = await sql<Array<{ id: number; slug: string; sku: string }>>`
		SELECT id, slug, sku
		FROM product
		WHERE slug = ANY(${sql.array(launchCatalogCandidates.map((candidate) => candidate.slug))})
			OR sku = ANY(${sql.array(launchCatalogCandidates.map((candidate) => candidate.sku))})
		ORDER BY id
	`;
	const matchingCategoryRows = await sql<Array<{ id: number; slug: string }>>`
		SELECT id, slug
		FROM product_category
		WHERE slug = ANY(${sql.array(launchCatalogCategories.map((category) => category.slug))})
		ORDER BY id
	`;
	const categoryRows = seedTablesReady
		? await sql<ManagedCategoryRow[]>`
			SELECT seed.source_id, seed.manifest_version, seed.manifest_hash, seed.category_id,
				seed.managed_snapshot, seed.managed_hash, seed.is_retired,
				category.name, category.slug, category.description, category.parent_id, category.sort_order, category.is_active
			FROM catalog_seed_category AS seed
			INNER JOIN product_category AS category ON category.id = seed.category_id
			WHERE seed.source_id LIKE ${`${launchCatalogManifestNamespace}.%`}
			ORDER BY seed.source_id
		`
		: [];
	const collectionRows = seedTablesReady
		? await sql<ManagedCollectionRow[]>`
			SELECT source_id, manifest_version, manifest_hash, category_id, managed_snapshot, managed_hash, is_retired
			FROM catalog_seed_collection
			WHERE source_id LIKE ${`${launchCatalogManifestNamespace}.%`}
			ORDER BY source_id
		`
		: [];
	const productRows = seedTablesReady
		? await sql<ManagedProductRow[]>`
			SELECT seed.source_id, seed.manifest_version, seed.manifest_hash, seed.product_id, seed.offering_kind,
				seed.price_semantics, seed.managed_fields, seed.managed_snapshot, seed.managed_hash, seed.is_retired,
				product.name, product.slug, product.description, product.short_description, product.sku, product.price,
				product.compare_price, product.cost_price, product.stock_quantity, product.reserved_quantity,
				product.track_inventory, product.weight, product.dimensions, product.category_id, product.is_active,
				product.is_featured, product.tags, product.meta_title, product.meta_description
			FROM catalog_seed_item AS seed
			INNER JOIN product ON product.id = seed.product_id
			WHERE seed.source_id LIKE ${`${launchCatalogManifestNamespace}.%`}
			ORDER BY seed.source_id
		`
		: [];

	return {
		schemaFingerprint,
		seedTablesReady,
		counts: counts ?? {},
		invalidCommerceCount: integrity?.invalid_commerce ?? 0,
		orphanImageCount: integrity?.orphan_images ?? 0,
		multiplePrimaryImageCount: integrity?.multiple_primary_images ?? 0,
		duplicateCategorySlugCount: integrity?.duplicate_category_slugs ?? 0,
		duplicateProductSlugCount: integrity?.duplicate_product_slugs ?? 0,
		duplicateProductSkuCount: integrity?.duplicate_product_skus ?? 0,
		duplicateBucketPathCount: integrity?.duplicate_bucket_paths ?? 0,
		categoryRows,
		collectionRows,
		productRows,
		matchingProductRows,
		matchingCategoryRows
	};
}

function buildPlan(preflight: Preflight): Plan {
	const changes: PlannedChange[] = [];
	if (!preflight.seedTablesReady) {
		changes.push({
			sourceId: launchCatalogManifestNamespace,
			kind: 'category',
			action: 'conflict',
			reason:
				'The source-only catalog reconciler tables are absent; run the reviewed read-only preflight and disposable rehearsal before applying 0008.'
		});
		return { changes, conflicts: changes };
	}
	if (
		preflight.duplicateCategorySlugCount ||
		preflight.duplicateProductSlugCount ||
		preflight.duplicateProductSkuCount ||
		preflight.duplicateBucketPathCount
	) {
		changes.push({
			sourceId: `${launchCatalogManifestNamespace}.preflight.uniqueness`,
			kind: 'category',
			action: 'conflict',
			reason: 'Target contains duplicate category/product identities or bucket paths.'
		});
	}
	const categoriesBySource = new Map(preflight.categoryRows.map((row) => [row.source_id, row]));
	const collectionsBySource = new Map(preflight.collectionRows.map((row) => [row.source_id, row]));
	const productsBySource = new Map(preflight.productRows.map((row) => [row.source_id, row]));
	const categoryIdsBySource = new Map(
		preflight.categoryRows.map((row) => [row.source_id, row.category_id])
	);

	for (const category of launchCatalogCategories) {
		const mapped = categoriesBySource.get(category.sourceId);
		const colliding = preflight.matchingCategoryRows.find((row) => row.slug === category.slug);
		if (!mapped && colliding) {
			changes.push({
				sourceId: category.sourceId,
				kind: 'category',
				action: 'conflict',
				reason: 'An unmanaged category already owns the canonical slug.'
			});
			continue;
		}
		if (!mapped) {
			changes.push({
				sourceId: category.sourceId,
				kind: 'category',
				action: 'create',
				reason: 'No managed category mapping exists.'
			});
			continue;
		}
		if (mapped.managed_hash !== hash(categorySnapshot(mapped))) {
			changes.push({
				sourceId: category.sourceId,
				kind: 'category',
				action: 'conflict',
				reason: 'Managed category fields changed outside the catalog reconciler.'
			});
			continue;
		}
		const parentId = category.parentSourceId
			? (categoryIdsBySource.get(category.parentSourceId) ?? null)
			: null;
		const desiredHash = hash(categoryDesiredSnapshot(category, parentId));
		changes.push({
			sourceId: category.sourceId,
			kind: 'category',
			action: mapped.managed_hash === desiredHash && !mapped.is_retired ? 'unchanged' : 'update',
			reason:
				mapped.managed_hash === desiredHash && !mapped.is_retired
					? 'Managed category matches the reviewed manifest.'
					: 'Managed category differs from the reviewed manifest.'
		});
	}

	for (const collection of launchCatalogCollections) {
		const mapped = collectionsBySource.get(collection.sourceId);
		if (!mapped) {
			changes.push({
				sourceId: collection.sourceId,
				kind: 'collection',
				action: 'create',
				reason: 'No managed collection-to-category mapping exists.'
			});
			continue;
		}
		if (mapped.managed_hash !== hash(observedCollectionSnapshot(mapped))) {
			changes.push({
				sourceId: collection.sourceId,
				kind: 'collection',
				action: 'conflict',
				reason: 'Managed collection mapping changed outside the catalog reconciler.'
			});
			continue;
		}
		const categoryId = categoryIdsBySource.get(collection.categorySourceId) ?? null;
		const desiredHash = hash(collectionSnapshot(collection, categoryId));
		changes.push({
			sourceId: collection.sourceId,
			kind: 'collection',
			action: mapped.managed_hash === desiredHash && !mapped.is_retired ? 'unchanged' : 'update',
			reason:
				mapped.managed_hash === desiredHash && !mapped.is_retired
					? 'Managed collection matches the reviewed manifest.'
					: 'Managed collection differs from the reviewed manifest.'
		});
	}

	for (const candidate of launchCatalogCandidates) {
		const mapped = productsBySource.get(candidate.sourceId);
		const collisions = preflight.matchingProductRows.filter(
			(row) => row.slug === candidate.slug || row.sku === candidate.sku
		);
		if (!mapped && collisions.length > 0) {
			changes.push({
				sourceId: candidate.sourceId,
				kind: 'product',
				action: 'conflict',
				reason: 'An unmanaged product already owns the canonical slug or SKU.'
			});
			continue;
		}
		if (!mapped) {
			changes.push({
				sourceId: candidate.sourceId,
				kind: 'product',
				action: 'create',
				reason: 'No managed product mapping exists.'
			});
			continue;
		}
		if (
			collisions.some((row) => row.id !== mapped.product_id) ||
			mapped.managed_hash !== hash(productSnapshot(mapped))
		) {
			changes.push({
				sourceId: candidate.sourceId,
				kind: 'product',
				action: 'conflict',
				reason:
					'A canonical identity or managed product field changed outside the catalog reconciler.'
			});
			continue;
		}
		changes.push({
			sourceId: candidate.sourceId,
			kind: 'product',
			action:
				mapped.manifest_hash === launchCatalogManifestHash && !mapped.is_retired
					? 'unchanged'
					: 'update',
			reason:
				mapped.manifest_hash === launchCatalogManifestHash && !mapped.is_retired
					? 'Managed product matches the reviewed manifest.'
					: 'Managed product differs from the reviewed manifest.'
		});
	}

	const activeSources = new Set(launchCatalogCandidates.map((candidate) => candidate.sourceId));
	for (const row of preflight.productRows) {
		if (!activeSources.has(row.source_id) && !row.is_retired) {
			changes.push({
				sourceId: row.source_id,
				kind: 'product',
				action: 'deactivate',
				reason: 'The managed product was removed from the reviewed manifest.'
			});
		}
	}
	const activeCollectionSources = new Set(
		launchCatalogCollections.map((collection) => collection.sourceId)
	);
	for (const row of preflight.collectionRows) {
		if (!activeCollectionSources.has(row.source_id) && !row.is_retired) {
			changes.push({
				sourceId: row.source_id,
				kind: 'collection',
				action: 'deactivate',
				reason: 'The managed collection was removed from the reviewed manifest.'
			});
		}
	}
	const conflicts = changes.filter((change) => change.action === 'conflict');
	return { changes, conflicts };
}

function report(
	command: Command,
	identity: Identity,
	preflight: Preflight,
	plan: Plan,
	extra: JsonRecord = {}
): JsonRecord {
	const summary = Object.fromEntries(
		['create', 'update', 'deactivate', 'unchanged', 'conflict'].map((action) => [
			action,
			plan.changes.filter((change) => change.action === action).length
		])
	);
	return {
		command,
		manifestVersion: launchCatalogManifest.version,
		manifestHash: launchCatalogManifestHash,
		releaseId: identity.releaseId,
		releaseCommit: identity.releaseCommit,
		schemaFingerprint: preflight.schemaFingerprint,
		seedTablesReady: preflight.seedTablesReady,
		counts: preflight.counts,
		integrity: {
			invalidCommerce: preflight.invalidCommerceCount,
			orphanImages: preflight.orphanImageCount,
			multiplePrimaryImages: preflight.multiplePrimaryImageCount,
			duplicateCategorySlugs: preflight.duplicateCategorySlugCount,
			duplicateProductSlugs: preflight.duplicateProductSlugCount,
			duplicateProductSkus: preflight.duplicateProductSkuCount,
			duplicateBucketPaths: preflight.duplicateBucketPathCount
		},
		summary,
		changes: plan.changes.map(({ sourceId, kind, action, reason }) => ({
			sourceId,
			kind,
			action,
			reason
		})),
		...extra
	};
}

function assertApplyPreflight(preflight: Preflight, plan: Plan): void {
	if (!preflight.seedTablesReady)
		throw new Error('The catalog reconciler recovery artifact is not installed on this target.');
	if (
		preflight.invalidCommerceCount ||
		preflight.orphanImageCount ||
		preflight.multiplePrimaryImageCount ||
		preflight.duplicateCategorySlugCount ||
		preflight.duplicateProductSlugCount ||
		preflight.duplicateProductSkuCount ||
		preflight.duplicateBucketPathCount
	) {
		throw new Error(
			'Catalog integrity preflight found invalid commerce values, invalid image relationships, or duplicate canonical identities.'
		);
	}
	if (plan.conflicts.length)
		throw new Error(
			'Catalog plan contains conflicts; resolve them without overwriting unmanaged data.'
		);
}

function mapRecord(row: ManagedCategoryRow | ManagedCollectionRow | ManagedProductRow): JsonRecord {
	return {
		sourceId: row.source_id,
		manifestVersion: row.manifest_version,
		manifestHash: row.manifest_hash,
		managedSnapshot: row.managed_snapshot,
		managedHash: row.managed_hash,
		isRetired: row.is_retired,
		...('product_id' in row
			? {
					productId: row.product_id,
					offeringKind: row.offering_kind,
					priceSemantics: row.price_semantics,
					managedFields: row.managed_fields
				}
			: { categoryId: row.category_id })
	};
}

async function apply(sql: Sql, identity: Identity): Promise<JsonRecord> {
	return sql.begin(async (tx) => {
		await tx`SELECT pg_advisory_xact_lock(hashtextextended('aevani.catalog.launch', 0))`;
		const preflight = await inspect(tx);
		const plan = buildPlan(preflight);
		assertApplyPreflight(preflight, plan);

		const runId = randomUUID();
		const changes: JsonRecord[] = [];
		const preimage: JsonRecord[] = [];
		await tx`
			INSERT INTO catalog_seed_run (
				run_id, action, status, manifest_version, manifest_hash, release_id, release_commit,
				schema_fingerprint, preimage, changes, change_hash, summary
			) VALUES (
				${runId}, 'apply', 'running', ${launchCatalogManifest.version}, ${launchCatalogManifestHash}, ${identity.releaseId}, ${identity.releaseCommit},
				${preflight.schemaFingerprint}, ${tx.json([])}, ${tx.json([])}, ${hash([])}, ${tx.json({})}
			)
		`;

		const categoryRows = new Map(preflight.categoryRows.map((row) => [row.source_id, row]));
		const categoryIds = new Map(
			preflight.categoryRows.map((row) => [row.source_id, row.category_id])
		);
		for (const category of launchCatalogCategories) {
			const previous = categoryRows.get(category.sourceId);
			const parentId = category.parentSourceId
				? (categoryIds.get(category.parentSourceId) ?? null)
				: null;
			let saved: ManagedCategoryRow;
			if (previous) {
				const [updated] = await tx<ManagedCategoryRow[]>`
					UPDATE product_category SET name = ${category.name}, slug = ${category.slug}, description = ${category.description},
						parent_id = ${parentId}, sort_order = ${category.sortOrder}, is_active = true, updated_at = now()
					WHERE id = ${previous.category_id}
					RETURNING id AS category_id, name, slug, description, parent_id, sort_order, is_active
				`;
				saved = { ...previous, ...updated };
				preimage.push({
					kind: 'category',
					sourceId: category.sourceId,
					row: categorySnapshot(previous),
					mapping: mapRecord(previous)
				});
			} else {
				const [created] = await tx<ManagedCategoryRow[]>`
					INSERT INTO product_category (name, slug, description, parent_id, sort_order, is_active)
					VALUES (${category.name}, ${category.slug}, ${category.description}, ${parentId}, ${category.sortOrder}, true)
					RETURNING id AS category_id, name, slug, description, parent_id, sort_order, is_active
				`;
				saved = {
					source_id: category.sourceId,
					manifest_version: launchCatalogManifest.version,
					manifest_hash: launchCatalogManifestHash,
					managed_snapshot: {},
					managed_hash: '',
					is_retired: false,
					...created
				};
				preimage.push({ kind: 'category', sourceId: category.sourceId, row: null, mapping: null });
			}
			const snapshot = categorySnapshot(saved);
			const managedHash = hash(snapshot);
			await tx`
				INSERT INTO catalog_seed_category (source_id, manifest_version, manifest_hash, category_id, managed_snapshot, managed_hash, is_retired)
				VALUES (${category.sourceId}, ${launchCatalogManifest.version}, ${launchCatalogManifestHash}, ${saved.category_id}, ${tx.json(snapshot)}, ${managedHash}, false)
				ON CONFLICT (source_id) DO UPDATE SET manifest_version = EXCLUDED.manifest_version, manifest_hash = EXCLUDED.manifest_hash,
					category_id = EXCLUDED.category_id, managed_snapshot = EXCLUDED.managed_snapshot, managed_hash = EXCLUDED.managed_hash,
					is_retired = false, updated_at = now()
			`;
			categoryIds.set(category.sourceId, saved.category_id);
			changes.push({
				kind: 'category',
				sourceId: category.sourceId,
				before: previous ? categorySnapshot(previous) : null,
				after: snapshot,
				created: !previous
			});
		}

		const collectionsBySource = new Map(
			preflight.collectionRows.map((row) => [row.source_id, row])
		);
		for (const collection of launchCatalogCollections) {
			const previous = collectionsBySource.get(collection.sourceId);
			const categoryId = categoryIds.get(collection.categorySourceId);
			if (!categoryId) throw new Error(`Missing managed category for ${collection.sourceId}.`);
			const snapshot = collectionSnapshot(collection, categoryId);
			const managedHash = hash(snapshot);
			await tx`
				INSERT INTO catalog_seed_collection (source_id, manifest_version, manifest_hash, category_id, managed_snapshot, managed_hash, is_retired)
				VALUES (${collection.sourceId}, ${launchCatalogManifest.version}, ${launchCatalogManifestHash}, ${categoryId}, ${tx.json(snapshot)}, ${managedHash}, false)
				ON CONFLICT (source_id) DO UPDATE SET manifest_version = EXCLUDED.manifest_version, manifest_hash = EXCLUDED.manifest_hash,
					category_id = EXCLUDED.category_id, managed_snapshot = EXCLUDED.managed_snapshot, managed_hash = EXCLUDED.managed_hash,
					is_retired = false, updated_at = now()
			`;
			preimage.push({
				kind: 'collection',
				sourceId: collection.sourceId,
				row: previous ? observedCollectionSnapshot(previous) : null,
				mapping: previous ? mapRecord(previous) : null
			});
			changes.push({
				kind: 'collection',
				sourceId: collection.sourceId,
				before: previous ? observedCollectionSnapshot(previous) : null,
				after: snapshot,
				created: !previous
			});
		}

		const productsBySource = new Map(preflight.productRows.map((row) => [row.source_id, row]));
		for (const candidate of launchCatalogCandidates) {
			const previous = productsBySource.get(candidate.sourceId);
			const categoryId = categoryIds.get(candidate.categorySourceId);
			if (!categoryId) throw new Error(`Missing managed category for ${candidate.sourceId}.`);
			const desired = productDesiredValues(candidate, categoryId);
			let saved: ManagedProductRow;
			if (previous) {
				const [updated] = await tx<ManagedProductRow[]>`
					UPDATE product SET name = ${desired.name as string}, slug = ${desired.slug as string}, description = ${desired.description as string},
						short_description = ${desired.shortDescription as string}, sku = ${desired.sku as string}, price = ${desired.price as string},
						compare_price = NULL, cost_price = NULL, stock_quantity = 0, reserved_quantity = 0, track_inventory = false,
						weight = NULL, dimensions = NULL, category_id = ${categoryId}, is_active = false, is_featured = false,
						tags = ${desired.tags as string}, meta_title = NULL, meta_description = NULL, updated_at = now()
					WHERE id = ${previous.product_id}
					RETURNING id AS product_id, name, slug, description, short_description, sku, price, compare_price, cost_price,
						stock_quantity, reserved_quantity, track_inventory, weight, dimensions, category_id, is_active, is_featured,
						tags, meta_title, meta_description
				`;
				saved = { ...previous, ...updated };
				preimage.push({
					kind: 'product',
					sourceId: candidate.sourceId,
					row: productSnapshot(previous),
					mapping: mapRecord(previous)
				});
			} else {
				const [created] = await tx<ManagedProductRow[]>`
					INSERT INTO product (name, slug, description, short_description, sku, price, stock_quantity, reserved_quantity,
						track_inventory, category_id, is_active, is_featured, tags)
					VALUES (${desired.name as string}, ${desired.slug as string}, ${desired.description as string}, ${desired.shortDescription as string},
						${desired.sku as string}, ${desired.price as string}, 0, 0, false, ${categoryId}, false, false, ${desired.tags as string})
					RETURNING id AS product_id, name, slug, description, short_description, sku, price, compare_price, cost_price,
						stock_quantity, reserved_quantity, track_inventory, weight, dimensions, category_id, is_active, is_featured,
						tags, meta_title, meta_description
				`;
				saved = {
					source_id: candidate.sourceId,
					manifest_version: launchCatalogManifest.version,
					manifest_hash: launchCatalogManifestHash,
					offering_kind: candidate.offeringKind,
					price_semantics: candidate.price.semantics,
					managed_fields: candidate.managedFields,
					managed_snapshot: {},
					managed_hash: '',
					is_retired: false,
					...created
				};
				preimage.push({ kind: 'product', sourceId: candidate.sourceId, row: null, mapping: null });
			}
			const snapshot = productSnapshot(saved);
			const managedHash = hash(snapshot);
			await tx`
				INSERT INTO catalog_seed_item (source_id, manifest_version, manifest_hash, product_id, offering_kind, price_semantics,
					managed_fields, managed_snapshot, managed_hash, is_retired)
				VALUES (${candidate.sourceId}, ${launchCatalogManifest.version}, ${launchCatalogManifestHash}, ${saved.product_id},
					${candidate.offeringKind}, ${candidate.price.semantics}, ${tx.json(candidate.managedFields)}, ${tx.json(snapshot)}, ${managedHash}, false)
				ON CONFLICT (source_id) DO UPDATE SET manifest_version = EXCLUDED.manifest_version, manifest_hash = EXCLUDED.manifest_hash,
					product_id = EXCLUDED.product_id, offering_kind = EXCLUDED.offering_kind, price_semantics = EXCLUDED.price_semantics,
					managed_fields = EXCLUDED.managed_fields, managed_snapshot = EXCLUDED.managed_snapshot, managed_hash = EXCLUDED.managed_hash,
					is_retired = false, updated_at = now()
			`;
			changes.push({
				kind: 'product',
				sourceId: candidate.sourceId,
				before: previous ? productSnapshot(previous) : null,
				after: snapshot,
				created: !previous
			});
		}

		const activeCollectionSources = new Set(
			launchCatalogCollections.map((collection) => collection.sourceId)
		);
		for (const previous of preflight.collectionRows) {
			if (activeCollectionSources.has(previous.source_id) || previous.is_retired) continue;
			const snapshot = observedCollectionSnapshot(previous);
			await tx`
				UPDATE catalog_seed_collection SET is_retired = true, updated_at = now()
				WHERE source_id = ${previous.source_id}
			`;
			preimage.push({
				kind: 'collection',
				sourceId: previous.source_id,
				row: snapshot,
				mapping: mapRecord(previous)
			});
			changes.push({
				kind: 'collection',
				sourceId: previous.source_id,
				before: snapshot,
				after: snapshot,
				created: false,
				deactivated: true
			});
		}

		const activeSources = new Set(launchCatalogCandidates.map((candidate) => candidate.sourceId));
		for (const previous of preflight.productRows) {
			if (activeSources.has(previous.source_id) || previous.is_retired) continue;
			const [deactivated] = await tx<ManagedProductRow[]>`
				UPDATE product SET is_active = false, updated_at = now()
				WHERE id = ${previous.product_id}
				RETURNING id AS product_id, name, slug, description, short_description, sku, price, compare_price, cost_price,
					stock_quantity, reserved_quantity, track_inventory, weight, dimensions, category_id, is_active, is_featured,
					tags, meta_title, meta_description
			`;
			const saved = { ...previous, ...deactivated };
			const snapshot = productSnapshot(saved);
			const managedHash = hash(snapshot);
			await tx`
				UPDATE catalog_seed_item SET is_retired = true, managed_snapshot = ${tx.json(snapshot)}, managed_hash = ${managedHash}, updated_at = now()
				WHERE source_id = ${previous.source_id}
			`;
			preimage.push({
				kind: 'product',
				sourceId: previous.source_id,
				row: productSnapshot(previous),
				mapping: mapRecord(previous)
			});
			changes.push({
				kind: 'product',
				sourceId: previous.source_id,
				before: productSnapshot(previous),
				after: snapshot,
				created: false,
				deactivated: true
			});
		}

		const changeHash = hash(changes);
		const summary = {
			created: changes.filter((change) => change.created).length,
			updated: changes.filter((change) => !change.created && !change.deactivated).length,
			deactivated: changes.filter((change) => change.deactivated).length
		};
		await tx`
			UPDATE catalog_seed_run SET status = 'applied', preimage = ${tx.json(preimage)}, changes = ${tx.json(changes)},
				change_hash = ${changeHash}, summary = ${tx.json(summary)}, completed_at = now()
			WHERE run_id = ${runId}
		`;
		return report('apply', identity, preflight, plan, { runId, audit: summary, changeHash });
	});
}

async function verify(sql: Sql, identity: Identity): Promise<JsonRecord> {
	return sql.begin(async (tx) => {
		await tx`SET TRANSACTION READ ONLY`;
		const preflight = await inspect(tx);
		const plan = buildPlan(preflight);
		if (!preflight.seedTablesReady)
			throw new Error('The catalog reconciler recovery artifact is not installed on this target.');
		if (
			preflight.invalidCommerceCount ||
			preflight.orphanImageCount ||
			preflight.multiplePrimaryImageCount ||
			plan.conflicts.length
		) {
			throw new Error(
				'Catalog verification found unresolved integrity failures or reconciliation conflicts.'
			);
		}
		if (plan.changes.some((change) => change.action !== 'unchanged')) {
			throw new Error('Catalog verification requires an exact, fully reconciled manifest state.');
		}
		const expectedCategorySources = new Set(
			launchCatalogCategories.map((category) => category.sourceId)
		);
		const expectedCollectionSources = new Set(
			launchCatalogCollections.map((collection) => collection.sourceId)
		);
		const expectedProductSources = new Set(
			launchCatalogCandidates.map((candidate) => candidate.sourceId)
		);
		const hasExactSources = <T extends { source_id: string }>(
			rows: readonly T[],
			expected: ReadonlySet<string>
		): boolean => rows.length === expected.size && rows.every((row) => expected.has(row.source_id));
		if (
			!hasExactSources(preflight.categoryRows, expectedCategorySources) ||
			!hasExactSources(preflight.collectionRows, expectedCollectionSources) ||
			!hasExactSources(preflight.productRows, expectedProductSources) ||
			preflight.categoryRows.some((row) => row.is_retired) ||
			preflight.collectionRows.some((row) => row.is_retired) ||
			preflight.productRows.some((row) => row.is_retired)
		) {
			throw new Error('Catalog verification requires every active manifest mapping exactly once.');
		}
		const invalidCandidateRows = preflight.productRows.filter((row) => {
			return (
				row.is_active ||
				row.price_semantics !== 'unpriced' ||
				row.price !== '0.00' ||
				row.stock_quantity !== 0 ||
				row.reserved_quantity !== 0 ||
				row.track_inventory
			);
		});
		if (invalidCandidateRows.length)
			throw new Error(
				'A launch candidate is active, priced, or inventory-enabled before verification.'
			);
		return report('verify', identity, preflight, plan, {
			verifiedManagedCategories: preflight.categoryRows.length,
			verifiedManagedProducts: preflight.productRows.length,
			verifiedManagedCollections: preflight.collectionRows.length,
			publicCatalogGate: 'closed'
		});
	});
}

async function rollback(sql: Sql, identity: Identity): Promise<JsonRecord> {
	const rollbackOfRunId = required('CATALOG_SEED_ROLLBACK_RUN_ID');
	return sql.begin(async (tx) => {
		await tx`SELECT pg_advisory_xact_lock(hashtextextended('aevani.catalog.launch', 0))`;
		const [target] = await tx<
			Array<{
				run_id: string;
				manifest_hash: string;
				schema_fingerprint: string;
				preimage: Array<JsonRecord>;
				changes: Array<JsonRecord>;
				status: string;
			}>
		>`
			SELECT run_id, manifest_hash, schema_fingerprint, preimage, changes, status
			FROM catalog_seed_run
			WHERE run_id = ${rollbackOfRunId} AND action = 'apply' AND status = 'applied'
			FOR UPDATE
		`;
		if (!target) throw new Error('Rollback target must be an applied catalog seed run.');
		if (target.manifest_hash !== launchCatalogManifestHash)
			throw new Error('Rollback target does not match the currently reviewed manifest hash.');

		const preflight = await inspect(tx);
		const plan = buildPlan(preflight);
		assertApplyPreflight(preflight, plan);
		const currentProducts = new Map(preflight.productRows.map((row) => [row.source_id, row]));
		const currentCategories = new Map(preflight.categoryRows.map((row) => [row.source_id, row]));
		const currentCollections = new Map(preflight.collectionRows.map((row) => [row.source_id, row]));
		for (const change of target.changes) {
			const sourceId = change.sourceId as string;
			const after = change.after as JsonRecord;
			const current =
				change.kind === 'product'
					? currentProducts.get(sourceId)
					: change.kind === 'collection'
						? currentCollections.get(sourceId)
						: currentCategories.get(sourceId);
			const snapshot =
				current &&
				(change.kind === 'product'
					? productSnapshot(current as ManagedProductRow)
					: change.kind === 'collection'
						? observedCollectionSnapshot(current as ManagedCollectionRow)
						: categorySnapshot(current as ManagedCategoryRow));
			if (!current || hash(snapshot) !== hash(after)) {
				throw new Error(
					`Rollback refused because managed row ${sourceId} changed after the seed run.`
				);
			}
		}

		const rollbackRunId = randomUUID();
		const reversed: JsonRecord[] = [];
		for (const entry of [...target.preimage].filter((item) => item.kind === 'product').reverse()) {
			const sourceId = entry.sourceId as string;
			const current = currentProducts.get(sourceId);
			if (!current) throw new Error(`Rollback target product ${sourceId} is missing.`);
			if (entry.row === null) {
				const [references] = await tx<Array<{ referenced: boolean }>>`
					SELECT EXISTS (
						SELECT 1 FROM product_image WHERE product_id = ${current.product_id}
						UNION ALL SELECT 1 FROM cart_item WHERE product_id = ${current.product_id}
						UNION ALL SELECT 1 FROM order_item WHERE product_id = ${current.product_id}
						UNION ALL SELECT 1 FROM affiliate_link WHERE product_id = ${current.product_id}
					) AS referenced
				`;
				if (references?.referenced)
					throw new Error(`Rollback refused: newly created product ${sourceId} is referenced.`);
				await tx`DELETE FROM catalog_seed_item WHERE source_id = ${sourceId}`;
				await tx`DELETE FROM product WHERE id = ${current.product_id}`;
			} else {
				const before = entry.row as JsonRecord;
				const mapping = entry.mapping as JsonRecord;
				await tx`
					UPDATE product SET name = ${before.name as string}, slug = ${before.slug as string}, description = ${before.description as string | null},
						short_description = ${before.shortDescription as string | null}, sku = ${before.sku as string}, price = ${before.price as string},
						compare_price = ${before.comparePrice as string | null}, cost_price = ${before.costPrice as string | null},
						stock_quantity = ${before.stockQuantity as number}, reserved_quantity = ${before.reservedQuantity as number},
						track_inventory = ${before.trackInventory as boolean}, weight = ${before.weight as string | null}, dimensions = ${before.dimensions as string | null},
						category_id = ${before.categoryId as number}, is_active = ${before.isActive as boolean}, is_featured = ${before.isFeatured as boolean},
						tags = ${before.tags as string | null}, meta_title = ${before.metaTitle as string | null}, meta_description = ${before.metaDescription as string | null}, updated_at = now()
					WHERE id = ${current.product_id}
				`;
				await tx`
					UPDATE catalog_seed_item SET manifest_version = ${mapping.manifestVersion as string}, manifest_hash = ${mapping.manifestHash as string},
						offering_kind = ${mapping.offeringKind as string}, price_semantics = ${mapping.priceSemantics as string},
						managed_fields = ${tx.json(mapping.managedFields)}, managed_snapshot = ${tx.json(mapping.managedSnapshot)},
						managed_hash = ${mapping.managedHash as string}, is_retired = ${mapping.isRetired as boolean}, updated_at = now()
					WHERE source_id = ${sourceId}
				`;
			}
			reversed.push({ sourceId, kind: 'product' });
		}
		for (const entry of [...target.preimage]
			.filter((item) => item.kind === 'collection')
			.reverse()) {
			const sourceId = entry.sourceId as string;
			const current = currentCollections.get(sourceId);
			if (!current) throw new Error(`Rollback target collection ${sourceId} is missing.`);
			if (entry.row === null) {
				await tx`DELETE FROM catalog_seed_collection WHERE source_id = ${sourceId}`;
			} else {
				const mapping = entry.mapping as JsonRecord;
				await tx`
					UPDATE catalog_seed_collection SET manifest_version = ${mapping.manifestVersion as string}, manifest_hash = ${mapping.manifestHash as string},
						category_id = ${mapping.categoryId as number}, managed_snapshot = ${tx.json(mapping.managedSnapshot)},
						managed_hash = ${mapping.managedHash as string}, is_retired = ${mapping.isRetired as boolean}, updated_at = now()
					WHERE source_id = ${sourceId}
				`;
			}
			reversed.push({ sourceId, kind: 'collection' });
		}
		for (const entry of [...target.preimage].filter((item) => item.kind === 'category').reverse()) {
			const sourceId = entry.sourceId as string;
			const current = currentCategories.get(sourceId);
			if (!current) throw new Error(`Rollback target category ${sourceId} is missing.`);
			if (entry.row === null) {
				const [references] = await tx<Array<{ referenced: boolean }>>`
					SELECT EXISTS (
						SELECT 1 FROM product WHERE category_id = ${current.category_id}
						UNION ALL SELECT 1 FROM product_category WHERE parent_id = ${current.category_id}
					) AS referenced
				`;
				if (references?.referenced)
					throw new Error(`Rollback refused: newly created category ${sourceId} is referenced.`);
				await tx`DELETE FROM catalog_seed_category WHERE source_id = ${sourceId}`;
				await tx`DELETE FROM product_category WHERE id = ${current.category_id}`;
			} else {
				const before = entry.row as JsonRecord;
				const mapping = entry.mapping as JsonRecord;
				await tx`
					UPDATE product_category SET name = ${before.name as string}, slug = ${before.slug as string}, description = ${before.description as string | null},
						parent_id = ${before.parentId as number | null}, sort_order = ${before.sortOrder as number}, is_active = ${before.isActive as boolean}, updated_at = now()
					WHERE id = ${current.category_id}
				`;
				await tx`
					UPDATE catalog_seed_category SET manifest_version = ${mapping.manifestVersion as string}, manifest_hash = ${mapping.manifestHash as string},
						managed_snapshot = ${tx.json(mapping.managedSnapshot)}, managed_hash = ${mapping.managedHash as string},
						is_retired = ${mapping.isRetired as boolean}, updated_at = now()
					WHERE source_id = ${sourceId}
				`;
			}
			reversed.push({ sourceId, kind: 'category' });
		}

		const rollbackChangeHash = hash(reversed);
		await tx`
			INSERT INTO catalog_seed_run (run_id, action, status, manifest_version, manifest_hash, release_id, release_commit,
				schema_fingerprint, rollback_of_run_id, preimage, changes, change_hash, summary, completed_at)
			VALUES (${rollbackRunId}, 'rollback', 'rolled_back', ${launchCatalogManifest.version}, ${launchCatalogManifestHash},
				${identity.releaseId}, ${identity.releaseCommit}, ${preflight.schemaFingerprint}, ${rollbackOfRunId},
				${tx.json(target.changes)}, ${tx.json(reversed)}, ${rollbackChangeHash}, ${tx.json({ restored: reversed.length })}, now())
		`;
		return report('rollback', identity, preflight, plan, {
			runId: rollbackRunId,
			rollbackOfRunId,
			restored: reversed.length,
			changeHash: rollbackChangeHash
		});
	});
}

async function main(): Promise<void> {
	assertLaunchCatalogManifest();
	assertReviewedManifestHash();
	const command = readCommand();
	const identity = assertExactRuntimeIdentity();
	if (command === 'apply' || command === 'rollback') assertWriteConfirmation(command, identity);
	const databaseUrl = required('DATABASE_URL');
	const sql = postgres(databaseUrl, { max: 1, idle_timeout: 5, connect_timeout: 10 });
	try {
		let result: JsonRecord;
		if (command === 'plan') {
			result = await sql.begin(async (tx) => {
				await tx`SET TRANSACTION READ ONLY`;
				const preflight = await inspect(tx);
				return report(command, identity, preflight, buildPlan(preflight));
			});
		} else if (command === 'apply') {
			result = await apply(sql, identity);
		} else if (command === 'verify') {
			result = await verify(sql, identity);
		} else {
			result = await rollback(sql, identity);
		}
		console.log(JSON.stringify(result));
	} finally {
		await sql.end({ timeout: 5 });
	}
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : 'Catalog seed command failed.');
	process.exitCode = 1;
});
