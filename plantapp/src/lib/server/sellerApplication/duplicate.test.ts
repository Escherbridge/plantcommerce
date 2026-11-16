import { beforeEach, describe, expect, it, vi } from 'vitest';

const { select, from, where, limit } = vi.hoisted(() => {
	const limit = vi.fn();
	const where = vi.fn();
	const from = vi.fn();
	const select = vi.fn();
	return { select, from, where, limit };
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

import { SellerApplicationService } from './service';

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

describe('SellerApplicationService.hasRecentDuplicate', () => {
	beforeEach(() => {
		limit.mockReset();
		where.mockReset();
		from.mockReset();
		select.mockReset();
		limit.mockResolvedValue([]);
		where.mockReturnValue({ limit });
		from.mockReturnValue({ where });
		select.mockReturnValue({ from });
	});

	it('queries the existing table for the same email and business name at or after since', async () => {
		const since = new Date('2026-11-16T05:00:00.000Z');
		await expect(
			SellerApplicationService.hasRecentDuplicate('ada@example.com', 'North Bed Farm', since)
		).resolves.toBe(false);

		expect(select).toHaveBeenCalledTimes(1);
		expect(from).toHaveBeenCalledTimes(1);
		expect(contains(from.mock.calls[0][0], 'seller_application')).toBe(true);
		expect(where).toHaveBeenCalledTimes(1);
		const clause = where.mock.calls[0][0];
		expect(contains(clause, 'ada@example.com')).toBe(true);
		expect(contains(clause, 'North Bed Farm')).toBe(true);
		expect(contains(clause, since)).toBe(true);
		expect(contains(clause, '>=')).toBe(true);
		expect(limit).toHaveBeenCalledWith(1);
	});

	it('treats one matching row as a duplicate', async () => {
		limit.mockResolvedValue([{ id: 9 }]);
		await expect(
			SellerApplicationService.hasRecentDuplicate(
				'ada@example.com',
				'North Bed Farm',
				new Date('2026-11-16T05:00:00.000Z')
			)
		).resolves.toBe(true);
	});
});
