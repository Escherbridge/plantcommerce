import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AffiliateService } from './affiliate';
import { db } from '$lib/server/db';

// Mock dependencies
vi.mock('$lib/server/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    }
}));

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

            // Mock code uniqueness check
            // We need to mock multiple select calls:
            // 1. Check existing affiliate by userId
            // 2. Check existing affiliate by code
            (db.select as any)
                .mockReturnValueOnce({ from: fromMock }) // Check by userId
                .mockReturnValueOnce({ from: fromMock }); // Check by code

            // Mock insert
            const returningMock = vi.fn().mockResolvedValue([{
                id: 1,
                userId: 'user123',
                affiliateCode: 'CODE123',
                commissionRate: '0.05',
                isActive: true
            }]);
            const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
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

    describe('trackClick', () => {
        it('should track click and update stats', async () => {
            // Mock link lookup
            const limitMock = vi.fn().mockResolvedValue([{
                link: { id: 1, clicks: 10, affiliateId: 1 },
                affiliate: { id: 1, totalClicks: 100 }
            }]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const joinMock = vi.fn().mockReturnValue({ where: whereMock });
            const fromMock = vi.fn().mockReturnValue({ innerJoin: joinMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            // Mock updates
            const setMock = vi.fn().mockReturnValue({ where: vi.fn() });
            (db.update as any).mockReturnValue({ set: setMock });

            // Mock insert click
            (db.insert as any).mockReturnValue({ values: vi.fn() });

            const result = await AffiliateService.trackClick('LINK123', { ipAddress: '127.0.0.1' });

            expect(result).toBe(true);
            expect(db.insert).toHaveBeenCalled(); // Click record
            expect(db.update).toHaveBeenCalledTimes(2); // Link and Affiliate stats
        });
    });
});
