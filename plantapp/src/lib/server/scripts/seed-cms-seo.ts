// Simplified version - creates JSON file instead of database
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedCmsSeoFields() {
	console.log('🌱 Creating mock CMS SEO data...');

	// Mock SEO fields for key pages - stored in JSON file
	const pages = [
		{
			id: '1',
			pageId: 'home',
			pageType: 'page',
			metaTitle: 'PlantCommerce | Sustainable Growing Tools & Supplies',
			metaDescription: 'Discover sustainable growing tools, hydroponic systems, and educational resources for modern growers.',
			ogTitle: 'PlantCommerce | Sustainable Gardening',
			ogDescription: 'Your source for sustainable growing tools and educational resources.',
			ogImage: '/images/AI-MockAssets/MAINHERO.png',
			robots: 'index, follow',
			canonicalUrl: 'https://plantcommerce.com',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: '2',
			pageId: 'products',
			pageType: 'category',
			metaTitle: 'Gardening Products & Supplies | PlantCommerce',
			metaDescription: 'Shop our collection of sustainable gardening products, hydroponic systems, aquaponics kits, and growing supplies.',
			ogTitle: 'Gardening Products | PlantCommerce',
			ogDescription: 'Sustainable gardening products and supplies for modern growers.',
			ogImage: '/images/AI-MockAssets/MAINHERO.png',
			robots: 'index, follow',
			canonicalUrl: 'https://plantcommerce.com/products',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: '3',
			pageId: 'products/hydroponics',
			pageType: 'category',
			metaTitle: 'Hydroponic Systems & Supplies | PlantCommerce',
			metaDescription: 'Complete hydroponic systems, grow lights, nutrients, and supplies for indoor gardening. Shop our hydroponics collection.',
			ogTitle: 'Hydroponic Gardening Supplies | PlantCommerce',
			ogDescription: 'Everything you need for successful hydroponic gardening.',
			ogImage: '/images/AI-MockAssets/HydroToolProduct-HydroponicGrowTentKit.png',
			robots: 'index, follow',
			canonicalUrl: 'https://plantcommerce.com/products/hydroponics',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: '4',
			pageId: 'blog',
			pageType: 'category',
			metaTitle: 'Gardening Blog & Resources | PlantCommerce',
			metaDescription: 'Learn about sustainable gardening, hydroponics, plant care, and growing techniques with our educational blog posts.',
			ogTitle: 'Gardening Blog | PlantCommerce',
			ogDescription: 'Educational resources for sustainable gardening.',
			ogImage: '/images/AI-MockAssets/MAINHERO.png',
			robots: 'index, follow',
			canonicalUrl: 'https://plantcommerce.com/blog',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}
	];

	try {
		// Create directory if it doesn't exist
		const dataDir = path.join(__dirname, '..', '..', '..', 'data');
		if (!fs.existsSync(dataDir)) {
			fs.mkdirSync(dataDir, { recursive: true });
		}

		// Write to JSON file
		const filePath = path.join(dataDir, 'cms-seo-fields.json');
		fs.writeFileSync(filePath, JSON.stringify(pages, null, 2));

		// Also create a TypeScript module for easy import
		const tsFilePath = path.join(__dirname, '..', '..', 'data', 'cmsSeoFields.ts');
		const tsContent = `// Auto-generated CMS SEO fields
export const cmsSeoFields = ${JSON.stringify(pages, null, 2)} as const;

export type CmsSeoField = typeof cmsSeoFields[number];
export default cmsSeoFields;
`;

		// Ensure the TypeScript data directory exists
		const tsDataDir = path.dirname(tsFilePath);
		if (!fs.existsSync(tsDataDir)) {
			fs.mkdirSync(tsDataDir, { recursive: true });
		}

		fs.writeFileSync(tsFilePath, tsContent);

		console.log(`✅ Created ${pages.length} mock CMS SEO field records`);
		console.log(`📁 Data saved to: ${filePath}`);
		console.log(`📁 TypeScript module: ${tsFilePath}`);

		return true;
	} catch (error) {
		console.error('❌ Error creating CMS SEO fields:', error);
		return false;
	}
}

// Run if called directly
if (import.meta.url.endsWith(process.argv[1])) {
	seedCmsSeoFields()
		.then(() => {
			console.log('🌱 Mock CMS SEO data creation complete');
			process.exit(0);
		})
		.catch((error) => {
			console.error('❌ Mock CMS SEO data creation failed:', error);
			process.exit(1);
		});
}
