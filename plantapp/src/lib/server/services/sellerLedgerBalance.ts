import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

/**
 * The one reader of `seller_earning_event`. Every balance (payout planning, refund clawbacks, the console,
 * reconciliation) is derived here from signed sums over explicit event types; nothing re-derives its own.
 * Vocabulary and invariants: see plantapp/src/lib/server/AGENTS.md, "Seller ledger vocabulary".
 */
export type LedgerEvent = {
	eventType: string;
	amountDeltaMinor: number;
	reasonCode?: string | null;
	eventReference?: string;
	/** For a credit: the event_reference of the row it undoes. */
	creditsReference?: string | null;
};

export type EarningBalance = {
	/** Sum of `pending` rows: the earning as accrued. */
	netMinor: number;
	/** Reductions made before the seller was paid, net of credits. Shrinks what a transfer may send. */
	preTransferReversalMinor: number;
	/** Money pulled back from the seller at Stripe (reversal of reserved debt), net of credits. */
	stripeRecoveredMinor: number;
	/** Gross reversed at Stripe, ignoring credits: what the transfer can no longer give back. */
	stripeReversedGrossMinor: number;
	/** Everything taken from the seller for refunds and chargebacks: pre-transfer + debt + reservations, net of credits. */
	clawedBackMinor: number;
	/** Dispute fees owed by the seller, net of credits. */
	feeDebtMinor: number;
	/** Sent beyond what was owed after a refund landed in flight. */
	overpayMinor: number;
	/** Refund debt waiting on a Stripe reversal. Never nettable while active. */
	reservedDebtMinor: number;
	/** Debt a payout run may net from the seller's next transfer. */
	nettableDebtMinor: number;
	/** Nettable debt already spent against transfers (positive number). */
	debtSettledMinor: number;
	reservations: { reference: string; sourceKey: string; amountMinor: number; active: boolean }[];
};

const RESERVED = ':debt-reserved:';
const CLAWBACK_REASONS = new Set(['refund', 'chargeback']);

function isCredit(eventType: string): boolean {
	return (
		eventType === 'reversal_credited' ||
		eventType === 'debt_credited' ||
		eventType === 'fee_credited'
	);
}

/** Signed credit total per original row. A reversed -x plus a credit +x is 0; a debt +x plus a credit -x is 0. */
function creditsByTarget(events: LedgerEvent[]): Map<string, number> {
	const credits = new Map<string, number>();
	for (const event of events) {
		if (!isCredit(event.eventType) || !event.creditsReference) continue;
		credits.set(
			event.creditsReference,
			(credits.get(event.creditsReference) ?? 0) + event.amountDeltaMinor
		);
	}
	return credits;
}

export function earningBalance(events: LedgerEvent[]): EarningBalance {
	const credits = creditsByTarget(events);
	const references = new Set(events.map((event) => event.eventReference).filter(Boolean));
	const balance: EarningBalance = {
		netMinor: 0,
		preTransferReversalMinor: 0,
		stripeRecoveredMinor: 0,
		stripeReversedGrossMinor: 0,
		clawedBackMinor: 0,
		feeDebtMinor: 0,
		overpayMinor: 0,
		reservedDebtMinor: 0,
		nettableDebtMinor: 0,
		debtSettledMinor: 0,
		reservations: []
	};
	for (const event of events) {
		const reference = event.eventReference ?? '';
		const residual = event.amountDeltaMinor + (credits.get(reference) ?? 0);
		const reason = event.reasonCode ?? null;
		if (event.eventType === 'pending') balance.netMinor += event.amountDeltaMinor;
		else if (event.eventType === 'reversed') {
			if (reason === 'reversal_of_debt') {
				balance.stripeRecoveredMinor += -residual;
				balance.stripeReversedGrossMinor += -event.amountDeltaMinor;
			} else balance.preTransferReversalMinor += -residual;
		} else if (event.eventType === 'debt') {
			if (reference.includes(RESERVED)) {
				const sourceKey = reference.split(RESERVED)[1];
				const prefix = reference.split(RESERVED)[0];
				const settled = references.has(`${prefix}:reversed-at-stripe:${sourceKey}`);
				const released = references.has(`${prefix}:debt-released:${sourceKey}`);
				const credited = credits.has(reference);
				const active = !settled && !released && !credited;
				balance.reservations.push({
					reference,
					sourceKey,
					amountMinor: event.amountDeltaMinor,
					active
				});
				balance.clawedBackMinor += residual;
				if (active) balance.reservedDebtMinor += event.amountDeltaMinor;
			} else if (reason !== null && CLAWBACK_REASONS.has(reason)) {
				balance.clawedBackMinor += residual;
				balance.nettableDebtMinor += residual;
			} else if (reason === 'dispute_fee') {
				balance.feeDebtMinor += residual;
				balance.nettableDebtMinor += residual;
			} else if (reason === 'overpay') {
				balance.overpayMinor += residual;
				balance.nettableDebtMinor += residual;
			} else if (reason === 'debt_released') {
				balance.nettableDebtMinor += residual;
			} else if (reason === 'debt_restored') {
				balance.nettableDebtMinor += event.amountDeltaMinor;
			} else if (reason === 'debt_settled') {
				balance.debtSettledMinor += -event.amountDeltaMinor;
				balance.nettableDebtMinor += event.amountDeltaMinor;
			}
		}
	}
	balance.clawedBackMinor += balance.preTransferReversalMinor;
	return balance;
}

/** Each clawback row (pre-transfer reversal or refund/chargeback debt) with what is left of it after credits. */
export function clawbackRows(
	events: LedgerEvent[]
): { reference: string; reasonCode: string; takenMinor: number }[] {
	const credits = creditsByTarget(events);
	const rows: { reference: string; reasonCode: string; takenMinor: number }[] = [];
	for (const event of events) {
		const reference = event.eventReference ?? '';
		const reason = event.reasonCode ?? '';
		if (!CLAWBACK_REASONS.has(reason)) continue;
		const residual = event.amountDeltaMinor + (credits.get(reference) ?? 0);
		if (event.eventType === 'reversed') {
			rows.push({ reference, reasonCode: reason, takenMinor: -residual });
		} else if (event.eventType === 'debt') {
			rows.push({ reference, reasonCode: reason, takenMinor: residual });
		}
	}
	return rows;
}

const EVENT_COLUMNS = {
	earningId: table.sellerEarningEvent.earningId,
	eventType: table.sellerEarningEvent.eventType,
	amountDeltaMinor: table.sellerEarningEvent.amountDeltaMinor,
	reasonCode: table.sellerEarningEvent.reasonCode,
	eventReference: table.sellerEarningEvent.eventReference,
	creditsReference: table.sellerEarningEvent.creditsReference,
	stripeReversalId: table.sellerEarningEvent.stripeReversalId
};

export type StoredLedgerEvent = LedgerEvent & {
	earningId: string;
	stripeReversalId: string | null;
};

export async function loadEarningEvents(
	executor: any,
	earningId: string
): Promise<StoredLedgerEvent[]> {
	return executor
		.select(EVENT_COLUMNS)
		.from(table.sellerEarningEvent)
		.where(eq(table.sellerEarningEvent.earningId, earningId));
}

/** Debt a payout run may net for one seller in one currency, across all of the seller's earnings. */
export async function sellerNettableDebtMinor(
	executor: any,
	sellerId: number,
	currency: string
): Promise<number> {
	const rows: StoredLedgerEvent[] = await executor
		.select(EVENT_COLUMNS)
		.from(table.sellerEarningEvent)
		.innerJoin(table.sellerEarning, eq(table.sellerEarningEvent.earningId, table.sellerEarning.id))
		.where(
			and(
				eq(table.sellerEarning.sellerId, sellerId),
				eq(table.sellerEarningEvent.currency, currency)
			)
		);
	const byEarning = new Map<string, StoredLedgerEvent[]>();
	for (const row of rows) {
		const list = byEarning.get(row.earningId) ?? [];
		list.push(row);
		byEarning.set(row.earningId, list);
	}
	let total = 0;
	for (const events of byEarning.values()) total += earningBalance(events).nettableDebtMinor;
	return total;
}
