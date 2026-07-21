import { error, isHttpError, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { FileService } from '$lib/server/services/file';
import { validateFileSignature, scanForViruses } from '$lib/server/fileValidation';
import { AppError } from '$lib/utils/errorHandler';
import {
	authorizeFileUpload,
	FileAuthorizationError,
	toFileClientRecord
} from '$lib/server/fileAuthorization';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;
const ALLOWED_MIME_TYPES = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'application/pdf'
];

function getOptionalFormString(formData: FormData, key: string): string | undefined {
	const value = formData.get(key);
	if (value === null) return undefined;
	if (typeof value !== 'string') {
		throw error(400, `${key} must be a text value`);
	}

	const normalized = value.trim();
	return normalized || undefined;
}

function getOptionalFormBoolean(formData: FormData, key: string): boolean | undefined {
	const value = formData.get(key);
	if (value === null) return undefined;
	if (value === 'true') return true;
	if (value === 'false') return false;

	throw error(400, `${key} must be either true or false`);
}

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

		// 3. Resolve untrusted target metadata before doing any expensive file work.
		const target = await authorizeFileUpload(user, {
			entityType: getOptionalFormString(formData, 'entityType'),
			entityId: getOptionalFormString(formData, 'entityId'),
			isPublic: getOptionalFormBoolean(formData, 'isPublic')
		});

		// 4. File Validation
		const validatedFiles: Array<{ file: File; buffer: Buffer }> = [];
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
			validatedFiles.push({ file, buffer });
		}

		const uploadedFiles = [];
		for (const { file, buffer } of validatedFiles) {
			const uploadedFile = await FileService.uploadFile({
				buffer,
				originalFilename: file.name,
				mimeType: file.type,
				entityType: target.entityType,
				entityId: target.entityId,
				uploadedBy: user.id,
				isPublic: target.isPublic,
				metadata: {}
			});
			uploadedFiles.push(toFileClientRecord(uploadedFile));
		}

		return json({
			success: true,
			files: uploadedFiles,
			message: `Successfully uploaded ${uploadedFiles.length} file(s)`
		});

	} catch (err) {
		if (isHttpError(err)) {
			throw err;
		}
		if (err instanceof FileAuthorizationError) {
			throw error(err.statusCode, err.message);
		}
		if (err instanceof AppError) {
			throw error(err.statusCode, err.message);
		}
		console.error('File upload error:', err);
		throw error(500, 'Internal server error during file upload');
	}
};
