import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';
import { and, eq, gt, isNull, lt, or, sql } from 'drizzle-orm';
import { encodeBase64url } from '@oslojs/encoding';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { getPublicCatalogAvailability } from '$lib/server/catalogTruth/publicCatalog';
import AffiliateService from '$lib/server/services/affiliate';

export const affiliateAttributionCookieName = 'aevani_affiliate_attribution';
export const affiliateClientCookieName = 'aevani_affiliate_client';

const COOKIE_VERSION = 'v1';
const CAPABILITY_BYTES = 32;
const ATTRIBUTION_LIFETIME_SECONDS = 60 * 60 * 24 * 30;
const CLIENT_LIFETIME_SECONDS = 60 * 60 * 24;
const CLICK_DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;
const signedCookiePattern = /^v1\.([A-Za-z0-9_-]{43})\.(\d{10,11})\.([A-Za-z0-9_-]{43})$/;

export interface ResolvedAffiliateAttribution {
	id: string;
	affiliateLinkId: number;
}

type SignedCookie = {
	capability: string;
	expiresAt: Date;
};

function configuredSecret(): string | null {
	const secret = env.AFFILIATE_ATTRIBUTION_COOKIE_SECRET;
	if (!secret || secret.startsWith('replace-with-') || Buffer.byteLength(secret) < 32) {
		return null;
	}

	return secret;
}

/** Attribution remains unavailable until the source-only migration has been rehearsed and enabled. */
export function isAffiliateAttributionEnabled(): boolean {
	return env.AFFILIATE_ATTRIBUTION_ENABLED === 'true' && configuredSecret() !== null;
}

function cookieOptions(maxAge: number) {
	return {
		path: '/',
		maxAge,
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax' as const
	};
}

function signCookie(purpose: string, capability: string, expiresAtSeconds: string, secret: string): Buffer {
	return createHmac('sha256', secret)
		.update(`${purpose}\0${COOKIE_VERSION}\0${capability}\0${expiresAtSeconds}`)
		.digest();
}

function serializeCookie(purpose: string, capability: string, expiresAt: Date, secret: string): string {
	const expiresAtSeconds = Math.floor(expiresAt.getTime() / 1000).toString();
	const signature = signCookie(purpose, capability, expiresAtSeconds, secret).toString('base64url');
	return `${COOKIE_VERSION}.${capability}.${expiresAtSeconds}.${signature}`;
}

function readSignedCookie(cookies: Cookies, name: string, purpose: string, secret: string): SignedCookie | null {
	const value = cookies.get(name);
	if (!value) {
		return null;
	}

	const match = signedCookiePattern.exec(value);
	if (!match) {
		return null;
	}

	const [, capability, expiresAtSeconds, suppliedSignature] = match;
	const expiresAtMilliseconds = Number(expiresAtSeconds) * 1000;
	if (!Number.isSafeInteger(expiresAtMilliseconds) || expiresAtMilliseconds <= Date.now()) {
		return null;
	}

	const expectedSignature = signCookie(purpose, capability, expiresAtSeconds, secret);
	const providedSignature = Buffer.from(suppliedSignature, 'base64url');
	if (
		providedSignature.length !== expectedSignature.length ||
		!timingSafeEqual(providedSignature, expectedSignature)
	) {
		return null;
	}

	return { capability, expiresAt: new Date(expiresAtMilliseconds) };
}

function newCapability(): string {
	return encodeBase64url(crypto.getRandomValues(new Uint8Array(CAPABILITY_BYTES)));
}

function newAttributionId(): string {
	return `aat_${encodeBase64url(crypto.getRandomValues(new Uint8Array(24)))}`;
}

function hashValue(purpose: string, value: string, secret: string): string {
	return createHmac('sha256', secret)
		.update(`${purpose}\0${value}`)
		.digest('hex');
}

function clearCookie(cookies: Cookies, name: string): void {
	cookies.delete(name, { path: '/' });
}

/** Remove the legacy raw-link cookie wherever an attribution boundary is crossed. */
export function clearLegacyAffiliateCookie(cookies: Cookies): void {
	clearCookie(cookies, 'affiliate-link');
}

/** Retire a one-time server-issued attribution capability after a successful cart mutation. */
export function clearAffiliateAttributionCookie(cookies: Cookies): void {
	clearCookie(cookies, affiliateAttributionCookieName);
}

function readOrCreateClientCapability(cookies: Cookies, secret: string): string {
	const existing = readSignedCookie(cookies, affiliateClientCookieName, 'affiliate-client', secret);
	if (existing) {
		return existing.capability;
	}

	const capability = newCapability();
	const expiresAt = new Date(Date.now() + CLIENT_LIFETIME_SECONDS * 1000);
	cookies.set(
		affiliateClientCookieName,
		serializeCookie('affiliate-client', capability, expiresAt, secret),
		cookieOptions(CLIENT_LIFETIME_SECONDS)
	);
	return capability;
}

export class AffiliateAttributionService {
	/** Resolve an active approved link and, when enabled, issue its server-side attribution capability. */
	static async recordRedirect(
		linkCode: string,
		cookies: Cookies,
		userId?: string
	): Promise<table.AffiliateLink | null> {
		if (getPublicCatalogAvailability().status !== 'available') {
			return null;
		}
		const link = await AffiliateService.getLinkByCode(linkCode);
		if (!link) {
			return null;
		}

		clearLegacyAffiliateCookie(cookies);
		if (!isAffiliateAttributionEnabled()) {
			return link;
		}

		const secret = configuredSecret();
		if (!secret) {
			return link;
		}

		const clientCapability = readOrCreateClientCapability(cookies, secret);
		const clientHash = hashValue('aevani:affiliate-client:v1', clientCapability, secret);
		const capability = newCapability();
		const capabilityHash = hashValue('aevani:affiliate-attribution:v1', capability, secret);
		const issuedAt = new Date();
		const expiresAt = new Date(issuedAt.getTime() + ATTRIBUTION_LIFETIME_SECONDS * 1000);
		const dedupeCutoff = new Date(issuedAt.getTime() - CLICK_DEDUPE_WINDOW_MS);
		const attributionId = newAttributionId();

		try {
			const persisted = await db.transaction(async (tx) => {
				const [activeLink] = await tx
					.select({
						id: table.affiliateLink.id,
						affiliateId: table.affiliateLink.affiliateId
					})
					.from(table.affiliateLink)
					.innerJoin(table.affiliate, eq(table.affiliateLink.affiliateId, table.affiliate.id))
					.where(
						and(
							eq(table.affiliateLink.id, link.id),
							eq(table.affiliateLink.isActive, true),
							eq(table.affiliate.isActive, true),
							eq(table.affiliate.status, 'active')
						)
					)
					.limit(1)
					.for('update');
				if (!activeLink) {
					return false;
				}

				const [attribution] = await tx
					.insert(table.affiliateAttribution)
					.values({
						id: attributionId,
						capabilityHash,
						affiliateLinkId: activeLink.id,
						clientHash,
						userId,
						issuedAt,
						expiresAt
					})
					.returning({ id: table.affiliateAttribution.id });

				const [dedupeRecord] = await tx
					.insert(table.affiliateClickDedupe)
					.values({
						affiliateLinkId: activeLink.id,
						clientHash,
						lastClickedAt: issuedAt
					})
					.onConflictDoUpdate({
						target: [table.affiliateClickDedupe.affiliateLinkId, table.affiliateClickDedupe.clientHash],
						set: { lastClickedAt: issuedAt },
						where: lt(table.affiliateClickDedupe.lastClickedAt, dedupeCutoff)
					})
					.returning({ id: table.affiliateClickDedupe.id });

				if (!attribution || !dedupeRecord) {
					return true;
				}

				await tx.insert(table.affiliateAttributionClick).values({
					affiliateAttributionId: attribution.id,
					affiliateLinkId: activeLink.id,
					clientHash,
					userId,
					clickedAt: issuedAt
				});
				await tx
					.update(table.affiliateLink)
					.set({
						clicks: sql`${table.affiliateLink.clicks} + 1`,
						updatedAt: issuedAt
					})
					.where(eq(table.affiliateLink.id, activeLink.id));
				await tx
					.update(table.affiliate)
					.set({
						totalClicks: sql`${table.affiliate.totalClicks} + 1`,
						updatedAt: issuedAt
					})
					.where(eq(table.affiliate.id, activeLink.affiliateId));
				return true;
			});
			if (!persisted) {
				return null;
			}

			cookies.set(
				affiliateAttributionCookieName,
				serializeCookie('affiliate-attribution', capability, expiresAt, secret),
				cookieOptions(ATTRIBUTION_LIFETIME_SECONDS)
			);
		} catch (error) {
			// A failed telemetry write must not break the storefront redirect or revive the raw cookie path.
			console.error('Unable to record affiliate attribution:', error);
		}

		return link;
	}

	/** Verify an unconsumed browser capability for the user (or anonymous browser) that received it. */
	static async resolveForCart(
		cookies: Cookies,
		userId?: string
	): Promise<ResolvedAffiliateAttribution | null> {
		if (!isAffiliateAttributionEnabled()) {
			return null;
		}

		const secret = configuredSecret();
		if (!secret) {
			return null;
		}

		const signed = readSignedCookie(cookies, affiliateAttributionCookieName, 'affiliate-attribution', secret);
		if (!signed) {
			clearCookie(cookies, affiliateAttributionCookieName);
			return null;
		}

		const capabilityHash = hashValue('aevani:affiliate-attribution:v1', signed.capability, secret);
		const attributionOwnerCondition = userId
			? or(isNull(table.affiliateAttribution.userId), eq(table.affiliateAttribution.userId, userId))
			: isNull(table.affiliateAttribution.userId);
		const [attribution] = await db
			.select({
				id: table.affiliateAttribution.id,
				affiliateLinkId: table.affiliateAttribution.affiliateLinkId
			})
			.from(table.affiliateAttribution)
			.innerJoin(
				table.affiliateLink,
				eq(table.affiliateAttribution.affiliateLinkId, table.affiliateLink.id)
			)
			.innerJoin(table.affiliate, eq(table.affiliateLink.affiliateId, table.affiliate.id))
			.where(
				and(
					eq(table.affiliateAttribution.capabilityHash, capabilityHash),
					gt(table.affiliateAttribution.expiresAt, new Date()),
					isNull(table.affiliateAttribution.consumedAt),
					attributionOwnerCondition,
					eq(table.affiliateLink.isActive, true),
					eq(table.affiliate.isActive, true),
					eq(table.affiliate.status, 'active')
				)
			)
			.limit(1);

		if (!attribution) {
			clearCookie(cookies, affiliateAttributionCookieName);
			return null;
		}

		return attribution;
	}

	/** Mark a capability consumed after a successful cart mutation; callers must treat a failure as telemetry-only. */
	static async markConsumed(attributionId: string): Promise<void> {
		if (!isAffiliateAttributionEnabled()) {
			return;
		}

		await db
			.update(table.affiliateAttribution)
			.set({ consumedAt: new Date() })
			.where(and(eq(table.affiliateAttribution.id, attributionId), isNull(table.affiliateAttribution.consumedAt)));
	}
}
