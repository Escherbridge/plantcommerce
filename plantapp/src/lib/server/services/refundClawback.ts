const SELLER_FAULT_REASONS = new Set(['product_not_received', 'product_unacceptable']);

export function proportionalShare(
	amountMinor: number,
	refundedMinor: number,
	baseMinor: number
): number {
	if (amountMinor <= 0 || refundedMinor <= 0 || baseMinor <= 0) return 0;
	const refunded = BigInt(Math.min(refundedMinor, baseMinor));
	const base = BigInt(baseMinor);
	return Number((BigInt(amountMinor) * refunded + base / 2n) / base);
}

/**
 * How much more to claw back from a base amount (a seller net or an affiliate quote).
 * `alreadyForSourceMinor` is what this refund (cumulative) or this dispute already took; `alreadyAllMinor` is
 * everything taken from the base for any reason. The result never exceeds what is left of the base, and a
 * replayed or out-of-order event yields zero.
 */
export function clawbackDelta(input: {
	baseMinor: number;
	refundedMinor: number;
	totalMinor: number;
	alreadyForSourceMinor: number;
	alreadyAllMinor: number;
}): number {
	const target = proportionalShare(input.baseMinor, input.refundedMinor, input.totalMinor);
	const wanted = target - Math.max(input.alreadyForSourceMinor, 0);
	const room = input.baseMinor - Math.max(input.alreadyAllMinor, 0);
	return Math.max(Math.min(wanted, room), 0);
}

export function disputeSellerPaysFee(reason: string | null | undefined): boolean {
	return typeof reason === 'string' && SELLER_FAULT_REASONS.has(reason);
}

export function disputeAction(status: string): 'open' | 'close' | 'reverse' {
	if (status === 'lost') return 'reverse';
	// charge_refunded: the refund arrives as its own charge.refunded event and is counted there, once.
	if (status === 'won' || status === 'warning_closed' || status === 'charge_refunded')
		return 'close';
	return 'open';
}

export type MoneyEventFacts = {
	kind: 'refund' | 'dispute';
	action: 'open' | 'close' | 'reverse' | 'ignore';
	chargeId: string | null;
	objectId: string;
	/** True when amountMinor is the running total for the charge (charge.refunded), not a per-object amount. */
	cumulative: boolean;
	amountMinor: number;
	reasonCode: 'refund' | 'chargeback';
	feeMinor: number;
	sellerPaysFee: boolean;
};

function record(value: unknown): Record<string, unknown> | null {
	return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function chargeIdOf(value: unknown): string | null {
	if (typeof value === 'string' && value.startsWith('ch_')) return value;
	const charge = record(value);
	return typeof charge?.id === 'string' && charge.id.startsWith('ch_') ? charge.id : null;
}

/** Read a refund or dispute payload. Missing amounts stay at zero. No personal data is kept. */
export function moneyEventFacts(type: string, object: unknown): MoneyEventFacts | null {
	const body = record(object);
	if (!body || typeof body.id !== 'string') return null;
	if (type === 'charge.refunded') {
		const chargeId = typeof body.id === 'string' && body.id.startsWith('ch_') ? body.id : null;
		return {
			kind: 'refund',
			action: 'reverse',
			chargeId,
			objectId: chargeId ?? body.id,
			cumulative: true,
			amountMinor: typeof body.amount_refunded === 'number' ? body.amount_refunded : 0,
			reasonCode: 'refund',
			feeMinor: 0,
			sellerPaysFee: false
		};
	}
	// refund.* events are not read: charge.refunded carries the running total and is the single source.
	if (type.startsWith('charge.dispute.')) {
		const status = typeof body.status === 'string' ? body.status : '';
		const reason = typeof body.reason === 'string' ? body.reason : null;
		const transactions = Array.isArray(body.balance_transactions) ? body.balance_transactions : [];
		const feeMinor = transactions.reduce((sum, entry) => {
			const fee = record(entry)?.fee;
			return sum + (typeof fee === 'number' ? fee : 0);
		}, 0);
		return {
			kind: 'dispute',
			action: type === 'charge.dispute.funds_reinstated' ? 'close' : disputeAction(status),
			chargeId: chargeIdOf(body.charge),
			objectId: body.id,
			cumulative: false,
			amountMinor: typeof body.amount === 'number' ? body.amount : 0,
			reasonCode: 'chargeback',
			feeMinor: disputeSellerPaysFee(reason) ? feeMinor : 0,
			sellerPaysFee: disputeSellerPaysFee(reason)
		};
	}
	return null;
}
