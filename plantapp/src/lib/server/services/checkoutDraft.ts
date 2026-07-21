import { createHash } from 'node:crypto';
import { encodeBase64url } from '@oslojs/encoding';
import { and, asc, desc, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { AffiliateCommissionService } from './affiliateCommission';

const CHECKOUT_CURRENCY = 'usd';
const TAX_RATE_BASIS_POINTS = 800n;
const BASIS_POINTS_DENOMINATOR = 10_000n;
const SHIPPING_MINOR = 500;
const DEFAULT_DRAFT_LIFETIME_MS = 60 * 60 * 1000;
const MAX_DRAFT_LIFETIME_MS = 23 * 60 * 60 * 1000;
const MAX_SAFE_MINOR = BigInt(Number.MAX_SAFE_INTEGER);
const OPEN_DRAFT_STATUSES = ['pending_session', 'checkout_created', 'quarantined', 'paid'] as const;

export type CheckoutBuyer =
	| { kind: 'user'; userId: string }
	| { kind: 'guest'; guestCartSessionId: string };

export interface CheckoutTotals {
	subtotalMinor: number;
	taxMinor: number;
	shippingMinor: number;
	discountMinor: number;
	totalMinor: number;
}

export interface CheckoutDraftSnapshot {
	id: string;
	reference: string;
	status: 'pending_session' | 'checkout_created' | 'quarantined' | 'paid' | 'fulfilled' | 'expired' | 'failed';
	currency: string;
	expiresAt: Date;
	totals: CheckoutTotals;
	affiliateCommissionMinor: number;
}

export interface CreateCheckoutDraftInput {
	buyer: CheckoutBuyer;
	now?: Date;
	expiresAt?: Date;
}

type DraftItemSnapshot = {
	productId: number;
	productName: string;
	productSku: string;
	quantity: number;
	unitPriceMinor: number;
	totalPriceMinor: number;
	trackInventory: boolean;
};

type AffiliateDraftPolicySnapshot = {
	affiliateId: number;
	affiliateCommissionRateBps: number;
	affiliateTierCode: string;
	affiliateTierVersion: number;
	affiliateTermsVersion: string;
	affiliateDisclosureVersion: string;
	affiliateTermsAcceptanceId: string | null;
};

const LEGACY_AFFILIATE_TIER_CODE = 'legacy-rate';
const LEGACY_AFFILIATE_TIER_VERSION = 0;
const UNRECORDED_AFFILIATE_TERMS_VERSION = 'unrecorded';
const UNRECORDED_AFFILIATE_DISCLOSURE_VERSION = 'unrecorded';

function assertSafeMinor(value: bigint, field: string): number {
	if (value < 0n || value > MAX_SAFE_MINOR) {
		throw new Error(`${field} is outside the supported checkout amount range`);
	}

	return Number(value);
}

function decimalToScaledInteger(value: string, scale: number, field: string): bigint {
	const match = /^(\d+)(?:\.(\d+))?$/.exec(value);
	if (!match || (match[2]?.length ?? 0) > scale) {
		throw new Error(`${field} must be a non-negative decimal with at most ${scale} fractional digits`);
	}

	const whole = BigInt(match[1]);
	const fractional = (match[2] ?? '').padEnd(scale, '0');
	const divisor = 10n ** BigInt(scale);
	return whole * divisor + BigInt(fractional || '0');
}

/** Convert a database decimal to exact currency minor units without floating-point arithmetic. */
export function decimalToMinorUnits(value: string): number {
	return assertSafeMinor(decimalToScaledInteger(value, 2, 'Currency amount'), 'Currency amount');
}

/** Convert an exact minor-unit value to the decimal string expected by legacy order columns. */
export function minorUnitsToDecimal(value: number): string {
	if (!Number.isSafeInteger(value) || value < 0) {
		throw new Error('Minor-unit amount must be a non-negative safe integer');
	}

	const amount = BigInt(value);
	const whole = amount / 100n;
	const fractional = (amount % 100n).toString().padStart(2, '0');
	return `${whole}.${fractional}`;
}

function multiplyMinorUnits(unitPriceMinor: number, quantity: number): number {
	if (!Number.isSafeInteger(unitPriceMinor) || unitPriceMinor < 0 || !Number.isSafeInteger(quantity) || quantity <= 0) {
		throw new Error('Checkout line items require positive safe-integer quantities and prices');
	}

	return assertSafeMinor(BigInt(unitPriceMinor) * BigInt(quantity), 'Checkout line total');
}

function divideRoundedHalfUp(numerator: bigint, denominator: bigint): bigint {
	return (numerator + denominator / 2n) / denominator;
}

/** Calculate checkout totals using basis points and integer minor units only. */
export function calculateCheckoutTotals(subtotalMinor: number): CheckoutTotals {
	if (!Number.isSafeInteger(subtotalMinor) || subtotalMinor < 0) {
		throw new Error('Checkout subtotal must be a non-negative safe integer');
	}

	const subtotal = BigInt(subtotalMinor);
	const taxMinor = assertSafeMinor(
		divideRoundedHalfUp(subtotal * TAX_RATE_BASIS_POINTS, BASIS_POINTS_DENOMINATOR),
		'Checkout tax'
	);
	const totalMinor = assertSafeMinor(subtotal + BigInt(taxMinor) + BigInt(SHIPPING_MINOR), 'Checkout total');

	return {
		subtotalMinor,
		taxMinor,
		shippingMinor: SHIPPING_MINOR,
		discountMinor: 0,
		totalMinor
	};
}

/** Persist only a domain-separated digest of a high-entropy guest cart capability. */
export function hashGuestCheckoutSubject(guestCartSessionId: string): string {
	if (!guestCartSessionId) {
		throw new Error('Guest cart session is required');
	}

	return createHash('sha256')
		.update('aevani:checkout-guest-subject\0')
		.update(guestCartSessionId)
		.digest('hex');
}

function buyerCartCondition(buyer: CheckoutBuyer) {
	return buyer.kind === 'user'
		? eq(table.cart.userId, buyer.userId)
		: and(isNull(table.cart.userId), eq(table.cart.sessionId, buyer.guestCartSessionId));
}

function buyerDraftCondition(buyer: CheckoutBuyer) {
	return buyer.kind === 'user'
		? eq(table.checkoutDraft.userId, buyer.userId)
		: eq(table.checkoutDraft.guestSubjectHash, hashGuestCheckoutSubject(buyer.guestCartSessionId));
}

function draftBelongsToBuyer(draft: typeof table.checkoutDraft.$inferSelect, buyer: CheckoutBuyer): boolean {
	return buyer.kind === 'user'
		? draft.userId === buyer.userId && draft.guestSubjectHash === null
		: draft.userId === null && draft.guestSubjectHash === hashGuestCheckoutSubject(buyer.guestCartSessionId);
}

function newOpaqueId(prefix: string): string {
	return `${prefix}_${encodeBase64url(crypto.getRandomValues(new Uint8Array(24)))}`;
}

function snapshotHash(
	buyer: CheckoutBuyer,
	cartId: number,
	items: DraftItemSnapshot[],
	totals: CheckoutTotals,
	affiliateLinkId: number | null,
	affiliateCommissionMinor: number,
	affiliatePolicy: AffiliateDraftPolicySnapshot | null
): string {
	const buyerSnapshot = buyer.kind === 'user'
		? { userId: buyer.userId }
		: { guestSubjectHash: hashGuestCheckoutSubject(buyer.guestCartSessionId) };

	return createHash('sha256')
		.update(
			JSON.stringify({
				buyer: buyerSnapshot,
				cartId,
				currency: CHECKOUT_CURRENCY,
				items,
				totals,
				affiliateLinkId,
				affiliateCommissionMinor,
				affiliatePolicy: affiliatePolicy ?? {
					affiliateId: null,
					affiliateCommissionRateBps: null,
					affiliateTierCode: LEGACY_AFFILIATE_TIER_CODE,
					affiliateTierVersion: LEGACY_AFFILIATE_TIER_VERSION,
					affiliateTermsVersion: UNRECORDED_AFFILIATE_TERMS_VERSION,
					affiliateDisclosureVersion: UNRECORDED_AFFILIATE_DISCLOSURE_VERSION,
					affiliateTermsAcceptanceId: null
				}
			})
		)
		.digest('hex');
}

function commissionRateToBasisPoints(commissionRate: string): number {
	const rateBasisPoints = decimalToScaledInteger(commissionRate, 4, 'Affiliate commission rate');
	if (rateBasisPoints > BASIS_POINTS_DENOMINATOR) {
		throw new Error('Affiliate commission rate cannot exceed 100%');
	}
	return Number(rateBasisPoints);
}

function calculateAffiliateCommissionMinor(subtotalMinor: number, commissionRate: string): number {
	const rateBasisPoints = BigInt(commissionRateToBasisPoints(commissionRate));
	return assertSafeMinor(
		divideRoundedHalfUp(BigInt(subtotalMinor) * rateBasisPoints, BASIS_POINTS_DENOMINATOR),
		'Affiliate commission'
	);
}

function toSnapshot(draft: typeof table.checkoutDraft.$inferSelect): CheckoutDraftSnapshot {
	return {
		id: draft.id,
		reference: draft.reference,
		status: draft.status,
		currency: draft.currency,
		expiresAt: draft.expiresAt,
		totals: {
			subtotalMinor: draft.subtotalMinor,
			taxMinor: draft.taxMinor,
			shippingMinor: draft.shippingMinor,
			discountMinor: draft.discountMinor,
			totalMinor: draft.totalMinor
		},
		affiliateCommissionMinor: draft.affiliateCommissionMinor
	};
}

async function releaseDraftReservationsInTransaction(
	tx: any,
	draft: typeof table.checkoutDraft.$inferSelect,
	status: 'expired' | 'failed',
	now: Date,
	allowQuarantinedRelease = false
): Promise<boolean> {
	if (draft.status === 'fulfilled' || draft.status === 'paid' || draft.reservationReleasedAt) {
		return false;
	}
	if (draft.status === 'quarantined' && !allowQuarantinedRelease) {
		throw new Error('Quarantined checkout reservations require confirmed provider expiry before release');
	}

	const reservations = await tx
		.select()
		.from(table.checkoutInventoryReservation)
		.where(
			and(
				eq(table.checkoutInventoryReservation.draftId, draft.id),
				eq(table.checkoutInventoryReservation.status, 'active')
			)
		)
		.for('update');

	if (reservations.length > 0) {
		const productIds = reservations.map((reservation: typeof table.checkoutInventoryReservation.$inferSelect) => reservation.productId)
			.sort((left: number, right: number) => left - right);
		const products = await tx
			.select()
			.from(table.product)
			.where(inArray(table.product.id, productIds))
			.orderBy(asc(table.product.id))
			.for('update');

		for (const reservation of reservations) {
			const product = products.find((candidate: typeof table.product.$inferSelect) => candidate.id === reservation.productId);
			if (!product || product.reservedQuantity < reservation.quantity) {
				throw new Error('Inventory reservation cannot be released safely');
			}

			await tx
				.update(table.product)
				.set({ reservedQuantity: product.reservedQuantity - reservation.quantity, updatedAt: now })
				.where(eq(table.product.id, product.id));
			await tx
				.update(table.checkoutInventoryReservation)
				.set({ status: 'released', releasedAt: now, updatedAt: now })
				.where(eq(table.checkoutInventoryReservation.id, reservation.id));
		}
	}

	await tx
		.update(table.checkoutDraft)
		.set({ status, reservationReleasedAt: now, updatedAt: now })
		.where(eq(table.checkoutDraft.id, draft.id));

	return true;
}

async function getActiveAffiliateAttribution(tx: any, affiliateLinkId: number | null) {
	if (!affiliateLinkId) {
		return null;
	}

	const [attribution] = await tx
		.select({
			linkId: table.affiliateLink.id,
			affiliateId: table.affiliate.id,
			commissionRate: table.affiliate.commissionRate
		})
		.from(table.affiliateLink)
		.innerJoin(table.affiliate, eq(table.affiliateLink.affiliateId, table.affiliate.id))
		.where(
			and(
				eq(table.affiliateLink.id, affiliateLinkId),
				eq(table.affiliateLink.isActive, true),
				eq(table.affiliate.isActive, true),
				eq(table.affiliate.status, 'active')
			)
		)
		.limit(1);

	return attribution ?? null;
}

async function getAffiliateDraftPolicySnapshot(
	tx: any,
	attribution: { affiliateId: number; commissionRate: string }
): Promise<AffiliateDraftPolicySnapshot> {
	const [acceptance] = await tx
		.select({
			id: table.affiliateTermsAcceptance.id,
			termsVersion: table.affiliateTermsAcceptance.termsVersion,
			disclosureVersion: table.affiliateTermsAcceptance.disclosureVersion
		})
		.from(table.affiliateTermsAcceptance)
		.where(eq(table.affiliateTermsAcceptance.affiliateId, attribution.affiliateId))
		.orderBy(desc(table.affiliateTermsAcceptance.acceptedAt), desc(table.affiliateTermsAcceptance.createdAt))
		.limit(1);

	return {
		affiliateId: attribution.affiliateId,
		affiliateCommissionRateBps: commissionRateToBasisPoints(attribution.commissionRate),
		affiliateTierCode: LEGACY_AFFILIATE_TIER_CODE,
		affiliateTierVersion: LEGACY_AFFILIATE_TIER_VERSION,
		affiliateTermsVersion: acceptance?.termsVersion ?? UNRECORDED_AFFILIATE_TERMS_VERSION,
		affiliateDisclosureVersion: acceptance?.disclosureVersion ?? UNRECORDED_AFFILIATE_DISCLOSURE_VERSION,
		affiliateTermsAcceptanceId: acceptance?.id ?? null
	};
}

export class CheckoutDraftService {
	/** Release a draft that the caller has already locked in its surrounding transaction. */
	static async releaseLockedDraftReservations(
		tx: any,
		draft: typeof table.checkoutDraft.$inferSelect,
		status: 'expired' | 'failed',
		now = new Date(),
		allowQuarantinedRelease = false
	): Promise<boolean> {
		return await releaseDraftReservationsInTransaction(tx, draft, status, now, allowQuarantinedRelease);
	}

	/** Freeze server-priced cart contents and reserve tracked inventory before payment begins. */
	static async createFromCart(input: CreateCheckoutDraftInput): Promise<CheckoutDraftSnapshot> {
		const now = input.now ?? new Date();
		const expiresAt = input.expiresAt ?? new Date(now.getTime() + DEFAULT_DRAFT_LIFETIME_MS);
		if (expiresAt.getTime() <= now.getTime()) {
			throw new Error('Checkout draft expiry must be in the future');
		}
		if (expiresAt.getTime() > now.getTime() + MAX_DRAFT_LIFETIME_MS) {
			throw new Error('Checkout draft expiry exceeds the supported payment-session lifetime');
		}

		return await db.transaction(async (tx) => {
			const [candidateCart] = await tx
				.select()
				.from(table.cart)
				.where(buyerCartCondition(input.buyer))
				.limit(1);

			if (!candidateCart) {
				throw new Error('Cart not found');
			}

			// Cart mutations lock item rows before updating the cart row. Mirror that order to avoid deadlocks.
			await tx
				.select({ id: table.cartItem.id })
				.from(table.cartItem)
				.where(eq(table.cartItem.cartId, candidateCart.id))
				.for('update');

			const [cart] = await tx
				.select()
				.from(table.cart)
				.where(and(eq(table.cart.id, candidateCart.id), buyerCartCondition(input.buyer)))
				.limit(1)
				.for('update');

			if (!cart) {
				throw new Error('Cart not found');
			}

			const [openDraft] = await tx
				.select()
				.from(table.checkoutDraft)
				.where(
					and(
						eq(table.checkoutDraft.sourceCartId, cart.id),
						inArray(table.checkoutDraft.status, [...OPEN_DRAFT_STATUSES])
					)
				)
				.orderBy(desc(table.checkoutDraft.createdAt))
				.limit(1)
				.for('update');

			if (openDraft) {
				if (!draftBelongsToBuyer(openDraft, input.buyer)) {
					throw new Error('Cart has an active checkout draft owned by a different identity');
				}
				if (openDraft.status === 'quarantined') {
					return toSnapshot(openDraft);
				}
				if (openDraft.status !== 'paid' && openDraft.expiresAt.getTime() <= now.getTime()) {
					await releaseDraftReservationsInTransaction(tx, openDraft, 'expired', now);
				} else {
					return toSnapshot(openDraft);
				}
			}

			const cartItems = await tx
				.select({
					productId: table.cartItem.productId,
					quantity: table.cartItem.quantity
				})
				.from(table.cartItem)
				.where(eq(table.cartItem.cartId, cart.id))
				.for('update');

			if (cartItems.length === 0) {
				throw new Error('Cart is empty');
			}

			const quantitiesByProduct = new Map<number, number>();
			for (const item of cartItems) {
				if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
					throw new Error('Cart contains an invalid quantity');
				}

				quantitiesByProduct.set(item.productId, (quantitiesByProduct.get(item.productId) ?? 0) + item.quantity);
			}

			const productIds = [...quantitiesByProduct.keys()].sort((left, right) => left - right);
			const products = await tx
				.select()
				.from(table.product)
				.where(inArray(table.product.id, productIds))
				.orderBy(asc(table.product.id))
				.for('update');

			if (products.length !== productIds.length) {
				throw new Error('A cart product is no longer available');
			}

			const items: DraftItemSnapshot[] = products.map((product) => {
				if (!product.isActive) {
					throw new Error(`${product.name} is no longer available`);
				}

				const quantity = quantitiesByProduct.get(product.id);
				if (!quantity) {
					throw new Error('Cart quantity could not be resolved');
				}

				const availableInventory = product.stockQuantity - product.reservedQuantity;
				if (product.trackInventory && availableInventory < quantity) {
					throw new Error(`Insufficient stock for ${product.name}`);
				}

				const unitPriceMinor = decimalToMinorUnits(product.price);
				return {
					productId: product.id,
					productName: product.name,
					productSku: product.sku,
					quantity,
					unitPriceMinor,
					totalPriceMinor: multiplyMinorUnits(unitPriceMinor, quantity),
					trackInventory: product.trackInventory
				};
			});

			const subtotalMinor = assertSafeMinor(
				items.reduce((total, item) => total + BigInt(item.totalPriceMinor), 0n),
				'Checkout subtotal'
			);
			const totals = calculateCheckoutTotals(subtotalMinor);
			const attribution = await getActiveAffiliateAttribution(tx, cart.affiliateLinkId);
			const affiliateCommissionMinor = attribution
				? calculateAffiliateCommissionMinor(subtotalMinor, attribution.commissionRate)
				: 0;
			const affiliatePolicy = attribution && AffiliateCommissionService.isEnabled()
				? await getAffiliateDraftPolicySnapshot(tx, attribution)
				: null;
			const draftId = newOpaqueId('draft');
			const reference = newOpaqueId('cd');
			const hash = snapshotHash(
				input.buyer,
				cart.id,
				items,
				totals,
				attribution?.linkId ?? null,
				affiliateCommissionMinor,
				affiliatePolicy
			);

			await tx.insert(table.checkoutDraft).values({
				id: draftId,
				reference,
				userId: input.buyer.kind === 'user' ? input.buyer.userId : null,
				guestSubjectHash: input.buyer.kind === 'guest'
					? hashGuestCheckoutSubject(input.buyer.guestCartSessionId)
					: null,
				sourceCartId: cart.id,
				sourceCartUpdatedAt: cart.updatedAt,
				affiliateLinkId: attribution?.linkId ?? null,
				affiliateCommissionMinor,
				...(affiliatePolicy ?? {}),
				currency: CHECKOUT_CURRENCY,
				...totals,
				snapshotHash: hash,
				expiresAt,
				createdAt: now,
				updatedAt: now
			});

			await tx.insert(table.checkoutDraftItem).values(
				items.map((item) => ({
					draftId,
					...item,
					createdAt: now
				}))
			);

			const trackedReservations = items.filter((item) => item.trackInventory);
			for (const reservation of trackedReservations) {
				const product = products.find((candidate) => candidate.id === reservation.productId);
				if (!product) {
					throw new Error('Reserved product could not be resolved');
				}

				await tx
					.update(table.product)
					.set({
						reservedQuantity: product.reservedQuantity + reservation.quantity,
						updatedAt: now
					})
					.where(eq(table.product.id, product.id));
			}

			if (trackedReservations.length > 0) {
				await tx.insert(table.checkoutInventoryReservation).values(
					trackedReservations.map((reservation) => ({
						draftId,
						productId: reservation.productId,
						quantity: reservation.quantity,
						createdAt: now,
						updatedAt: now
					}))
				);
			}

			return {
				id: draftId,
				reference,
				status: 'pending_session',
				currency: CHECKOUT_CURRENCY,
				expiresAt,
				totals,
				affiliateCommissionMinor
			};
		});
	}

	/** Release each active reservation at most once; repeated calls are safe. */
	static async releaseReservations(draftId: string, status: 'expired' | 'failed' = 'expired'): Promise<boolean> {
		return await db.transaction(async (tx) => {
			const [draft] = await tx
				.select()
				.from(table.checkoutDraft)
				.where(eq(table.checkoutDraft.id, draftId))
				.for('update');

			if (!draft) {
				return false;
			}

			return await this.releaseLockedDraftReservations(tx, draft, status);
		});
	}

	static async getById(draftId: string) {
		const [draft] = await db
			.select()
			.from(table.checkoutDraft)
			.where(eq(table.checkoutDraft.id, draftId))
			.limit(1);
		return draft ?? null;
	}

	static async getByReference(reference: string) {
		const [draft] = await db
			.select()
			.from(table.checkoutDraft)
			.where(eq(table.checkoutDraft.reference, reference))
			.limit(1);
		return draft ?? null;
	}

	static async getWithItems(draftId: string) {
		const [draft] = await db
			.select()
			.from(table.checkoutDraft)
			.where(eq(table.checkoutDraft.id, draftId))
			.limit(1);
		if (!draft) {
			return null;
		}

		const [items, reservations] = await Promise.all([
			db
				.select()
				.from(table.checkoutDraftItem)
				.where(eq(table.checkoutDraftItem.draftId, draftId))
				.orderBy(asc(table.checkoutDraftItem.productId)),
			db
				.select()
				.from(table.checkoutInventoryReservation)
				.where(eq(table.checkoutInventoryReservation.draftId, draftId))
				.orderBy(asc(table.checkoutInventoryReservation.productId))
		]);

		return { draft, items, reservations };
	}

	static async findOpenDraftForBuyer(buyer: CheckoutBuyer) {
		const drafts = await db
			.select()
			.from(table.checkoutDraft)
			.where(
				and(
					buyerDraftCondition(buyer),
					inArray(table.checkoutDraft.status, ['pending_session', 'checkout_created', 'quarantined', 'paid'])
				)
			)
			.orderBy(desc(table.checkoutDraft.createdAt))
			.limit(1);
		return drafts[0] ?? null;
	}
}

export default CheckoutDraftService;
