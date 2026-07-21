import { eq } from 'drizzle-orm';
import { hash } from '@node-rs/argon2';
import { db } from '../db';
import * as table from '../db/schema';

/**
 * Seed the database with default categories for plant commerce
 */
export async function seedDefaultCategories() {
	console.log('🌱 Seeding default plant commerce categories...');

	const categories = [
		{
			name: 'Hydroponics',
			slug: 'hydroponics',
			description: 'Hydroponic systems, nutrients, and growing supplies for soilless cultivation',
			sortOrder: 1
		},
		{
			name: 'Aquaponics',
			slug: 'aquaponics',
			description: 'Aquaponic systems combining fish farming with plant cultivation',
			sortOrder: 2
		},
		{
			name: 'Agroforestry',
			slug: 'agroforestry',
			description: 'Trees, shrubs, and forest farming supplies for sustainable agriculture',
			sortOrder: 3
		},
		{
			name: 'Silvopasture',
			slug: 'silvopasture',
			description: 'Combining forestry and grazing for regenerative land management',
			sortOrder: 4
		}
	];

	try {
		for (const category of categories) {
			// Check if category already exists
			const existing = await db
				.select()
				.from(table.productCategory)
				.where(eq(table.productCategory.slug, category.slug))
				.limit(1);

			if (existing.length === 0) {
				await db.insert(table.productCategory).values(category);
				console.log(`✅ Created category: ${category.name}`);
			} else {
				console.log(`⚠️  Category already exists: ${category.name}`);
			}
		}

		console.log('🎉 Default categories seeded successfully!');
	} catch (error) {
		console.error('❌ Error seeding categories:', error);
		throw error;
	}
}

/**
 * Create admin user if none exists
 */
export async function createDefaultAdmin() {
	console.log('👤 Creating default admin user...');

	try {
		// Check if any admin users exist
		const adminExists = await db
			.select()
			.from(table.user)
			.where(eq(table.user.role, 'admin'))
			.limit(1);

		if (adminExists.length > 0) {
			console.log('⚠️  Admin user already exists');
			return;
		}

		const password = process.env.AEVANI_DEV_ADMIN_PASSWORD;
		if (!password || password.length < 16) {
			throw new Error('Set a unique AEVANI_DEV_ADMIN_PASSWORD with at least 16 characters before seeding an admin.');
		}

		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		// Create a local development admin using the caller-supplied password.
		const adminUser: typeof table.user.$inferInsert = {
			id: crypto.randomUUID(),
			username: 'admin',
			email: 'admin@aevani.local',
			passwordHash,
			firstName: 'Plant',
			lastName: 'Admin',
			role: 'admin',
			isActive: true
		};

		await db.insert(table.user).values(adminUser);
		console.log('Created development admin from the caller-supplied environment password');

	} catch (error) {
		console.error('❌ Error creating admin user:', error);
		throw error;
	}
}

/**
 * Run all seed operations
 */
export async function seedDatabase() {
	console.log('🚀 Starting database seeding...');
	
	try {
		await seedDefaultCategories();
		await createDefaultAdmin();
		console.log('🎉 Database seeding completed successfully!');
	} catch (error) {
		console.error('❌ Database seeding failed:', error);
		process.exit(1);
	}
}
