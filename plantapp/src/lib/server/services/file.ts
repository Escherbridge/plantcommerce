import { Storage } from '@google-cloud/storage';
import { eq, and, desc, asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { randomUUID } from 'crypto';

interface UploadFileParams {
	buffer: Buffer;
	originalFilename: string;
	mimeType: string;
	entityType: 'user' | 'product' | 'content' | 'general';
	entityId?: string;
	uploadedBy?: string;
	isPublic?: boolean;
	metadata?: Record<string, any>;
}

interface FileMetadata {
	width?: number;
	height?: number;
	duration?: number;
	alt?: string;
	description?: string;
	[key: string]: any;
}

export interface FileWithUrl {
	id: string;
	filename: string;
	originalFilename: string;
	mimeType: string;
	fileSize: number;
	bucketPath: string;
	bucketName: string;
	entityType: string;
	entityId: string | null;
	uploadedBy: string | null;
	isPublic: boolean;
	metadata: FileMetadata | null;
	createdAt: Date;
	updatedAt: Date;
	publicUrl: string;
	signedUrl?: string;
}

export class FileService {
	private static storage: Storage;
	private static bucketName = process.env.GCS_BUCKET_NAME || 'aevani-files';

	/**
	 * Initialize GCS Storage client
	 */
	private static getStorage(): Storage {
		if (!this.storage) {
			this.storage = new Storage({
				projectId: process.env.GCS_PROJECT_ID,
				keyFilename: process.env.GCS_KEY_FILE,
			});
		}
		return this.storage;
	}

	/**
	 * Generate bucket path based on entity type and date
	 */
	private static generateBucketPath(
		entityType: string,
		entityId: string | undefined,
		filename: string
	): string {
		const date = new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		
		let basePath = `${entityType}/${year}/${month}`;
		
		if (entityId) {
			basePath += `/${entityId}`;
		}
		
		return `${basePath}/${filename}`;
	}

	/**
	 * Generate unique filename to prevent conflicts
	 */
	private static generateUniqueFilename(originalFilename: string): string {
		const uuid = randomUUID();
		const extension = originalFilename.split('.').pop();
		const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');
		
		// Sanitize filename
		const sanitizedName = nameWithoutExt
			.toLowerCase()
			.replace(/[^a-z0-9]/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '');
		
		return extension 
			? `${sanitizedName}-${uuid.substring(0, 8)}.${extension}`
			: `${sanitizedName}-${uuid.substring(0, 8)}`;
	}

	/**
	 * Upload file to GCS and store metadata in database
	 */
	static async uploadFile(params: UploadFileParams): Promise<FileWithUrl> {
		const {
			buffer,
			originalFilename,
			mimeType,
			entityType,
			entityId,
			uploadedBy,
			isPublic = false,
			metadata = {}
		} = params;

		const fileId = randomUUID();
		const uniqueFilename = this.generateUniqueFilename(originalFilename);
		const bucketPath = this.generateBucketPath(entityType, entityId, uniqueFilename);

		const storage = this.getStorage();
		const bucket = storage.bucket(this.bucketName);
		const file = bucket.file(bucketPath);

		try {
			// Upload file to GCS
			await file.save(buffer, {
				metadata: {
					contentType: mimeType,
					cacheControl: 'public, max-age=31536000', // 1 year
					metadata: {
						originalFilename,
						entityType,
						entityId: entityId || '',
						uploadedBy: uploadedBy || ''
					}
				},
				public: isPublic
			});

			// Store file metadata in database
			const fileData: typeof table.file.$inferInsert = {
				id: fileId,
				filename: uniqueFilename,
				originalFilename,
				mimeType,
				fileSize: buffer.length,
				bucketPath,
				bucketName: this.bucketName,
				entityType,
				entityId: entityId || null,
				uploadedBy: uploadedBy || null,
				isPublic,
				metadata: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null
			};

			const [dbFile] = await db.insert(table.file).values(fileData).returning();

			return this.fileWithUrl(dbFile);
		} catch (error) {
			// Clean up uploaded file if database operation fails
			try {
				await file.delete();
			} catch (deleteError) {
				console.error('Failed to clean up uploaded file:', deleteError);
			}
			throw error;
		}
	}

	/**
	 * Get file by ID
	 */
	static async getFileById(fileId: string): Promise<FileWithUrl | null> {
		const fileResult = await db
			.select()
			.from(table.file)
			.where(eq(table.file.id, fileId))
			.limit(1);

		if (fileResult.length === 0) {
			return null;
		}

		return this.fileWithUrl(fileResult[0]);
	}

	/**
	 * Get files by entity
	 */
	static async getFilesByEntity(
		entityType: string,
		entityId: string,
		limit: number = 50
	): Promise<FileWithUrl[]> {
		const files = await db
			.select()
			.from(table.file)
			.where(
				and(
					eq(table.file.entityType, entityType),
					eq(table.file.entityId, entityId)
				)
			)
			.orderBy(desc(table.file.createdAt))
			.limit(limit);

		return files.map(file => this.fileWithUrl(file));
	}

	/**
	 * Delete file from both GCS and database
	 */
	static async deleteFile(fileId: string): Promise<void> {
		const fileResult = await db
			.select()
			.from(table.file)
			.where(eq(table.file.id, fileId))
			.limit(1);

		if (fileResult.length === 0) {
			throw new Error('File not found');
		}

		const fileRecord = fileResult[0];
		const storage = this.getStorage();
		const bucket = storage.bucket(fileRecord.bucketName);
		const file = bucket.file(fileRecord.bucketPath);

		try {
			// Delete from GCS
			await file.delete();
		} catch (error) {
			// Log error but continue with database deletion
			console.error('Failed to delete file from GCS:', error);
		}

		// Delete from database
		await db.delete(table.file).where(eq(table.file.id, fileId));
	}

	/**
	 * Generate signed URL for private files
	 */
	static async generateSignedUrl(
		fileId: string,
		expiresIn: number = 3600 // 1 hour in seconds
	): Promise<string> {
		const fileResult = await db
			.select()
			.from(table.file)
			.where(eq(table.file.id, fileId))
			.limit(1);

		if (fileResult.length === 0) {
			throw new Error('File not found');
		}

		const fileRecord = fileResult[0];
		const storage = this.getStorage();
		const bucket = storage.bucket(fileRecord.bucketName);
		const file = bucket.file(fileRecord.bucketPath);

		const [signedUrl] = await file.getSignedUrl({
			action: 'read',
			expires: Date.now() + expiresIn * 1000,
		});

		return signedUrl;
	}

	/**
	 * Update file metadata
	 */
	static async updateFileMetadata(
		fileId: string,
		updates: {
			metadata?: Record<string, any>;
			isPublic?: boolean;
		}
	): Promise<FileWithUrl> {
		const updateData: Partial<typeof table.file.$inferInsert> = {
			updatedAt: new Date()
		};

		if (updates.metadata !== undefined) {
			updateData.metadata = JSON.stringify(updates.metadata);
		}

		if (updates.isPublic !== undefined) {
			updateData.isPublic = updates.isPublic;

			// Update GCS file visibility
			const fileResult = await db
				.select()
				.from(table.file)
				.where(eq(table.file.id, fileId))
				.limit(1);

			if (fileResult.length > 0) {
				const fileRecord = fileResult[0];
				const storage = this.getStorage();
				const bucket = storage.bucket(fileRecord.bucketName);
				const file = bucket.file(fileRecord.bucketPath);

				if (updates.isPublic) {
					await file.makePublic();
				} else {
					await file.makePrivate();
				}
			}
		}

		const [updatedFile] = await db
			.update(table.file)
			.set(updateData)
			.where(eq(table.file.id, fileId))
			.returning();

		if (!updatedFile) {
			throw new Error('File not found');
		}

		return this.fileWithUrl(updatedFile);
	}

	/**
	 * Get files by type (images, documents, etc.)
	 */
	static async getFilesByMimeType(
		mimeTypePattern: string,
		limit: number = 50
	): Promise<FileWithUrl[]> {
		// This is a simplified approach - in production you might want to use a proper LIKE query
		const files = await db
			.select()
			.from(table.file)
			.orderBy(desc(table.file.createdAt))
			.limit(limit);

		const filteredFiles = files.filter(file => 
			file.mimeType.includes(mimeTypePattern)
		);

		return filteredFiles.map(file => this.fileWithUrl(file));
	}

	/**
	 * Generate public URL for a file path (static helper)
	 */
	static generatePublicUrl(bucketPath: string, isPublic: boolean = true): string {
		if (!isPublic) return '';
		const baseUrl = process.env.GCS_BASE_URL || `https://storage.googleapis.com/${this.bucketName}`;
		return `${baseUrl}/${bucketPath}`;
	}

	/**
	 * Convert database file record to FileWithUrl
	 */
	private static fileWithUrl(file: table.File): FileWithUrl {
		const baseUrl = process.env.GCS_BASE_URL || `https://storage.googleapis.com/${this.bucketName}`;
		const publicUrl = file.isPublic 
			? `${baseUrl}/${file.bucketPath}`
			: '';

		return {
			id: file.id,
			filename: file.filename,
			originalFilename: file.originalFilename,
			mimeType: file.mimeType,
			fileSize: file.fileSize,
			bucketPath: file.bucketPath,
			bucketName: file.bucketName,
			entityType: file.entityType,
			entityId: file.entityId,
			uploadedBy: file.uploadedBy,
			isPublic: file.isPublic,
			metadata: file.metadata ? JSON.parse(file.metadata) : null,
			createdAt: file.createdAt,
			updatedAt: file.updatedAt,
			publicUrl,
			signedUrl: undefined // Will be populated separately if needed
		};
	}
}

export default FileService;
