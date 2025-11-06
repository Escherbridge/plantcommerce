import type { PageLoad } from './$types';
import { requireAffiliate } from '$lib/loaders/protected';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async (event) => {
	await requireAffiliate(event);

	// Marketing materials would typically include:
	// - Downloadable images/banners
	// - Pre-written social media posts
	// - Email templates
	// - Brand guidelines
	// For now, return static marketing materials structure

	return {
		banners: [
			{
				id: 1,
				title: 'Hydroponics Hero Banner',
				size: '1200x628',
				format: 'PNG',
				url: '/marketing/banners/hydroponics-hero.png'
			},
			{
				id: 2,
				title: 'Aquaponics Square',
				size: '1080x1080',
				format: 'PNG',
				url: '/marketing/banners/aquaponics-square.png'
			}
		],
		socialPosts: [
			{
				id: 1,
				platform: 'Instagram',
				text: '🌱 Transform your gardening with hydroponics! Grow more using 90% less water. Check out our latest systems! [LINK]',
				hashtags: '#hydroponics #sustainablefarming #urbanfarming'
			},
			{
				id: 2,
				platform: 'Twitter/X',
				text: 'Did you know aquaponics can produce both fish and vegetables in the same system? 🐟🌿 Learn more:',
				hashtags: '#aquaponics #sustainability'
			}
		],
		emailTemplates: [
			{
				id: 1,
				title: 'Getting Started with Hydroponics',
				subject: 'Start Growing More with Less Water',
				preview: 'Discover how hydroponics can revolutionize your garden...'
			}
		],
		guidelines: {
			logoUrl: '/brand/logo.svg',
			colors: {
				primary: '#10B981',
				secondary: '#3B82F6',
				accent: '#F59E0B'
			},
			fonts: {
				heading: 'Inter',
				body: 'Inter'
			},
			dos: [
				'Use high-quality images of products',
				'Include accurate product information',
				'Mention sustainability benefits',
				'Share personal experience with products'
			],
			donts: [
				"Don't make exaggerated claims",
				"Don't use outdated promotional materials",
				"Don't misrepresent product capabilities",
				"Don't spam affiliate links"
			]
		}
	};
};
