/**
 * Prod-safe, idempotent LMS course loader.
 *
 * Inserts the demo LMS catalogue (categories, tags, 4 published courses with
 * modules -> lessons -> content blocks, and course<->category/tag + product-
 * category links) from `src/lib/server/db/lmsDemo.ts`. Idempotent: categories/
 * tags/courses are keyed by slug and only inserted when absent; a course that
 * already exists is left untouched. NEVER deletes and never touches users,
 * orders, enrollments, or any non-LMS-catalogue table.
 *
 * Usage:
 *   DATABASE_URL=... DEMO_LMS_UPSERT_CONFIRM=UPSERT_LMS npx tsx scripts/demo-lms-upsert.ts
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, sql } from 'drizzle-orm';
import crypto from 'node:crypto';
import * as lms from '../src/lib/server/db/lms-schema';
import * as schema from '../src/lib/server/db/schema';
import { lmsCategoryDefs, lmsTagDefs, lmsCourseDefs } from '../src/lib/server/db/lmsDemo';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	console.error('DATABASE_URL is required');
	process.exit(1);
}
if (process.env.DEMO_LMS_UPSERT_CONFIRM !== 'UPSERT_LMS') {
	console.error('Refusing to run without DEMO_LMS_UPSERT_CONFIRM=UPSERT_LMS');
	process.exit(1);
}

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client, { schema: { ...schema, ...lms } });

const uuid = () => crypto.randomUUID();
const slugify = (t: string) =>
	t
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');

async function main() {
	const host = new URL(DATABASE_URL!).host;
	console.log(`=== Aevani demo LMS upsert (idempotent) -> ${host} ===\n`);

	// Instructor: an existing admin user (courses require a valid instructorId).
	const [instructor] = await client<{ id: string }[]>`
		select id from "user" where role = 'admin' and is_active = true order by created_at asc limit 1`;
	if (!instructor) throw new Error('No active admin user found to own the courses.');
	const instructorId = instructor.id;

	// Product-category slug -> id (for course cross-sell links).
	const productCategories = await client<{ id: number; slug: string }[]>`
		select id, slug from product_category`;
	const productCategoryIdBySlug = new Map(productCategories.map((c) => [c.slug, c.id]));

	let insertedCategories = 0;
	let insertedTags = 0;
	let insertedCourses = 0;
	let skippedCourses = 0;
	let insertedModules = 0;
	let insertedLessons = 0;

	await db.transaction(async (tx) => {
		// Categories (by slug)
		const categoryIdBySlug = new Map<string, string>();
		for (let i = 0; i < lmsCategoryDefs.length; i++) {
			const c = lmsCategoryDefs[i];
			const existing = await tx
				.select({ id: lms.lmsCourseCategory.id })
				.from(lms.lmsCourseCategory)
				.where(eq(lms.lmsCourseCategory.slug, c.slug))
				.limit(1);
			if (existing[0]) {
				categoryIdBySlug.set(c.slug, existing[0].id);
				continue;
			}
			const id = uuid();
			await tx
				.insert(lms.lmsCourseCategory)
				.values({ id, name: c.name, slug: c.slug, description: null, sortOrder: i });
			categoryIdBySlug.set(c.slug, id);
			insertedCategories++;
		}

		// Tags (by slug)
		const tagIdBySlug = new Map<string, string>();
		for (const t of lmsTagDefs) {
			const existing = await tx
				.select({ id: lms.lmsCourseTag.id })
				.from(lms.lmsCourseTag)
				.where(eq(lms.lmsCourseTag.slug, t.slug))
				.limit(1);
			if (existing[0]) {
				tagIdBySlug.set(t.slug, existing[0].id);
				continue;
			}
			const id = uuid();
			await tx.insert(lms.lmsCourseTag).values({ id, name: t.name, slug: t.slug });
			tagIdBySlug.set(t.slug, id);
			insertedTags++;
		}

		// Courses (by slug) — skip if already present.
		for (let i = 0; i < lmsCourseDefs.length; i++) {
			const c = lmsCourseDefs[i];
			const existing = await tx
				.select({ id: lms.lmsCourse.id })
				.from(lms.lmsCourse)
				.where(eq(lms.lmsCourse.slug, c.slug))
				.limit(1);
			if (existing[0]) {
				skippedCourses++;
				continue;
			}

			const courseId = uuid();
			await tx.insert(lms.lmsCourse).values({
				id: courseId,
				title: c.title,
				slug: c.slug,
				description: c.description,
				courseType: 'self_paced',
				instructorId,
				difficulty: c.difficulty,
				language: 'en',
				durationEstimate: c.durationEstimate,
				pricingType: 'free',
				enrollmentType: 'open',
				passingScore: 70,
				status: 'published',
				version: 1,
				sortOrder: i,
				sequentialEnabled: true,
				isFeatured: c.isFeatured,
				metaTitle: `${c.title} | Aevani Learn`,
				metaDescription: c.description
			});
			insertedCourses++;

			const categoryId = categoryIdBySlug.get(c.categorySlug);
			if (categoryId) {
				await tx.insert(lms.lmsCourseToCategoryJoin).values({ courseId, categoryId });
			}
			for (const tagSlug of c.tagSlugs) {
				const tagId = tagIdBySlug.get(tagSlug);
				if (tagId) await tx.insert(lms.lmsCourseToTagJoin).values({ courseId, tagId });
			}
			const productCategoryId = productCategoryIdBySlug.get(c.productCategorySlug);
			if (productCategoryId) {
				await tx
					.insert(lms.lmsCourseProduct)
					.values({ id: uuid(), courseId, productCategoryId });
			}

			for (let m = 0; m < c.modules.length; m++) {
				const mod = c.modules[m];
				const moduleId = uuid();
				await tx.insert(lms.lmsModule).values({
					id: moduleId,
					title: mod.title,
					slug: `${c.slug}-${slugify(mod.title)}`,
					description: null,
					courseId,
					sortOrder: m,
					isPublished: true
				});
				insertedModules++;

				for (let l = 0; l < mod.lessons.length; l++) {
					const lesson = mod.lessons[l];
					const lessonId = uuid();
					await tx.insert(lms.lmsLesson).values({
						id: lessonId,
						title: lesson.title,
						slug: `${c.slug}-${slugify(mod.title)}-${slugify(lesson.title)}`,
						description: null,
						moduleId,
						sortOrder: l,
						isPublished: true,
						isPreview: lesson.isPreview ?? false,
						estimatedMinutes: 15
					});
					insertedLessons++;

					await tx.insert(lms.lmsContentBlock).values({
						id: uuid(),
						lessonId,
						type: 'text',
						title: lesson.title,
						content: `<p>${lesson.body}</p>`,
						sortOrder: 0,
						isRequired: true,
						completionThreshold: 100
					});
				}
			}
		}
	});

	const [{ total }] = await client<{ total: number }[]>`
		select count(*)::int as total from lms_course where status = 'published'`;

	console.log('Upsert complete:');
	console.log(`  Categories inserted: ${insertedCategories}`);
	console.log(`  Tags inserted:       ${insertedTags}`);
	console.log(`  Courses inserted:    ${insertedCourses}`);
	console.log(`  Courses skipped:     ${skippedCourses} (already present)`);
	console.log(`  Modules inserted:    ${insertedModules}`);
	console.log(`  Lessons inserted:    ${insertedLessons}`);
	console.log(`  Published courses now: ${total}`);
	console.log('\n  No users, orders, enrollments, or non-LMS-catalogue tables were modified.');

	await client.end();
}

main().catch(async (err) => {
	console.error('LMS upsert failed:', err);
	await client.end();
	process.exit(1);
});
