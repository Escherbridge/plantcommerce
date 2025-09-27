import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import multer from 'multer';
import { FileService } from '$lib/server/services/file';

// Configure multer for memory storage
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
		files: 5 // Maximum 5 files at once
	},
	fileFilter: (req, file, cb) => {
		// Allow common file types
		const allowedMimeTypes = [
			// Images
			'image/jpeg',
			'image/jpg', 
			'image/png',
			'image/gif',
			'image/webp',
			'image/svg+xml',
			// Documents
			'application/pdf',
			'text/plain',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			// Media
			'video/mp4',
			'audio/mpeg',
			'audio/wav'
		];

		if (allowedMimeTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error(`File type ${file.mimetype} not allowed`));
		}
	}
});

// Promisify multer
const processUpload = (req: any): Promise<{ files: Express.Multer.File[], body: any }> => {
	return new Promise((resolve, reject) => {
		const multerUpload = upload.array('files', 5);
		multerUpload(req, {} as any, (err: any) => {
			if (err) {
				reject(err);
			} else {
				resolve({
					files: req.files || [],
					body: req.body || {}
				});
			}
		});
	});
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Check authentication
		const session = locals.session;
		const user = locals.user;
		
		if (!session || !user) {
			throw error(401, 'Authentication required');
		}

		// Convert Request to Node.js request-like object for multer
		const formData = await request.formData();
		
		// Extract files and form fields
		const files: Express.Multer.File[] = [];
		const body: Record<string, any> = {};

		for (const [key, value] of formData.entries()) {
			if (value instanceof File) {
				// Convert File to Buffer
				const buffer = Buffer.from(await value.arrayBuffer());
				files.push({
					fieldname: key,
					originalname: value.name,
					encoding: '7bit',
					mimetype: value.type,
					buffer: buffer,
					size: buffer.length
				} as Express.Multer.File);
			} else {
				body[key] = value;
			}
		}

		if (files.length === 0) {
			throw error(400, 'No files provided');
		}

		// Validate input
		const entityType = body.entityType as 'user' | 'product' | 'content' | 'general';
		const entityId = body.entityId as string | undefined;
		const isPublic = body.isPublic === 'true' || body.isPublic === true;
		
		let metadata: Record<string, any> = {};
		if (body.metadata) {
			try {
				metadata = typeof body.metadata === 'string' 
					? JSON.parse(body.metadata) 
					: body.metadata;
			} catch {
				throw error(400, 'Invalid metadata JSON');
			}
		}

		if (!['user', 'product', 'content', 'general'].includes(entityType)) {
			throw error(400, 'Invalid entity type');
		}

		// Upload files
		const uploadedFiles = [];
		
		for (const file of files) {
			try {
				const uploadedFile = await FileService.uploadFile({
					buffer: file.buffer,
					originalFilename: file.originalname,
					mimeType: file.mimetype,
					entityType,
					entityId,
					uploadedBy: user.id,
					isPublic,
					metadata
				});

				uploadedFiles.push(uploadedFile);
			} catch (uploadError) {
				console.error('Upload error:', uploadError);
				
				// Clean up any already uploaded files
				for (const uploaded of uploadedFiles) {
					try {
						await FileService.deleteFile(uploaded.id);
					} catch (cleanupError) {
						console.error('Cleanup error:', cleanupError);
					}
				}

				throw error(500, `Upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
			}
		}

		return json({
			success: true,
			files: uploadedFiles,
			message: `Successfully uploaded ${uploadedFiles.length} file(s)`
		});

	} catch (err) {
		console.error('File upload error:', err);
		
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}

		throw error(500, 'Internal server error during file upload');
	}
};
