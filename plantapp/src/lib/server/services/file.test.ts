import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FileService } from './file';
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

const { mockS3Client, mockS3Constructor } = vi.hoisted(() => ({
	mockS3Client: { send: vi.fn().mockResolvedValue({}) },
	mockS3Constructor: vi.fn()
}));

vi.mock('@aws-sdk/client-s3', () => ({
	S3Client: vi.fn().mockImplementation((config: unknown) => {
		mockS3Constructor(config);
		return mockS3Client;
	}),
	PutObjectCommand: vi.fn(),
	DeleteObjectCommand: vi.fn(),
	GetObjectCommand: vi.fn()
}));

describe('FileService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockS3Client.send.mockResolvedValue({});
		(FileService as unknown as { s3Client: unknown }).s3Client = undefined;
	});

	afterEach(() => {
		(FileService as unknown as { s3Client: unknown }).s3Client = undefined;
	});

	describe('uploadFile', () => {
		it('should upload file to S3 and save to db', async () => {
			// Mock db insert
			const returningMock = vi.fn().mockResolvedValue([
				{
					id: 'file123',
					filename: 'test-file.jpg',
					originalFilename: 'test.jpg',
					mimeType: 'image/jpeg',
					bucketPath: 'user/2023/11/test-file.jpg',
					bucketName: 'test-bucket',
					isPublic: false,
					createdAt: new Date(),
					updatedAt: new Date()
				}
			]);
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
			expect(mockS3Client.send).toHaveBeenCalledTimes(1);
			expect(db.insert).toHaveBeenCalled();
		});
	});

	describe('getFileById', () => {
		it('should return file if found', async () => {
			const limitMock = vi.fn().mockResolvedValue([
				{
					id: 'file123',
					filename: 'test-file.jpg',
					bucketPath: 'path/to/file',
					bucketName: 'test-bucket',
					isPublic: true
				}
			]);
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
		it('should delete file from S3 and db', async () => {
			// Mock find file
			const limitMock = vi.fn().mockResolvedValue([
				{
					id: 'file123',
					bucketPath: 'path/to/file',
					bucketName: 'test-bucket'
				}
			]);
			const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
			const fromMock = vi.fn().mockReturnValue({ where: whereMock });
			(db.select as any).mockReturnValue({ from: fromMock });

			// Mock delete from db
			const deleteWhereMock = vi.fn();
			(db.delete as any).mockReturnValue({ where: deleteWhereMock });

			await FileService.deleteFile('file123');

			expect(mockS3Client.send).toHaveBeenCalledTimes(1);
			expect(db.delete).toHaveBeenCalled();
		});
	});
});
