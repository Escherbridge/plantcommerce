import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { FileWithUrl } from '$lib/server/services/file';
import type { User } from '$lib/server/db/schema';

export const FILE_ENTITY_TYPES = ['user', 'product', 'content', 'general'] as const;

export type FileEntityType = (typeof FILE_ENTITY_TYPES)[number];
export type FileActor = Pick<User, 'id' | 'role'>;

export interface AuthorizedFileUploadTarget {
	entityType: FileEntityType;
	entityId?: string;
	isPublic: boolean;
}

export interface FileClientRecord {
	id: string;
	filename: string;
	originalFilename: string;
	mimeType: string;
	fileSize: number;
	entityType: string;
	entityId: string | null;
	isPublic: boolean;
	metadata: FileWithUrl['metadata'];
	createdAt: Date;
	updatedAt: Date;
	publicUrl: string;
	signedUrl?: string;
}

export class FileAuthorizationError extends Error {
	constructor(
		public readonly statusCode: 400 | 403,
		message: string
	) {
		super(message);
		this.name = 'FileAuthorizationError';
	}
}

function isAdmin(actor: FileActor): boolean {
	return actor.role === 'admin';
}

function normalizeEntityType(entityType: string | undefined): FileEntityType | undefined {
	if (!entityType) return undefined;

	if ((FILE_ENTITY_TYPES as readonly string[]).includes(entityType)) {
		return entityType as FileEntityType;
	}

	throw new FileAuthorizationError(400, 'Invalid file entity type');
}

function normalizeEntityId(entityId: string | undefined): string | undefined {
	if (!entityId) return undefined;

	const normalized = entityId.trim();
	if (!normalized) return undefined;

	if (normalized.length > 255) {
		throw new FileAuthorizationError(400, 'File entity ID is too long');
	}

	return normalized;
}

function parseNumericEntityId(entityId: string): number {
	if (!/^[1-9]\d*$/.test(entityId)) {
		throw new FileAuthorizationError(400, 'File entity ID must be a positive integer');
	}

	const numericEntityId = Number(entityId);
	if (!Number.isSafeInteger(numericEntityId)) {
		throw new FileAuthorizationError(400, 'File entity ID is invalid');
	}

	return numericEntityId;
}

async function assertAdminTargetExists(
	entityType: FileEntityType,
	entityId: string | undefined
): Promise<void> {
	if (entityType === 'general') {
		if (entityId) {
			throw new FileAuthorizationError(400, 'General files cannot have an entity ID');
		}
		return;
	}

	if (!entityId) {
		throw new FileAuthorizationError(400, 'An entity ID is required for this file type');
	}

	if (entityType === 'user') {
		const [targetUser] = await db
			.select({ id: table.user.id })
			.from(table.user)
			.where(eq(table.user.id, entityId))
			.limit(1);

		if (!targetUser) {
			throw new FileAuthorizationError(400, 'File target does not exist');
		}
		return;
	}

	const numericEntityId = parseNumericEntityId(entityId);
	const target =
		entityType === 'product'
			? await db
					.select({ id: table.product.id })
					.from(table.product)
					.where(eq(table.product.id, numericEntityId))
					.limit(1)
			: await db
					.select({ id: table.contentPage.id })
					.from(table.contentPage)
					.where(eq(table.contentPage.id, numericEntityId))
					.limit(1);

	if (target.length === 0) {
		throw new FileAuthorizationError(400, 'File target does not exist');
	}
}

/**
 * Resolves client-supplied upload metadata to a server-authorized target.
 * Non-admin users may only upload private files for their own user record; all
 * cross-entity and public uploads require an administrator.
 */
export async function authorizeFileUpload(
	actor: FileActor,
	input: {
		entityType?: string;
		entityId?: string;
		isPublic?: boolean;
	}
): Promise<AuthorizedFileUploadTarget> {
	const entityType = normalizeEntityType(input.entityType);
	const entityId = normalizeEntityId(input.entityId);

	if (!isAdmin(actor)) {
		if (entityType && entityType !== 'user') {
			throw new FileAuthorizationError(
				403,
				'Only administrators can upload files for this entity type'
			);
		}

		if (entityId && entityId !== actor.id) {
			throw new FileAuthorizationError(403, 'You can only upload files for your own account');
		}

		if (input.isPublic) {
			throw new FileAuthorizationError(403, 'Only administrators can publish files');
		}

		return {
			entityType: 'user',
			entityId: actor.id,
			isPublic: false
		};
	}

	const authorizedEntityType = entityType ?? 'general';
	await assertAdminTargetExists(authorizedEntityType, entityId);

	return {
		entityType: authorizedEntityType,
		entityId,
		isPublic: input.isPublic === true
	};
}

export function canReadFile(actor: FileActor | null, file: FileWithUrl): boolean {
	if (file.isPublic) return true;
	if (!actor) return false;

	return (
		isAdmin(actor) ||
		file.uploadedBy === actor.id ||
		(file.entityType === 'user' && file.entityId === actor.id)
	);
}

export function canListFilesForEntity(
	actor: FileActor,
	entityType: FileEntityType,
	entityId: string
): boolean {
	return isAdmin(actor) || (entityType === 'user' && entityId === actor.id);
}

export function canManageFile(actor: FileActor, file: FileWithUrl): boolean {
	return isAdmin(actor) || file.uploadedBy === actor.id;
}

export function canChangeFileVisibility(actor: FileActor): boolean {
	return isAdmin(actor);
}

/**
 * Never expose bucket names, object paths, or uploader IDs through client APIs.
 */
export function toFileClientRecord(file: FileWithUrl, signedUrl?: string): FileClientRecord {
	return {
		id: file.id,
		filename: file.filename,
		originalFilename: file.originalFilename,
		mimeType: file.mimeType,
		fileSize: file.fileSize,
		entityType: file.entityType,
		entityId: file.entityId,
		isPublic: file.isPublic,
		metadata: file.metadata,
		createdAt: file.createdAt,
		updatedAt: file.updatedAt,
		publicUrl: file.publicUrl,
		...(signedUrl ? { signedUrl } : {})
	};
}
