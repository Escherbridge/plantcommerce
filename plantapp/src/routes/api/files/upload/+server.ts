import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { FileService } from '$lib/server/services/file';
import { validateFileSignature, scanForViruses } from '$lib/server/fileValidation';
import { AppError } from '$lib/utils/errorHandler';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;
const ALLOWED_MIME_TYPES = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'application/pdf'
];

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// 1. Authentication
		const session = locals.session;
		const user = locals.user;
		if (!session || !user) {
			throw error(401, 'Authentication required');
		}

		// 2. Form Data Parsing
		const formData = await request.formData();
		const files = formData.getAll('files').filter(f => f instanceof File) as File[];

		if (files.length === 0) {
			throw error(400, 'No files provided');
		}

		if (files.length > MAX_FILES) {
			throw error(400, `Cannot upload more than ${MAX_FILES} files at once`);
		}

		// 3. File Validation
		for (const file of files) {
			if (file.size > MAX_FILE_SIZE) {
				throw new AppError('FILE_TOO_LARGE', `File ${file.name} exceeds the ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`, 400);
			}

			if (!ALLOWED_MIME_TYPES.includes(file.type)) {
				throw new AppError('INVALID_MIME_TYPE', `File type ${file.type} is not allowed.`, 400);
			}

			const buffer = Buffer.from(await file.arrayBuffer());

			if (!validateFileSignature(buffer, file.type)) {
				throw new AppError('INVALID_FILE_SIGNATURE', `File ${file.name} has an invalid signature for its type.`, 400);
			}

			await scanForViruses(buffer);
		}

		// 4. Process and Upload
		const entityType = formData.get('entityType') as 'user' | 'product' | 'content' | 'general';
		const entityId = formData.get('entityId') as string | undefined;
		const isPublic = formData.get('isPublic') === 'true';
		
		// ... (rest of the logic for metadata, etc.)

		const uploadedFiles = [];
		for (const file of files) {
			const buffer = Buffer.from(await file.arrayBuffer());
			const uploadedFile = await FileService.uploadFile({
				buffer,
				originalFilename: file.name,
				mimeType: file.type,
				entityType,
				entityId,
				uploadedBy: user.id,
				isPublic,
				metadata: {}
			});
			uploadedFiles.push(uploadedFile);
		}

		return json({
			success: true,
			files: uploadedFiles,
			message: `Successfully uploaded ${uploadedFiles.length} file(s)`
		});

	} catch (err) {
		if (err instanceof AppError) {
			throw error(err.statusCode, err.message);
		}
		console.error('File upload error:', err);
		throw error(500, 'Internal server error during file upload');
	}
};