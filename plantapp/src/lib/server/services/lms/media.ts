import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { eq, and, desc, count } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { FileService } from '$lib/server/services/file';
import { env } from '$env/dynamic/private';

const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
const AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac'];
const DOC_TYPES = [
	'application/pdf',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/zip'
];
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

const SIZE_LIMITS: Record<string, number> = {
	video: 2 * 1024 * 1024 * 1024,
	audio: 500 * 1024 * 1024,
	document: 100 * 1024 * 1024,
	image: 20 * 1024 * 1024
};

interface UploadUrlResult {
	uploadUrl: string;
	fileId: string;
	bucketPath: string;
}

export class LmsMediaService {
	private static getS3Client(): S3Client {
		return new S3Client({
			region: env.S3_REGION || 'us-east-1',
			endpoint: env.S3_ENDPOINT,
			credentials: {
				accessKeyId: env.S3_ACCESS_KEY_ID || '',
				secretAccessKey: env.S3_SECRET_ACCESS_KEY || ''
			},
			forcePathStyle: true
		});
	}

	private static validateMimeType(mimeType: string, mediaType: string): void {
		const allowed: Record<string, string[]> = {
			video: VIDEO_TYPES,
			audio: AUDIO_TYPES,
			document: DOC_TYPES,
			image: IMAGE_TYPES
		};
		if (!allowed[mediaType]?.includes(mimeType)) {
			throw new Error(`Invalid file type '${mimeType}' for ${mediaType} upload`);
		}
	}

	private static generateBucketPath(courseId: string, mediaType: string, filename: string): string {
		const date = new Date();
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const uuid = randomUUID().substring(0, 8);
		const ext = filename.split('.').pop() || '';
		const safeName = filename
			.replace(/\.[^/.]+$/, '')
			.toLowerCase()
			.replace(/[^a-z0-9]/g, '-')
			.replace(/-+/g, '-');
		return `lms/${courseId}/${mediaType}/${y}/${m}/${safeName}-${uuid}.${ext}`;
	}

	static async generateUploadUrl(
		courseId: string,
		filename: string,
		mimeType: string,
		mediaType: 'video' | 'audio' | 'document' | 'image',
		userId: string
	): Promise<UploadUrlResult> {
		this.validateMimeType(mimeType, mediaType);

		const fileId = randomUUID();
		const bucketPath = this.generateBucketPath(courseId, mediaType, filename);
		const bucketName = env.S3_BUCKET_NAME || 'aevani-assets';

		await db.insert(table.file).values({
			id: fileId,
			filename: filename.toLowerCase().replace(/[^a-z0-9.]/g, '-'),
			originalFilename: filename,
			mimeType,
			fileSize: 0,
			bucketPath,
			bucketName,
			entityType: 'lms',
			entityId: courseId,
			uploadedBy: userId,
			isPublic: false,
			metadata: JSON.stringify({ mediaType, status: 'pending' })
		});

		const s3 = this.getS3Client();
		const command = new PutObjectCommand({
			Bucket: bucketName,
			Key: bucketPath,
			ContentType: mimeType
		});

		const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

		return { uploadUrl, fileId, bucketPath };
	}

	static async confirmUpload(fileId: string, fileSize: number): Promise<void> {
		const [file] = await db.select().from(table.file).where(eq(table.file.id, fileId)).limit(1);
		if (!file) throw new Error('File not found');

		const meta = file.metadata ? JSON.parse(file.metadata) : {};
		const mediaType = meta.mediaType || 'document';
		const limit = SIZE_LIMITS[mediaType] || SIZE_LIMITS.document;
		if (fileSize > limit) throw new Error(`File exceeds ${mediaType} size limit`);

		await db
			.update(table.file)
			.set({
				fileSize,
				metadata: JSON.stringify({ ...meta, status: 'uploaded' }),
				updatedAt: new Date()
			})
			.where(eq(table.file.id, fileId));
	}

	static async generateStreamingUrl(fileId: string, expiresIn: number = 900): Promise<string> {
		return FileService.generateSignedUrl(fileId, expiresIn);
	}

	static async getMediaLibrary(
		courseId: string,
		type?: string,
		page: number = 1,
		limit: number = 20
	) {
		const offset = (page - 1) * limit;

		const files = await db
			.select()
			.from(table.file)
			.where(and(eq(table.file.entityType, 'lms'), eq(table.file.entityId, courseId)))
			.orderBy(desc(table.file.createdAt))
			.limit(limit)
			.offset(offset);

		const filtered = type ? files.filter((f) => f.mimeType.startsWith(type)) : files;

		const [totalResult] = await db
			.select({ total: count() })
			.from(table.file)
			.where(and(eq(table.file.entityType, 'lms'), eq(table.file.entityId, courseId)));

		return {
			files: filtered.map((f) => ({
				id: f.id,
				filename: f.originalFilename,
				mimeType: f.mimeType,
				fileSize: f.fileSize,
				createdAt: f.createdAt,
				metadata: f.metadata ? JSON.parse(f.metadata) : null
			})),
			total: totalResult?.total || 0,
			page,
			limit
		};
	}

	static async deleteMedia(fileId: string, userId: string): Promise<void> {
		const [file] = await db.select().from(table.file).where(eq(table.file.id, fileId)).limit(1);
		if (!file) throw new Error('File not found');
		await FileService.deleteFile(fileId);
	}
}

export default LmsMediaService;
