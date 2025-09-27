import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, adminProcedure, router } from './trpc';
import { FileService, type FileWithUrl } from '../services/file';

// Validation schemas
const entityTypeSchema = z.enum(['user', 'product', 'content', 'general']);

const uploadFileSchema = z.object({
	entityType: entityTypeSchema,
	entityId: z.string().optional(),
	isPublic: z.boolean().default(false),
	metadata: z.record(z.any()).optional()
});

const getFilesByEntitySchema = z.object({
	entityType: entityTypeSchema,
	entityId: z.string(),
	limit: z.number().min(1).max(100).default(50)
});

const updateFileMetadataSchema = z.object({
	fileId: z.string().uuid(),
	metadata: z.record(z.any()).optional(),
	isPublic: z.boolean().optional()
});

export const filesRouter = router({
	/**
	 * Get file by ID (public for public files, protected for private files)
	 */
	getFile: publicProcedure
		.input(z.object({
			fileId: z.string().uuid()
		}))
		.query(async ({ input, ctx }) => {
			const file = await FileService.getFileById(input.fileId);
			
			if (!file) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'File not found'
				});
			}

			// If file is private, require authentication
			if (!file.isPublic && !ctx.userId) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'Authentication required for private files'
				});
			}

			// If file is private and user is authenticated, generate signed URL
			if (!file.isPublic && ctx.userId) {
				try {
					file.signedUrl = await FileService.generateSignedUrl(file.id);
				} catch (error) {
					console.error('Failed to generate signed URL:', error);
				}
			}

			return file;
		}),

	/**
	 * Get files by entity (protected - requires authentication)
	 */
	getFilesByEntity: protectedProcedure
		.input(getFilesByEntitySchema)
		.query(async ({ input }) => {
			return await FileService.getFilesByEntity(
				input.entityType,
				input.entityId,
				input.limit
			);
		}),

	/**
	 * Get signed URL for private file (protected)
	 */
	getSignedUrl: protectedProcedure
		.input(z.object({
			fileId: z.string().uuid(),
			expiresIn: z.number().min(60).max(86400).default(3600) // 1 minute to 24 hours
		}))
		.query(async ({ input, ctx }) => {
			const file = await FileService.getFileById(input.fileId);
			
			if (!file) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'File not found'
				});
			}

			// Check if user has access to this file
			// Users can access their own uploaded files, admins can access all files
			if (file.uploadedBy !== ctx.userId && ctx.userRole !== 'admin') {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Access denied'
				});
			}

			try {
				const signedUrl = await FileService.generateSignedUrl(input.fileId, input.expiresIn);
				return { signedUrl };
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to generate signed URL'
				});
			}
		}),

	/**
	 * Update file metadata (protected)
	 */
	updateFileMetadata: protectedProcedure
		.input(updateFileMetadataSchema)
		.mutation(async ({ input, ctx }) => {
			const file = await FileService.getFileById(input.fileId);
			
			if (!file) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'File not found'
				});
			}

			// Check if user has access to update this file
			if (file.uploadedBy !== ctx.userId && ctx.userRole !== 'admin') {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Access denied'
				});
			}

			try {
				return await FileService.updateFileMetadata(input.fileId, {
					metadata: input.metadata,
					isPublic: input.isPublic
				});
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to update file metadata'
				});
			}
		}),

	/**
	 * Delete file (protected)
	 */
	deleteFile: protectedProcedure
		.input(z.object({
			fileId: z.string().uuid()
		}))
		.mutation(async ({ input, ctx }) => {
			const file = await FileService.getFileById(input.fileId);
			
			if (!file) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'File not found'
				});
			}

			// Check if user has access to delete this file
			if (file.uploadedBy !== ctx.userId && ctx.userRole !== 'admin') {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Access denied'
				});
			}

			try {
				await FileService.deleteFile(input.fileId);
				return { success: true };
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to delete file'
				});
			}
		}),

	/**
	 * Get image files (public - for galleries, etc.)
	 */
	getImages: publicProcedure
		.input(z.object({
			limit: z.number().min(1).max(100).default(50),
			entityType: entityTypeSchema.optional(),
			entityId: z.string().optional()
		}))
		.query(async ({ input }) => {
			// Get image files (MIME types starting with 'image/')
			let files = await FileService.getFilesByMimeType('image/', input.limit * 2); // Get more to filter

			// Filter by entity if specified
			if (input.entityType && input.entityId) {
				files = files.filter(file => 
					file.entityType === input.entityType && file.entityId === input.entityId
				);
			}

			// Only return public images for this public endpoint
			files = files.filter(file => file.isPublic);

			// Limit results
			return files.slice(0, input.limit);
		}),

	/**
	 * Get user's uploaded files (protected)
	 */
	getMyFiles: protectedProcedure
		.input(z.object({
			limit: z.number().min(1).max(100).default(50),
			mimeTypeFilter: z.string().optional()
		}))
		.query(async ({ input, ctx }) => {
			// This would need to be implemented in the FileService
			// For now, we'll get all files and filter by uploadedBy
			const files = await FileService.getFilesByMimeType('', 1000); // Get many files
			
			let userFiles = files.filter(file => file.uploadedBy === ctx.userId);

			// Filter by MIME type if specified
			if (input.mimeTypeFilter) {
				userFiles = userFiles.filter(file => 
					file.mimeType.includes(input.mimeTypeFilter!)
				);
			}

			return userFiles.slice(0, input.limit);
		}),

	/**
	 * Admin: Get all files (admin only)
	 */
	getAllFiles: adminProcedure
		.input(z.object({
			limit: z.number().min(1).max(100).default(50),
			entityType: entityTypeSchema.optional(),
			mimeTypeFilter: z.string().optional()
		}))
		.query(async ({ input }) => {
			let files = await FileService.getFilesByMimeType(
				input.mimeTypeFilter || '', 
				input.limit * 2
			);

			// Filter by entity type if specified
			if (input.entityType) {
				files = files.filter(file => file.entityType === input.entityType);
			}

			return files.slice(0, input.limit);
		}),

	/**
	 * Get file statistics (admin only)
	 */
	getFileStats: adminProcedure
		.query(async () => {
			// This would be implemented with proper SQL queries in production
			// For now, we'll get a sample of files and provide basic stats
			const files = await FileService.getFilesByMimeType('', 1000);
			
			const stats = {
				totalFiles: files.length,
				totalSize: files.reduce((sum, file) => sum + file.fileSize, 0),
				byEntityType: {} as Record<string, number>,
				byMimeType: {} as Record<string, number>
			};

			files.forEach(file => {
				stats.byEntityType[file.entityType] = (stats.byEntityType[file.entityType] || 0) + 1;
				stats.byMimeType[file.mimeType] = (stats.byMimeType[file.mimeType] || 0) + 1;
			});

			return stats;
		})
});

export default filesRouter;
