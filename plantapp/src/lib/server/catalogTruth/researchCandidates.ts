import { createResearchOnlyCandidate, type CatalogTruthEvidence } from './contracts';

function localEvidence(
	id: string,
	assertion: string,
	file: string,
	lineStart: number,
	lineEnd = lineStart
): CatalogTruthEvidence {
	return {
		id,
		assertion,
		verificationStatus: 'unverified',
		source: { file, lineStart, lineEnd }
	};
}

/** Local research leads only. These are intentionally neither offers nor database inventory. */
export const researchOnlyCatalogCandidates = [
	createResearchOnlyCandidate({
		id: 'research_heirloom_tomato_collection',
		title: 'Heirloom Tomato Collection',
		offeringKind: 'stocked_product',
		sourceEvidence: [
			localEvidence(
				'seed-heirloom-tomato',
				'UAT seed data names a tomato collection; its product facts are not operational evidence.',
				'plantapp/src/lib/server/db/seed.ts',
				336,
				354
			),
			localEvidence(
				'chat-heirloom-tomato-lead',
				'Local white-label research mentions a tomato seed/plant concept without verification.',
				'chat (2).md',
				174
			)
		]
	}),
	createResearchOnlyCandidate({
		id: 'research_dwc_bucket_system',
		title: 'Deep Water Culture Bucket System',
		offeringKind: 'dropship_white_label',
		sourceEvidence: [
			localEvidence(
				'seed-dwc-bucket',
				'UAT seed data names a DWC bucket system; its operational values are not verified.',
				'plantapp/src/lib/server/db/seed.ts',
				446,
				461
			),
			localEvidence(
				'chat-dwc-white-label-lead',
				'Local research identifies a DWC bucket as a possible white-label lead only.',
				'chat (2).md',
				195
			)
		]
	}),
	createResearchOnlyCandidate({
		id: 'research_vertical_tower_garden',
		title: 'Vertical Tower Garden System',
		offeringKind: 'external_affiliate_offer',
		sourceEvidence: [
			localEvidence(
				'seed-vertical-tower',
				'UAT seed data names a vertical tower concept; it is not an affiliate offer.',
				'plantapp/src/lib/server/db/seed.ts',
				463,
				478
			),
			localEvidence(
				'chat-affiliate-flagship-strategy',
				'Local strategy proposes affiliate-first treatment for high-ticket systems, pending program verification.',
				'chat (2).md',
				281
			)
		]
	}),
	createResearchOnlyCandidate({
		id: 'research_regenerative_agriculture_fundamentals',
		title: 'Regenerative Agriculture Fundamentals',
		offeringKind: 'course',
		sourceEvidence: [
			localEvidence(
				'catalogue-regenerative-course',
				'Local product catalogue lists a course concept; delivery, pricing, and enrollment are unverified.',
				'knowledge_base/05_product_catalogue/PRODUCT_CATALOGUE.md',
				76
			)
		]
	}),
	createResearchOnlyCandidate({
		id: 'research_silvopasture_design_service',
		title: 'Silvopasture Design Service',
		offeringKind: 'service',
		sourceEvidence: [
			localEvidence(
				'catalogue-silvopasture-service',
				'Local product catalogue lists a service concept; provider and delivery terms are unverified.',
				'knowledge_base/05_product_catalogue/PRODUCT_CATALOGUE.md',
				32
			)
		]
	}),
	createResearchOnlyCandidate({
		id: 'research_agroforestry_design_toolkit',
		title: 'Agroforestry Design Toolkit',
		offeringKind: 'subscription',
		sourceEvidence: [
			localEvidence(
				'catalogue-agroforestry-subscription',
				'Local product catalogue lists a subscription concept; access and billing terms are unverified.',
				'knowledge_base/05_product_catalogue/PRODUCT_CATALOGUE.md',
				33
			)
		]
	}),
	createResearchOnlyCandidate({
		id: 'research_marketplace_platform_access',
		title: 'Marketplace Platform Access',
		offeringKind: 'marketplace',
		sourceEvidence: [
			localEvidence(
				'catalogue-marketplace-access',
				'Local product catalogue lists marketplace access as a concept; no marketplace workflow is verified.',
				'knowledge_base/05_product_catalogue/PRODUCT_CATALOGUE.md',
				67
			)
		]
	})
] as const;
