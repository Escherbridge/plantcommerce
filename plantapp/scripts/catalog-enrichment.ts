import { createHash, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import postgres from 'postgres';

type Command = 'plan' | 'apply' | 'verify';

const command = process.argv[2] as Command | undefined;
if (!command || !['plan', 'apply', 'verify'].includes(command)) {
	throw new Error('Usage: npx tsx scripts/catalog-enrichment.ts <plan|apply|verify>');
}

const migrationUrl = new URL('../drizzle/0009_catalog_enrichment.sql', import.meta.url);
const enrichmentSpec = Object.freeze({
	version: '2026-07-22.1',
	contentAreas: [
		'hydroponics',
		'aquaponics',
		'seeds-propagation',
		'soil-compost',
		'permaculture',
		'agroforestry-silvopasture',
		'tools-equipment',
		'indoor-growing'
	],
	attributes: ['growing-system', 'experience-level', 'growing-environment', 'product-kind'],
	mediaPolicy: 'Bundled AI mock assets stay mock_test and rights-unverified.',
	manufacturerPolicy: 'Do not infer or create manufacturers without reviewed evidence.'
});

const requiredRelations = [
	'product_catalog_profile',
	'product_category_assignment',
	'catalog_tag',
	'product_tag',
	'catalog_manufacturer',
	'product_manufacturer',
	'catalog_content_area',
	'product_content_area',
	'catalog_attribute',
	'catalog_attribute_option',
	'product_attribute_value',
	'content_tag',
	'content_page_area',
	'product_content_link',
	'catalog_media_asset',
	'product_media_assignment',
	'catalog_enrichment_run'
] as const;

function required(name: string): string {
	const value = process.env[name]?.trim();
	if (!value) throw new Error(`${name} is required.`);
	return value;
}

function sha256(value: string | Buffer): string {
	return createHash('sha256').update(value).digest('hex');
}

function connectionFingerprint(databaseUrl: string): string {
	const parsed = new URL(databaseUrl);
	const authority = [
		parsed.protocol,
		parsed.username,
		parsed.hostname,
		parsed.port || '5432',
		parsed.pathname.replace(/^\//, '')
	].join('|');
	return sha256(authority);
}

function assertIdentity(databaseUrl: string) {
	const pairs = [
		['project ID', 'RAILWAY_PROJECT_ID', 'CATALOG_ENRICHMENT_EXPECTED_RAILWAY_PROJECT_ID'],
		[
			'environment ID',
			'RAILWAY_ENVIRONMENT_ID',
			'CATALOG_ENRICHMENT_EXPECTED_RAILWAY_ENVIRONMENT_ID'
		],
		['app service ID', 'RAILWAY_SERVICE_ID', 'CATALOG_ENRICHMENT_EXPECTED_RAILWAY_SERVICE_ID'],
		[
			'database service ID',
			'CATALOG_ENRICHMENT_DATABASE_SERVICE_ID',
			'CATALOG_ENRICHMENT_EXPECTED_DATABASE_SERVICE_ID'
		],
		['release ID', 'RAILWAY_RELEASE_ID', 'CATALOG_ENRICHMENT_EXPECTED_RELEASE_ID'],
		['release commit', 'RAILWAY_GIT_COMMIT_SHA', 'CATALOG_ENRICHMENT_EXPECTED_RELEASE_COMMIT']
	] as const;

	for (const [label, actualName, expectedName] of pairs) {
		if (required(actualName) !== required(expectedName)) {
			throw new Error(
				`Refusing catalogue enrichment: ${label} does not match the reviewed target.`
			);
		}
	}

	const expectedFingerprint = required('CATALOG_ENRICHMENT_EXPECTED_CONNECTION_FINGERPRINT');
	if (connectionFingerprint(databaseUrl) !== expectedFingerprint) {
		throw new Error(
			'Refusing catalogue enrichment: database connection fingerprint is not approved.'
		);
	}

	return {
		releaseId: required('RAILWAY_RELEASE_ID'),
		releaseCommit: required('RAILWAY_GIT_COMMIT_SHA'),
		sourceCommit: required('CATALOG_ENRICHMENT_SOURCE_COMMIT'),
		expectedDatabaseName: required('CATALOG_ENRICHMENT_EXPECTED_DATABASE_NAME')
	};
}

async function relationState(sql: postgres.Sql) {
	const rows = await sql<{ name: string; exists: boolean }[]>`
		SELECT name, to_regclass('public.' || name) IS NOT NULL AS exists
		FROM unnest(${sql.array([...requiredRelations])}::text[]) AS relation(name)
		ORDER BY name
	`;
	const present = rows.filter((row) => row.exists).map((row) => row.name);
	return {
		present,
		missing: rows.filter((row) => !row.exists).map((row) => row.name),
		state: present.length === 0 ? 'absent' : present.length === rows.length ? 'complete' : 'partial'
	} as const;
}

async function assertDatabaseName(sql: postgres.Sql, expectedDatabaseName: string) {
	const [row] = await sql<{ database_name: string }[]>`SELECT current_database() AS database_name`;
	if (row.database_name !== expectedDatabaseName) {
		throw new Error('Refusing catalogue enrichment: connected database name is not approved.');
	}
	return row.database_name;
}

async function baseInventory(sql: postgres.Sql) {
	const [counts] = await sql<
		{
			products: number;
			categories: number;
			product_images: number;
			product_files: number;
			content_pages: number;
			invalid_product_tags: number;
			invalid_content_tags: number;
			dangling_images: number;
			multiple_primary_images: number;
		}[]
	>`
		SELECT
			(SELECT count(*)::int FROM product) AS products,
			(SELECT count(*)::int FROM product_category) AS categories,
			(SELECT count(*)::int FROM product_image) AS product_images,
			(SELECT count(*)::int FROM file WHERE entity_type = 'product') AS product_files,
			(SELECT count(*)::int FROM content_page) AS content_pages,
			(SELECT count(*)::int FROM product WHERE tags IS NOT NULL AND NOT pg_input_is_valid(tags, 'jsonb')) AS invalid_product_tags,
			(SELECT count(*)::int FROM content_page WHERE tags IS NOT NULL AND NOT pg_input_is_valid(tags, 'jsonb')) AS invalid_content_tags,
			(SELECT count(*)::int FROM product_image AS image LEFT JOIN file ON file.id = image.file_id WHERE file.id IS NULL) AS dangling_images,
			(SELECT count(*)::int FROM (SELECT product_id FROM product_image WHERE is_main GROUP BY product_id HAVING count(*) > 1) AS duplicate_main) AS multiple_primary_images
	`;
	return counts;
}

function splitMigration(migrationSql: string): string[] {
	const statements = migrationSql
		.split('--> statement-breakpoint')
		.map((statement) => statement.trim())
		.filter(Boolean);
	if (!statements[0]?.endsWith('BEGIN;') || statements.at(-1) !== 'COMMIT;') {
		throw new Error('Migration artifact must retain its reviewed BEGIN/COMMIT boundary.');
	}
	statements[0] = statements[0].replace(/BEGIN;\s*$/, '').trim();
	statements.pop();
	return statements.filter(Boolean);
}

async function seedEnrichment(tx: postgres.TransactionSql) {
	await tx.unsafe(`
		INSERT INTO product_catalog_profile (product_id, data_class, disclosure, metadata)
		SELECT p.id,
			CASE WHEN bool_or(COALESCE(f.bucket_path LIKE 'AI-MockAssets/%', false)) THEN 'mock_test' ELSE 'research' END,
			CASE WHEN bool_or(COALESCE(f.bucket_path LIKE 'AI-MockAssets/%', false))
				THEN 'Mock/test catalogue data with illustrative AI-generated media; not verified product photography or manufacturer data.'
				ELSE 'Catalogue metadata remains under review.' END,
			jsonb_build_object('source', 'legacy-catalogue-backfill', 'version', '${enrichmentSpec.version}')
		FROM product AS p
		LEFT JOIN product_image AS image ON image.product_id = p.id
		LEFT JOIN file AS f ON f.id = image.file_id
		GROUP BY p.id
		ON CONFLICT (product_id) DO UPDATE SET
			data_class = EXCLUDED.data_class,
			disclosure = EXCLUDED.disclosure,
			metadata = product_catalog_profile.metadata || EXCLUDED.metadata,
			updated_at = now();

		INSERT INTO product_category (name, slug, description, parent_id, sort_order, is_active)
		VALUES ('Seeds & Propagation', 'seeds', 'Seeds, seedlings, grafting, and propagation materials.', NULL, 15, true)
		ON CONFLICT (slug) DO NOTHING;

		WITH RECURSIVE lineage AS (
			SELECT p.id AS product_id, p.category_id, 0 AS depth
			FROM product AS p
			UNION ALL
			SELECT lineage.product_id, category.parent_id, lineage.depth + 1
			FROM lineage
			INNER JOIN product_category AS category ON category.id = lineage.category_id
			WHERE category.parent_id IS NOT NULL
		)
		INSERT INTO product_category_assignment (product_id, category_id, is_primary, sort_order)
		SELECT product_id, category_id, depth = 0, depth
		FROM lineage
		ON CONFLICT (product_id, category_id) DO UPDATE SET
			is_primary = EXCLUDED.is_primary,
			sort_order = EXCLUDED.sort_order;

		WITH raw_tags AS (
			SELECT value AS name
			FROM product, LATERAL jsonb_array_elements_text(COALESCE(tags::jsonb, '[]'::jsonb)) AS value
			UNION ALL
			SELECT value AS name
			FROM content_page, LATERAL jsonb_array_elements_text(COALESCE(tags::jsonb, '[]'::jsonb)) AS value
		), normalized AS (
			SELECT trim(BOTH '-' FROM lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'))) AS slug,
				min(trim(name)) AS name
			FROM raw_tags
			GROUP BY 1
		)
		INSERT INTO catalog_tag (slug, name)
		SELECT slug, name FROM normalized WHERE slug <> ''
		ON CONFLICT (slug) DO NOTHING;

		INSERT INTO product_tag (product_id, tag_id)
		SELECT p.id, tag.id
		FROM product AS p
		CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(p.tags::jsonb, '[]'::jsonb)) AS raw(name)
		INNER JOIN catalog_tag AS tag
			ON tag.slug = trim(BOTH '-' FROM lower(regexp_replace(trim(raw.name), '[^a-zA-Z0-9]+', '-', 'g')))
		ON CONFLICT DO NOTHING;

		INSERT INTO product_category_assignment (product_id, category_id, is_primary, sort_order)
		SELECT DISTINCT product_tag.product_id, category.id, false, 50
		FROM product_tag
		INNER JOIN catalog_tag AS tag ON tag.id = product_tag.tag_id
		INNER JOIN product_category AS category ON category.slug = 'seeds'
		WHERE tag.slug IN ('seed', 'seeds', 'seedlings', 'tree-seeds', 'heirloom')
		ON CONFLICT DO NOTHING;

		INSERT INTO content_tag (content_page_id, tag_id)
		SELECT content.id, tag.id
		FROM content_page AS content
		CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(content.tags::jsonb, '[]'::jsonb)) AS raw(name)
		INNER JOIN catalog_tag AS tag
			ON tag.slug = trim(BOTH '-' FROM lower(regexp_replace(trim(raw.name), '[^a-zA-Z0-9]+', '-', 'g')))
		ON CONFLICT DO NOTHING;

		INSERT INTO catalog_content_area (slug, name, description, sort_order)
		VALUES
			('hydroponics', 'Hydroponics', 'Water-based growing systems, media, nutrients, and maintenance.', 10),
			('aquaponics', 'Aquaponics', 'Integrated fish and plant systems, water quality, and cycling.', 20),
			('seeds-propagation', 'Seeds & Propagation', 'Seeds, seedlings, grafting, and propagation practice.', 30),
			('soil-compost', 'Soil & Compost', 'Soil health, amendments, composting, and biology.', 40),
			('permaculture', 'Permaculture', 'Polyculture, habitat, water, and whole-system design.', 50),
			('agroforestry-silvopasture', 'Agroforestry & Silvopasture', 'Trees, forage, livestock integration, and forest farming.', 60),
			('tools-equipment', 'Tools & Equipment', 'Tools, meters, infrastructure, and durable equipment.', 70),
			('indoor-growing', 'Indoor Growing', 'Controlled-environment, countertop, and year-round growing.', 80)
		ON CONFLICT (slug) DO NOTHING;

		WITH rules(area_slug, terms) AS (
			VALUES
				('hydroponics', ARRAY['hydroponic','hydroponics','aeroponic','nft','dwc','rockwool','clay-pebbles','nutrients']),
				('aquaponics', ARRAY['aquaponics','fish','tilapia','bell-siphon','water-testing']),
				('seeds-propagation', ARRAY['seed','seeds','seedlings','grafting','propagation','heirloom','wildflower','tree-seeds']),
				('soil-compost', ARRAY['soil','soil-health','composting','vermicompost','amendments','biochar','mycorrhizae']),
				('permaculture', ARRAY['permaculture','companion-planting','polyculture','rainwater','beneficial-insects']),
				('agroforestry-silvopasture', ARRAY['agroforestry','silvopasture','livestock','forage','tree','nitrogen-fixing']),
				('tools-equipment', ARRAY['tool','trowel','testing','precision','system','meter','infrastructure']),
				('indoor-growing', ARRAY['indoor','countertop','grow-tent','microgreens','mushroom','year-round'])
		)
		INSERT INTO product_content_area (product_id, content_area_id)
		SELECT DISTINCT product_tag.product_id, area.id
		FROM rules
		INNER JOIN catalog_content_area AS area ON area.slug = rules.area_slug
		INNER JOIN catalog_tag AS tag ON tag.slug = ANY(rules.terms)
		INNER JOIN product_tag ON product_tag.tag_id = tag.id
		ON CONFLICT DO NOTHING;

		WITH category_rules(area_slug, category_slugs) AS (
			VALUES
				('hydroponics', ARRAY['hydroponics','hydroponic-systems','nutrients-media']),
				('aquaponics', ARRAY['aquaponics','aquaponic-systems','fish-supplies']),
				('seeds-propagation', ARRAY['seeds','plants-seeds','heirloom-seeds','medicinal-herbs','pollinator-plants','tree-forage-seeds','tree-crops']),
				('soil-compost', ARRAY['composting','soil-testing']),
				('permaculture', ARRAY['kits-collections','starter-kits']),
				('agroforestry-silvopasture', ARRAY['silvopasture','agroforestry','livestock-integration','forest-farming']),
				('tools-equipment', ARRAY['garden-tools','hand-tools','soil-testing'])
		)
		INSERT INTO product_content_area (product_id, content_area_id)
		SELECT DISTINCT assignment.product_id, area.id
		FROM category_rules
		INNER JOIN catalog_content_area AS area ON area.slug = category_rules.area_slug
		INNER JOIN product_category AS category ON category.slug = ANY(category_rules.category_slugs)
		INNER JOIN product_category_assignment AS assignment ON assignment.category_id = category.id
		ON CONFLICT DO NOTHING;

		WITH rules(area_slug, terms) AS (
			VALUES
				('hydroponics', ARRAY['hydroponics','hydroponic','indoor-growing']),
				('aquaponics', ARRAY['aquaponics','fish','nitrogen-cycle']),
				('seeds-propagation', ARRAY['seedlings','companion-planting','beginner']),
				('soil-compost', ARRAY['soil-health','composting','biology']),
				('permaculture', ARRAY['permaculture','polyculture','companion-planting','biodiversity']),
				('agroforestry-silvopasture', ARRAY['silvopasture','agroforestry','livestock','regenerative'])
		)
		INSERT INTO content_page_area (content_page_id, content_area_id)
		SELECT DISTINCT content_tag.content_page_id, area.id
		FROM rules
		INNER JOIN catalog_content_area AS area ON area.slug = rules.area_slug
		INNER JOIN catalog_tag AS tag ON tag.slug = ANY(rules.terms)
		INNER JOIN content_tag ON content_tag.tag_id = tag.id
		ON CONFLICT DO NOTHING;

		INSERT INTO product_content_link (product_id, content_page_id, relationship, sort_order)
		SELECT DISTINCT product_tag.product_id, content_tag.content_page_id,
			CASE content.type WHEN 'guide' THEN 'guide' WHEN 'faq' THEN 'faq' ELSE 'recommended' END,
			0
		FROM product_tag
		INNER JOIN content_tag ON content_tag.tag_id = product_tag.tag_id
		INNER JOIN content_page AS content ON content.id = content_tag.content_page_id
		WHERE content.status = 'published'
		ON CONFLICT DO NOTHING;

		INSERT INTO product_content_link (product_id, content_page_id, relationship, sort_order)
		SELECT DISTINCT product_area.product_id, content_area.content_page_id,
			CASE content.type WHEN 'guide' THEN 'guide' WHEN 'faq' THEN 'faq' ELSE 'recommended' END,
			10
		FROM product_content_area AS product_area
		INNER JOIN content_page_area AS content_area ON content_area.content_area_id = product_area.content_area_id
		INNER JOIN content_page AS content ON content.id = content_area.content_page_id
		WHERE content.status = 'published'
		ON CONFLICT DO NOTHING;

		INSERT INTO catalog_attribute (slug, name, description, value_type, sort_order)
		VALUES
			('growing-system', 'Growing system', 'Primary growing approach represented by the listing.', 'option', 10),
			('experience-level', 'Experience level', 'Suggested experience level inferred from existing test metadata.', 'option', 20),
			('growing-environment', 'Growing environment', 'Typical environment represented by existing test metadata.', 'option', 30),
			('product-kind', 'Product kind', 'Broad catalogue form used for filtering.', 'option', 40)
		ON CONFLICT (slug) DO NOTHING;

		WITH options(attribute_slug, option_slug, option_name, sort_order) AS (
			VALUES
				('growing-system','hydroponics','Hydroponics',10),
				('growing-system','aquaponics','Aquaponics',20),
				('growing-system','soil-based','Soil-based',30),
				('growing-system','agroforestry-silvopasture','Agroforestry & silvopasture',40),
				('growing-system','multi-system','Multi-system',50),
				('experience-level','beginner','Beginner',10),
				('experience-level','intermediate','Intermediate',20),
				('experience-level','advanced','Advanced',30),
				('growing-environment','indoor','Indoor',10),
				('growing-environment','outdoor','Outdoor',20),
				('growing-environment','greenhouse','Greenhouse',30),
				('growing-environment','mixed','Mixed',40),
				('product-kind','seeds-plants','Seeds & plants',10),
				('product-kind','system','System',20),
				('product-kind','kit','Kit',30),
				('product-kind','tool','Tool',40),
				('product-kind','supply','Supply',50)
		)
		INSERT INTO catalog_attribute_option (attribute_id, slug, name, sort_order)
		SELECT attribute.id, options.option_slug, options.option_name, options.sort_order
		FROM options
		INNER JOIN catalog_attribute AS attribute ON attribute.slug = options.attribute_slug
		ON CONFLICT (attribute_id, slug) DO NOTHING;

		WITH classified AS (
			SELECT p.id AS product_id,
				CASE
					WHEN EXISTS (SELECT 1 FROM product_content_area pa JOIN catalog_content_area a ON a.id = pa.content_area_id WHERE pa.product_id = p.id AND a.slug = 'hydroponics') THEN 'hydroponics'
					WHEN EXISTS (SELECT 1 FROM product_content_area pa JOIN catalog_content_area a ON a.id = pa.content_area_id WHERE pa.product_id = p.id AND a.slug = 'aquaponics') THEN 'aquaponics'
					WHEN EXISTS (SELECT 1 FROM product_content_area pa JOIN catalog_content_area a ON a.id = pa.content_area_id WHERE pa.product_id = p.id AND a.slug = 'agroforestry-silvopasture') THEN 'agroforestry-silvopasture'
					ELSE 'soil-based' END AS growing_system,
				CASE
					WHEN EXISTS (SELECT 1 FROM product_tag pt JOIN catalog_tag t ON t.id = pt.tag_id WHERE pt.product_id = p.id AND t.slug = 'advanced') THEN 'advanced'
					WHEN EXISTS (SELECT 1 FROM product_tag pt JOIN catalog_tag t ON t.id = pt.tag_id WHERE pt.product_id = p.id AND t.slug IN ('beginner','starter')) THEN 'beginner'
					ELSE 'intermediate' END AS experience_level,
				CASE
					WHEN EXISTS (SELECT 1 FROM product_tag pt JOIN catalog_tag t ON t.id = pt.tag_id WHERE pt.product_id = p.id AND t.slug = 'greenhouse') THEN 'greenhouse'
					WHEN EXISTS (SELECT 1 FROM product_tag pt JOIN catalog_tag t ON t.id = pt.tag_id WHERE pt.product_id = p.id AND t.slug IN ('indoor','countertop','grow-tent')) THEN 'indoor'
					WHEN EXISTS (SELECT 1 FROM product_tag pt JOIN catalog_tag t ON t.id = pt.tag_id WHERE pt.product_id = p.id AND t.slug IN ('patio','pasture','livestock','tree','wildflower')) THEN 'outdoor'
					ELSE 'mixed' END AS growing_environment,
				CASE
					WHEN p.sku LIKE 'PLT-%' OR EXISTS (SELECT 1 FROM product_tag pt JOIN catalog_tag t ON t.id = pt.tag_id WHERE pt.product_id = p.id AND t.slug IN ('seed','seeds','seedlings','tree-seeds')) THEN 'seeds-plants'
					WHEN p.sku LIKE 'KIT-%' OR p.slug LIKE '%-kit' THEN 'kit'
					WHEN p.sku LIKE 'TLS-%' OR EXISTS (SELECT 1 FROM product_tag pt JOIN catalog_tag t ON t.id = pt.tag_id WHERE pt.product_id = p.id AND t.slug IN ('tool','meter','precision')) THEN 'tool'
					WHEN p.slug LIKE '%system%' OR p.slug LIKE '%tank%' OR p.slug LIKE '%grow-bed%' THEN 'system'
					ELSE 'supply' END AS product_kind
			FROM product AS p
		), values(attribute_slug, value_column) AS (
			VALUES
				('growing-system', 'growing_system'),
				('experience-level', 'experience_level'),
				('growing-environment', 'growing_environment'),
				('product-kind', 'product_kind')
		), expanded AS (
			SELECT classified.product_id, values.attribute_slug,
				CASE values.value_column
					WHEN 'growing_system' THEN classified.growing_system
					WHEN 'experience_level' THEN classified.experience_level
					WHEN 'growing_environment' THEN classified.growing_environment
					ELSE classified.product_kind END AS option_slug
			FROM classified CROSS JOIN values
		)
		INSERT INTO product_attribute_value (product_id, attribute_id, option_id)
		SELECT expanded.product_id, attribute.id, option.id
		FROM expanded
		INNER JOIN catalog_attribute AS attribute ON attribute.slug = expanded.attribute_slug
		INNER JOIN catalog_attribute_option AS option ON option.attribute_id = attribute.id AND option.slug = expanded.option_slug
		ON CONFLICT (product_id, attribute_id) DO UPDATE SET option_id = EXCLUDED.option_id, text_value = NULL, number_value = NULL, boolean_value = NULL, updated_at = now();

		INSERT INTO catalog_media_asset (file_id, kind, data_class, rights_status, provenance_note, metadata)
		SELECT DISTINCT f.id, 'image',
			CASE WHEN f.bucket_path LIKE 'AI-MockAssets/%' THEN 'mock_test' ELSE 'research' END,
			'unverified',
			CASE WHEN f.bucket_path LIKE 'AI-MockAssets/%'
				THEN 'Bundled AI-generated illustrative mock asset; generator and usage rights are not recorded.'
				ELSE 'Legacy catalogue media awaiting provenance review.' END,
			jsonb_build_object('legacyBucketPath', f.bucket_path)
		FROM product_image AS image
		INNER JOIN file AS f ON f.id = image.file_id
		ON CONFLICT (file_id) DO UPDATE SET
			data_class = EXCLUDED.data_class,
			rights_status = EXCLUDED.rights_status,
			provenance_note = EXCLUDED.provenance_note,
			metadata = catalog_media_asset.metadata || EXCLUDED.metadata,
			updated_at = now();

		INSERT INTO product_media_assignment (product_id, media_asset_id, role, alt_text, caption, sort_order)
		SELECT image.product_id, asset.id,
			CASE WHEN image.is_main THEN 'primary' ELSE 'gallery' END,
			image.alt_text,
			CASE WHEN asset.data_class = 'mock_test' THEN 'Illustrative mock image; not verified product photography.' ELSE NULL END,
			image.sort_order
		FROM product_image AS image
		INNER JOIN catalog_media_asset AS asset ON asset.file_id = image.file_id
		ON CONFLICT DO NOTHING;
	`);
}

async function verification(sql: postgres.Sql) {
	const [result] = await sql<
		{
			products: number;
			profiles: number;
			primary_categories: number;
			products_without_primary_category: number;
			products_with_multiple_primary_categories: number;
			legacy_distinct_product_tags: number;
			normalized_product_tags: number;
			content_areas: number;
			products_with_content_areas: number;
			content_links: number;
			attribute_values: number;
			media_assets: number;
			media_assignments: number;
			mock_profiles: number;
			mock_media: number;
			manufacturers: number;
			applied_runs: number;
		}[]
	>`
		SELECT
			(SELECT count(*)::int FROM product) AS products,
			(SELECT count(*)::int FROM product_catalog_profile) AS profiles,
			(SELECT count(*)::int FROM product_category_assignment WHERE is_primary) AS primary_categories,
			(SELECT count(*)::int FROM product p WHERE NOT EXISTS (SELECT 1 FROM product_category_assignment a WHERE a.product_id = p.id AND a.is_primary)) AS products_without_primary_category,
			(SELECT count(*)::int FROM (SELECT product_id FROM product_category_assignment WHERE is_primary GROUP BY product_id HAVING count(*) > 1) duplicate) AS products_with_multiple_primary_categories,
			(SELECT count(*)::int FROM (SELECT DISTINCT p.id, trim(BOTH '-' FROM lower(regexp_replace(trim(raw.name), '[^a-zA-Z0-9]+', '-', 'g'))) FROM product p CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(p.tags::jsonb, '[]'::jsonb)) raw(name)) legacy_tags) AS legacy_distinct_product_tags,
			(SELECT count(*)::int FROM product_tag) AS normalized_product_tags,
			(SELECT count(*)::int FROM catalog_content_area) AS content_areas,
			(SELECT count(DISTINCT product_id)::int FROM product_content_area) AS products_with_content_areas,
			(SELECT count(*)::int FROM product_content_link) AS content_links,
			(SELECT count(*)::int FROM product_attribute_value) AS attribute_values,
			(SELECT count(*)::int FROM catalog_media_asset) AS media_assets,
			(SELECT count(*)::int FROM product_media_assignment) AS media_assignments,
			(SELECT count(*)::int FROM product_catalog_profile WHERE data_class = 'mock_test') AS mock_profiles,
			(SELECT count(*)::int FROM catalog_media_asset WHERE data_class = 'mock_test') AS mock_media,
			(SELECT count(*)::int FROM catalog_manufacturer) AS manufacturers,
			(SELECT count(*)::int FROM catalog_enrichment_run WHERE status = 'applied') AS applied_runs
	`;
	const violations = {
		missingProfiles: result.profiles !== result.products,
		missingPrimaryCategories: result.products_without_primary_category !== 0,
		multiplePrimaryCategories: result.products_with_multiple_primary_categories !== 0,
		tagMismatch: result.legacy_distinct_product_tags !== result.normalized_product_tags,
		missingAttributes:
			result.attribute_values !== result.products * enrichmentSpec.attributes.length,
		missingMediaAssignments: result.media_assignments === 0,
		missingContentAreas: result.products_with_content_areas === 0
	};
	return { result, violations, ok: !Object.values(violations).some(Boolean) };
}

const migrationBytes = await readFile(migrationUrl);
const migrationHash = sha256(migrationBytes);
const seedHash = sha256(JSON.stringify(enrichmentSpec));
const databaseUrl = required('DATABASE_URL');
const identity = assertIdentity(databaseUrl);
const sql = postgres(databaseUrl, {
	max: 1,
	connect_timeout: 15,
	idle_timeout: 5,
	max_lifetime: 120,
	prepare: false
});

try {
	const databaseName = await assertDatabaseName(sql, identity.expectedDatabaseName);
	const state = await relationState(sql);
	if (state.state === 'partial') {
		throw new Error(
			`Refusing catalogue enrichment: partial schema detected (${state.present.join(', ')}).`
		);
	}

	if (command === 'plan') {
		const inventory = await sql.begin(async (tx) => {
			await tx.unsafe('SET TRANSACTION READ ONLY');
			return baseInventory(tx);
		});
		const integrityOk =
			inventory.invalid_product_tags === 0 &&
			inventory.invalid_content_tags === 0 &&
			inventory.dangling_images === 0 &&
			inventory.multiple_primary_images === 0;
		console.log(
			JSON.stringify(
				{
					command,
					databaseName,
					target: {
						projectId: required('RAILWAY_PROJECT_ID'),
						environmentId: required('RAILWAY_ENVIRONMENT_ID'),
						appServiceId: required('RAILWAY_SERVICE_ID'),
						databaseServiceId: required('CATALOG_ENRICHMENT_DATABASE_SERVICE_ID'),
						releaseId: identity.releaseId,
						releaseCommit: identity.releaseCommit,
						sourceCommit: identity.sourceCommit
					},
					schemaState: state.state,
					migrationHash,
					seedHash,
					inventory,
					integrityOk,
					writeEligible: integrityOk && state.state === 'absent'
				},
				null,
				2
			)
		);
		if (!integrityOk) process.exitCode = 1;
	} else if (command === 'apply') {
		const backupEvidence = required('CATALOG_ENRICHMENT_BACKUP_EVIDENCE');
		if (!/^sha256:[0-9a-f]{64}$/.test(backupEvidence)) {
			throw new Error('CATALOG_ENRICHMENT_BACKUP_EVIDENCE must be a sha256 evidence identifier.');
		}
		const confirmation = [
			'apply',
			identity.releaseId,
			identity.sourceCommit,
			migrationHash,
			seedHash,
			backupEvidence
		].join(':');
		if (required('CATALOG_ENRICHMENT_CONFIRMATION') !== confirmation) {
			throw new Error(
				'Refusing catalogue enrichment: confirmation does not bind the reviewed release, artifacts, and backup.'
			);
		}
		if (state.state !== 'absent') {
			throw new Error('Refusing catalogue enrichment apply: schema already exists; use verify.');
		}

		const inventory = await baseInventory(sql);
		if (
			inventory.invalid_product_tags ||
			inventory.invalid_content_tags ||
			inventory.dangling_images ||
			inventory.multiple_primary_images
		) {
			throw new Error('Refusing catalogue enrichment: preflight integrity checks failed.');
		}

		const runId = `catalog-enrichment-${randomUUID()}`;
		const statements = splitMigration(migrationBytes.toString('utf8'));
		const summary = await sql.begin(async (tx) => {
			await tx.unsafe("SET LOCAL lock_timeout = '5s'");
			await tx.unsafe("SET LOCAL statement_timeout = '120s'");
			await tx`SELECT pg_advisory_xact_lock(hashtext('aevani.catalog-enrichment.2026-07-22'))`;
			for (const statement of statements) await tx.unsafe(statement);
			await seedEnrichment(tx);
			const verified = await verification(tx);
			if (!verified.ok)
				throw new Error('Catalogue enrichment verification failed inside the write transaction.');
			await tx`
				INSERT INTO catalog_enrichment_run (
					run_id, action, status, release_id, source_commit, migration_hash, seed_hash,
					backup_evidence, summary, completed_at
				) VALUES (
					${runId}, 'apply', 'applied', ${identity.releaseId}, ${identity.sourceCommit},
					${migrationHash}, ${seedHash}, ${backupEvidence}, ${tx.json(verified.result)}, now()
				)
			`;
			return verified.result;
		});
		console.log(JSON.stringify({ command, runId, migrationHash, seedHash, summary }, null, 2));
	} else {
		if (state.state !== 'complete') {
			throw new Error(
				'Catalogue enrichment schema is absent; apply the reviewed artifact before verify.'
			);
		}
		const verified = await sql.begin(async (tx) => {
			await tx.unsafe('SET TRANSACTION READ ONLY');
			return verification(tx);
		});
		console.log(JSON.stringify({ command, migrationHash, seedHash, ...verified }, null, 2));
		if (!verified.ok) process.exitCode = 1;
	}
} finally {
	await sql.end({ timeout: 5 });
}
