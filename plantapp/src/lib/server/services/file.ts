import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { randomUUID } from 'crypto';
import { env } from '$env/dynamic/private';

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
	private static s3Client: S3Client;
	private static bucketName = env.S3_BUCKET_NAME || 'aevani-assets';

	/**
	 * Initialize S3-compatible client (Railway Object Storage)
	 */
	private static getS3Client(): S3Client {
		if (!this.s3Client) {
			this.s3Client = new S3Client({
				region: env.S3_REGION || 'us-east-1',
				endpoint: env.S3_ENDPOINT,
				credentials: {
					accessKeyId: env.S3_ACCESS_KEY_ID || '',
					secretAccessKey: env.S3_SECRET_ACCESS_KEY || ''
				},
				forcePathStyle: true // Required for Railway and most S3-compatible providers
			});
		}
		return this.s3Client;
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
	 * Upload file to S3-compatible storage and store metadata in database
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

		const s3 = this.getS3Client();

		try {
			await s3.send(new PutObjectCommand({
				Bucket: this.bucketName,
				Key: bucketPath,
				Body: buffer,
				ContentType: mimeType,
				CacheControl: 'max-age=31536000',
				Metadata: {
					originalFilename,
					entityType,
					entityId: entityId || '',
					uploadedBy: uploadedBy || ''
				}
			}));

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
				await s3.send(new DeleteObjectCommand({
					Bucket: this.bucketName,
					Key: bucketPath
				}));
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
	 * Delete file from both S3 and database
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
		const s3 = this.getS3Client();

		try {
			await s3.send(new DeleteObjectCommand({
				Bucket: fileRecord.bucketName,
				Key: fileRecord.bucketPath
			}));
		} catch (error) {
			console.error('Failed to delete file from S3:', error);
		}

		await db.delete(table.file).where(eq(table.file.id, fileId));
	}

	/**
	 * Generate signed URL for private files
	 */
	static async generateSignedUrl(
		fileId: string,
		expiresIn: number = 3600
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
		const s3 = this.getS3Client();

		const command = new GetObjectCommand({
			Bucket: fileRecord.bucketName,
			Key: fileRecord.bucketPath
		});

		return getSignedUrl(s3, command, { expiresIn });
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
			// Railway S3 uses signed URLs only - isPublic flag is tracked in DB
			// for application-level access control (no S3 ACL changes needed)
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
	 * Get files by MIME type pattern
	 */
	static async getFilesByMimeType(
		mimeTypePattern: string,
		limit: number = 50
	): Promise<FileWithUrl[]> {
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
	 * Generate a signed URL for a file path (Railway S3 has no public access)
	 */
	static async generateSignedUrlForPath(
		bucketPath: string,
		expiresIn: number = 3600
	): Promise<string> {
		const s3 = this.getS3Client();
		const command = new GetObjectCommand({
			Bucket: this.bucketName,
			Key: bucketPath
		});
		return getSignedUrl(s3, command, { expiresIn });
	}

	/**
	 * Convert database file record to FileWithUrl
	 * Note: publicUrl is empty - use generateSignedUrl() for access
	 */
	private static fileWithUrl(file: table.File): FileWithUrl {
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
			publicUrl: '', // Railway S3 requires signed URLs
			signedUrl: undefined
		};
	}
}

export default FileService;
