import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn()
	}
}));

import { OrderService, type OrderDetails } from './order';

describe('OrderService authorization boundary', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('does not expose legacy order mutations that bypass payment reconciliation', () => {
		expect('createOrder' in OrderService).toBe(false);
		expect('cancelOrder' in OrderService).toBe(false);
	});

	it('returns no order when a non-owner looks up an order number', async () => {
		vi.spyOn(OrderService, 'getOrderByNumber').mockResolvedValue({
			id: 42,
			userId: 'owner-user'
		} as OrderDetails);

		await expect(OrderService.getOrderByNumberForUser('ORD-42', 'other-user')).resolves.toBeNull();
	});

	it('allows the order owner or an administrator to resolve an order number', async () => {
		const order = { id: 42, userId: 'owner-user' } as OrderDetails;
		vi.spyOn(OrderService, 'getOrderByNumber').mockResolvedValue(order);

		await expect(OrderService.getOrderByNumberForUser('ORD-42', 'owner-user')).resolves.toBe(order);
		await expect(OrderService.getOrderByNumberForUser('ORD-42', 'admin-user', true)).resolves.toBe(
			order
		);
	});
});
