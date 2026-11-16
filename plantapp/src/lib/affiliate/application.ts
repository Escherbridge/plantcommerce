import { authHandoffHref } from '$lib/auth/safeRedirect';

/** Audience channels an applicant can choose. Values are stored, labels are shown. */
export const affiliatePromotionMethods = [
	{ value: 'website', label: 'Website or blog' },
	{ value: 'social', label: 'Social' },
	{ value: 'email', label: 'Email' },
	{ value: 'video', label: 'Video' },
	{ value: 'other', label: 'Other' }
] as const;

/** Audience-size bands. These describe reach, not payment timing. */
export const affiliateTrafficBands = [
	{ value: 'under-1000', label: 'Under 1,000' },
	{ value: '1000-10000', label: '1,000 to 10,000' },
	{ value: '10000-50000', label: '10,000 to 50,000' },
	{ value: '50000-plus', label: '50,000 or more' }
] as const;

export type AffiliatePromotionMethod = (typeof affiliatePromotionMethods)[number]['value'];
export type AffiliateTrafficBand = (typeof affiliateTrafficBands)[number]['value'];

export interface AffiliateApplicationDraft {
	website: string;
	socialMedia: string;
	audience: string;
	promotionMethod: string;
	monthlyTraffic: string;
	whyJoin: string;
	agreeTerms: boolean;
}

export interface AffiliateApplicationPayload {
	website?: string;
	socialMedia?: string;
	audience: string;
	promotionMethod: AffiliatePromotionMethod;
	monthlyTraffic: AffiliateTrafficBand;
	whyJoin: string;
	agreeTerms: true;
}

const promotionValues = new Set<string>(affiliatePromotionMethods.map((method) => method.value));
const trafficValues = new Set<string>(affiliateTrafficBands.map((band) => band.value));

export const emptyAffiliateApplication = (): AffiliateApplicationDraft => ({
	website: '',
	socialMedia: '',
	audience: '',
	promotionMethod: '',
	monthlyTraffic: '',
	whyJoin: '',
	agreeTerms: false
});

function optionalText(value: string, max: number): string | undefined {
	const trimmed = value.trim();
	if (!trimmed) return undefined;
	return trimmed.slice(0, max);
}

/** Field errors for the join form. An empty object means the draft can be submitted. */
export function affiliateApplicationErrors(
	draft: AffiliateApplicationDraft
): Record<string, string> {
	const errors: Record<string, string> = {};
	const website = draft.website.trim();
	const social = draft.socialMedia.trim();
	const audience = draft.audience.trim();
	const whyJoin = draft.whyJoin.trim();

	if (website.length > 200) errors.website = 'Website must be 200 characters or fewer';
	if (social.length > 200) errors.socialMedia = 'Social link must be 200 characters or fewer';
	if (!audience) errors.audience = 'Describe the people you reach';
	else if (audience.length > 2000) errors.audience = 'Audience must be 2000 characters or fewer';
	if (!promotionValues.has(draft.promotionMethod)) {
		errors.promotionMethod = 'Choose how you will share links';
	}
	if (!trafficValues.has(draft.monthlyTraffic)) {
		errors.monthlyTraffic = 'Choose an audience size';
	}
	if (!whyJoin) errors.whyJoin = 'Describe how you will send shoppers here';
	else if (whyJoin.length > 2000) errors.whyJoin = 'That answer must be 2000 characters or fewer';
	if (!draft.agreeTerms) errors.agreeTerms = 'Agree to the participation terms to continue';

	return errors;
}

/** Convert a valid draft into the API payload. Returns null when validation fails. */
export function affiliateApplicationPayload(
	draft: AffiliateApplicationDraft
): AffiliateApplicationPayload | null {
	if (Object.keys(affiliateApplicationErrors(draft)).length > 0) return null;
	return {
		website: optionalText(draft.website, 200),
		socialMedia: optionalText(draft.socialMedia, 200),
		audience: draft.audience.trim(),
		promotionMethod: draft.promotionMethod as AffiliatePromotionMethod,
		monthlyTraffic: draft.monthlyTraffic as AffiliateTrafficBand,
		whyJoin: draft.whyJoin.trim(),
		agreeTerms: true
	};
}

export type AffiliatePortalStatus = 'none' | 'active' | 'pending' | 'rejected' | 'suspended';

/** Portal access follows the affiliate row, not the user role alone. */
export function affiliatePortalStatus(
	affiliate: { status?: string | null; isActive?: boolean | null } | null | undefined
): AffiliatePortalStatus {
	if (!affiliate?.status) return 'none';
	if (affiliate.status === 'active' && affiliate.isActive) return 'active';
	if (
		affiliate.status === 'pending' ||
		affiliate.status === 'rejected' ||
		affiliate.status === 'suspended'
	) {
		return affiliate.status;
	}
	return 'pending';
}

const JOIN_PATH = '/affiliate/join';

/** Signed-out applicants finish account creation before the application is stored. */
export function affiliateSignupHref(origin: string): string {
	return authHandoffHref('register', JOIN_PATH, origin);
}

export function affiliateSignInHref(origin: string): string {
	return authHandoffHref('login', JOIN_PATH, origin);
}
