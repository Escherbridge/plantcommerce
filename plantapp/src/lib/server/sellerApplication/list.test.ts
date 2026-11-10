import { beforeEach, describe, expect, it, vi } from 'vitest';

const { select, from, where, orderBy, limit } = vi.hoisted(() => {
	const limit = vi.fn();
	const orderBy = vi.fn();
	const where = vi.fn();
	const from = vi.fn();
	const select = vi.fn();
	return { select, from, where, orderBy, limit };
});

vi.mock('$lib/server/db', () => ({
	db: { select }
}));

vi.mock('$lib/server/services/email', () => ({
	EmailService: {
		isConfigured: () => false,
		sendSellerApplicationNotice: vi.fn()
	}
}));

import { SELLER_APPLICATION_LIST_LIMIT, SellerApplicationService } from './service';

function contains(value: unknown, needle: string | Date, seen = new Set<unknown>()): boolean {
	if (needle instanceof Date) {
		if (value instanceof Date) return value.getTime() === needle.getTime();
	} else if (typeof value === 'string') {
		return value.includes(needle);
	}
	if (!value || typeof value !== 'object') return false;
	if (seen.has(value)) return false;
	seen.add(value);
	return Object.values(value).some((child) => contains(child, needle, seen));
}

describe('SellerApplicationService.list', () => {
	beforeEach(() => {
		limit.mockReset();
		orderBy.mockReset();
		where.mockReset();
		from.mockReset();
		select.mockReset();
		limit.mockResolvedValue([]);
		orderBy.mockReturnValue({ limit });
		where.mockReturnValue({ orderBy });
		from.mockReturnValue({ where, orderBy });
		select.mockReturnValue({ from });
	});

	it('returns every column, newest first, capped at 500', async () => {
		await SellerApplicationService.list();

		expect(select).toHaveBeenCalledTimes(1);
		expect(where).not.toHaveBeenCalled();
		expect(orderBy).toHaveBeenCalledTimes(1);
		expect(contains(orderBy.mock.calls[0][0], 'desc')).toBe(true);
		expect(limit).toHaveBeenCalledWith(SELLER_APPLICATION_LIST_LIMIT);
		expect(SELLER_APPLICATION_LIST_LIMIT).toBe(500);
	});

	it('keeps only rows created after since', async () => {
		const since = new Date('2026-11-01T00:00:00.000Z');
		await SellerApplicationService.list(since);

		expect(where).toHaveBeenCalledTimes(1);
		expect(contains(where.mock.calls[0][0], '>')).toBe(true);
		expect(contains(where.mock.calls[0][0], '>=')).toBe(false);
		expect(contains(where.mock.calls[0][0], since)).toBe(true);
		expect(limit).toHaveBeenCalledWith(500);
	});
});
