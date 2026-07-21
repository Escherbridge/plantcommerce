import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AffiliateService } from './affiliate';
import { db } from '$lib/server/db';

// Mock dependencies
vi.mock('$lib/server/db', () => {
    const db = {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        execute: vi.fn(),
        transaction: vi.fn(async (callback: (tx: object) => unknown) => await callback(db))
    };
    return { db };
});

describe('AffiliateService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createAffiliate', () => {
        it('should create a new affiliate if not exists', async () => {
            // Mock check for existing
            const limitMock = vi.fn().mockResolvedValue([]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            (db.select as any).mockReturnValueOnce({ from: fromMock });

            // Mock insert
            const returningMock = vi.fn().mockResolvedValue([{
                id: 1,
                userId: 'user123',
                affiliateCode: 'CODE123',
                commissionRate: '0.05',
                isActive: true
            }]);
            const onConflictDoNothingMock = vi.fn().mockReturnValue({ returning: returningMock });
            const valuesMock = vi.fn().mockReturnValue({ onConflictDoNothing: onConflictDoNothingMock });
            (db.insert as any).mockReturnValue({ values: valuesMock });

            const affiliate = await AffiliateService.createAffiliate('user123');

            expect(affiliate.id).toBe(1);
            expect(db.insert).toHaveBeenCalled();
        });

        it('should return existing affiliate if exists', async () => {
            const limitMock = vi.fn().mockResolvedValue([{ id: 1, userId: 'user123' }]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            const affiliate = await AffiliateService.createAffiliate('user123');

            expect(affiliate.id).toBe(1);
            expect(db.insert).not.toHaveBeenCalled();
        });
    });
});
