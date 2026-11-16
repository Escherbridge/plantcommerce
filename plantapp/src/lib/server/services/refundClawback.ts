const SELLER_FAULT_REASONS = new Set(['product_not_received', 'product_unacceptable']);

export function proportionalShare(amountMinor: number, refundedMinor: number, baseMinor: number): number {
	if (amountMinor <= 0 || refundedMinor <= 0 || baseMinor <= 0) return 0;
	const refunded = BigInt(Math.min(refundedMinor, baseMinor));
	const base = BigInt(baseMinor);
	return Number((BigInt(amountMinor) * refunded + base / 2n) / base);
}

export function disputeSellerPaysFee(reason: string | null | undefined): boolean {
	return typeof reason === 'string' && SELLER_FAULT_REASONS.has(reason);
}

export function disputeAction(status: string): 'open' | 'close' | 'reverse' {
	if (status === 'lost' || status === 'charge_refunded') return 'reverse';
	if (status === 'won' || status === 'warning_closed') return 'close';
	return 'open';
}

export type MoneyEventFacts = {
	kind: 'refund' | 'dispute';
	action: 'open' | 'close' | 'reverse' | 'ignore';
	chargeId: string | null;
	objectId: string;
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
			amountMinor: typeof body.amount_refunded === 'number' ? body.amount_refunded : 0,
			reasonCode: 'refund',
			feeMinor: 0,
			sellerPaysFee: false
		};
	}
	if (type.startsWith('refund.')) {
		const status = typeof body.status === 'string' ? body.status : '';
		return {
			kind: 'refund',
			action: status === 'failed' || status === 'canceled' ? 'close' : 'reverse',
			chargeId: chargeIdOf(body.charge),
			objectId: body.id,
			amountMinor: typeof body.amount === 'number' ? body.amount : 0,
			reasonCode: 'refund',
			feeMinor: 0,
			sellerPaysFee: false
		};
	}
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
			amountMinor: typeof body.amount === 'number' ? body.amount : 0,
			reasonCode: 'chargeback',
			feeMinor: disputeSellerPaysFee(reason) ? feeMinor : 0,
			sellerPaysFee: disputeSellerPaysFee(reason)
		};
	}
	return null;
}
