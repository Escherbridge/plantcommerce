import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileService } from './file';
import { db } from '$lib/server/db';
import { Storage } from '@google-cloud/storage';

// Mock dependencies
vi.mock('$lib/server/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    }
}));

// Mock Google Cloud Storage
const mockFile = {
    save: vi.fn(),
    delete: vi.fn(),
    getSignedUrl: vi.fn().mockResolvedValue(['https://signed-url.com']),
    makePublic: vi.fn(),
    makePrivate: vi.fn()
};

const mockBucket = {
    file: vi.fn().mockReturnValue(mockFile)
};

const mockStorage = {
    bucket: vi.fn().mockReturnValue(mockBucket)
};

vi.mock('@google-cloud/storage', () => ({
    Storage: vi.fn().mockImplementation(() => mockStorage)
}));

describe('FileService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset storage instance singleton if possible, or just rely on mocks
        // Since FileService uses a static private property for storage, we might need to reset it if we want fresh init
        // But for now, mocking the constructor should be enough if it's called
    });

    describe('uploadFile', () => {
        it('should upload file to GCS and save to db', async () => {
            // Mock db insert
            const returningMock = vi.fn().mockResolvedValue([{
                id: 'file123',
                filename: 'test-file.jpg',
                originalFilename: 'test.jpg',
                mimeType: 'image/jpeg',
                bucketPath: 'user/2023/11/test-file.jpg',
                bucketName: 'test-bucket',
                isPublic: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }]);
            const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
            (db.insert as any).mockReturnValue({ values: valuesMock });

            const result = await FileService.uploadFile({
                buffer: Buffer.from('test content'),
                originalFilename: 'test.jpg',
                mimeType: 'image/jpeg',
                entityType: 'user',
                entityId: 'user123'
            });

            expect(result.id).toBe('file123');
            expect(mockFile.save).toHaveBeenCalled();
            expect(db.insert).toHaveBeenCalled();
        });
    });

    describe('getFileById', () => {
        it('should return file if found', async () => {
            const limitMock = vi.fn().mockResolvedValue([{
                id: 'file123',
                filename: 'test-file.jpg',
                bucketPath: 'path/to/file',
                bucketName: 'test-bucket',
                isPublic: true
            }]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            const file = await FileService.getFileById('file123');

            expect(file).toBeDefined();
            expect(file?.id).toBe('file123');
        });

        it('should return null if not found', async () => {
            const limitMock = vi.fn().mockResolvedValue([]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            const file = await FileService.getFileById('file123');

            expect(file).toBeNull();
        });
    });

    describe('deleteFile', () => {
        it('should delete file from GCS and db', async () => {
            // Mock find file
            const limitMock = vi.fn().mockResolvedValue([{
                id: 'file123',
                bucketPath: 'path/to/file',
                bucketName: 'test-bucket'
            }]);
            const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
            const fromMock = vi.fn().mockReturnValue({ where: whereMock });
            (db.select as any).mockReturnValue({ from: fromMock });

            // Mock delete from db
            const deleteWhereMock = vi.fn();
            (db.delete as any).mockReturnValue({ where: deleteWhereMock });

            await FileService.deleteFile('file123');

            expect(mockFile.delete).toHaveBeenCalled();
            expect(db.delete).toHaveBeenCalled();
        });
    });
});
