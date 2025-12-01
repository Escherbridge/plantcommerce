import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentService } from './content';
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

describe('ContentService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createPage', () => {
        it('should create a new page if slug is unique', async () => {
            // Mock slug check
            const limitMock = vi.fn().mockResolvedValue([]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            // Mock insert
            const returningMock = vi.fn().mockResolvedValue([{
                id: 1,
                title: 'Test Page',
                slug: 'test-page',
                content: 'Test content',
                authorId: 'user123',
                status: 'published'
            }]);
            const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
            (db.insert as any).mockReturnValue({ values: valuesMock });

            const page = await ContentService.createPage({
                title: 'Test Page',
                slug: 'test-page',
                content: 'Test content',
                type: 'page',
                status: 'published',
                authorId: 'user123'
            });

            expect(page.id).toBe(1);
            expect(db.insert).toHaveBeenCalled();
        });

        it('should throw error if slug exists', async () => {
            const limitMock = vi.fn().mockResolvedValue([{ slug: 'test-page' }]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            await expect(ContentService.createPage({
                title: 'Test Page',
                slug: 'test-page',
                type: 'page',
                status: 'draft',
                authorId: 'user123'
            })).rejects.toThrow('Slug already exists');
        });
    });

    describe('getPageBySlug', () => {
        it('should return page if found and published', async () => {
            const limitMock = vi.fn().mockResolvedValue([{
                page: { id: 1, title: 'Test Page' },
                author: { username: 'testuser' }
            }]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const joinMock = vi.fn().mockReturnValue({ where: whereMock });
            const fromMock = vi.fn().mockReturnValue({ innerJoin: joinMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            const result = await ContentService.getPageBySlug('test-page');

            expect(result).toBeDefined();
            expect(result?.page.id).toBe(1);
        });
    });

    describe('updatePage', () => {
        it('should update page if user is author', async () => {
            // Mock existing page check
            const limitMock = vi.fn().mockResolvedValue([{
                id: 1,
                authorId: 'user123',
                slug: 'test-page'
            }]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            // Mock update
            const returningMock = vi.fn().mockResolvedValue([{ id: 1, title: 'Updated Title' }]);
            const setMock = vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ returning: returningMock }) });
            (db.update as any).mockReturnValue({ set: setMock });

            const page = await ContentService.updatePage(1, { title: 'Updated Title' }, 'user123', 'customer');

            expect(page.title).toBe('Updated Title');
            expect(db.update).toHaveBeenCalled();
        });

        it('should throw error if user is not author and not admin', async () => {
            const limitMock = vi.fn().mockResolvedValue([{
                id: 1,
                authorId: 'otheruser',
                slug: 'test-page'
            }]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            await expect(ContentService.updatePage(1, { title: 'Updated Title' }, 'user123', 'customer'))
                .rejects.toThrow('You can only edit your own pages');
        });
    });
});
