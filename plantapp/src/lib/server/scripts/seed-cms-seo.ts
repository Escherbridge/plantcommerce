// Simplified version - creates JSON file instead of database
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedCmsSeoFields() {
	console.log('🌱 Creating local-development CMS SEO fixtures (not for public publication)...');

	// Local fixtures must be replaced with reviewed metadata before publication.
	const origin = (process.env.PUBLIC_BASE_URL?.trim() || 'https://aevani.example').replace(/\/+$/, '');
	const pages = [
		{
			id: '1',
			pageId: 'home',
			pageType: 'page',
			metaTitle: 'Aevani | Local Development Metadata Fixture',
			metaDescription: 'Local development fixture only. Configure reviewed production metadata before publishing.',
			ogTitle: 'Aevani | Local Development Metadata Fixture',
			ogDescription: 'Local development fixture only. Configure reviewed production metadata before publishing.',
			ogImage: '/images/AI-MockAssets/MAINHERO.png',
			robots: 'noindex, nofollow',
			canonicalUrl: origin,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: '2',
			pageId: 'products',
			pageType: 'category',
			metaTitle: 'Aevani Products | Local Development Metadata Fixture',
			metaDescription: 'Local development fixture only. Configure reviewed production metadata before publishing.',
			ogTitle: 'Aevani Products | Local Development Metadata Fixture',
			ogDescription: 'Local development fixture only. Configure reviewed production metadata before publishing.',
			ogImage: '/images/AI-MockAssets/MAINHERO.png',
			robots: 'noindex, nofollow',
			canonicalUrl: `${origin}/products`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: '3',
			pageId: 'products/hydroponics',
			pageType: 'category',
			metaTitle: 'Aevani Hydroponics | Local Development Metadata Fixture',
			metaDescription: 'Local development fixture only. Configure reviewed production metadata before publishing.',
			ogTitle: 'Aevani Hydroponics | Local Development Metadata Fixture',
			ogDescription: 'Local development fixture only. Configure reviewed production metadata before publishing.',
			ogImage: '/images/AI-MockAssets/HydroToolProduct-HydroponicGrowTentKit.png',
			robots: 'noindex, nofollow',
			canonicalUrl: `${origin}/products/hydroponics`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: '4',
			pageId: 'blog',
			pageType: 'category',
			metaTitle: 'Aevani Resources | Local Development Metadata Fixture',
			metaDescription: 'Local development fixture only. Configure reviewed production metadata before publishing.',
			ogTitle: 'Aevani Resources | Local Development Metadata Fixture',
			ogDescription: 'Local development fixture only. Configure reviewed production metadata before publishing.',
			ogImage: '/images/AI-MockAssets/MAINHERO.png',
			robots: 'noindex, nofollow',
			canonicalUrl: `${origin}/blog`,
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

		console.log(`✅ Created ${pages.length} local-development CMS SEO fixture records`);
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
			console.log('Local-development CMS SEO fixture creation complete');
			process.exit(0);
		})
		.catch((error) => {
			console.error('Local-development CMS SEO fixture creation failed:', error);
			process.exit(1);
		});
}
