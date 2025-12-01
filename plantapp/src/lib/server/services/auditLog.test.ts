import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditLogService } from './auditLog';
import { db } from '$lib/server/db';

// Mock dependencies
vi.mock('$lib/server/db', () => ({
    db: {
        insert: vi.fn(),
    }
}));

describe('AuditLogService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('log', () => {
        it('should log action to database', async () => {
            // Mock insert
            const valuesMock = vi.fn();
            (db.insert as any).mockReturnValue({ values: valuesMock });

            await AuditLogService.log('user123', 'TEST_ACTION', { foo: 'bar' });

            expect(db.insert).toHaveBeenCalled();
            expect(valuesMock).toHaveBeenCalledWith({
                userId: 'user123',
                action: 'TEST_ACTION',
                details: JSON.stringify({ foo: 'bar' })
            });
        });

        it('should log action without details', async () => {
            // Mock insert
            const valuesMock = vi.fn();
            (db.insert as any).mockReturnValue({ values: valuesMock });

            await AuditLogService.log('user123', 'TEST_ACTION');

            expect(db.insert).toHaveBeenCalled();
            expect(valuesMock).toHaveBeenCalledWith({
                userId: 'user123',
                action: 'TEST_ACTION',
                details: null
            });
        });
    });
});
