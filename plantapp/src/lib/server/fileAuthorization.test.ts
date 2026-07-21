import { describe, expect, it, vi } from 'vitest';
import {
	authorizeFileUpload,
	canListFilesForEntity,
	canManageFile,
	canReadFile,
	type FileActor
} from './fileAuthorization';
import type { FileWithUrl } from './services/file';

vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn()
	}
}));

const owner: FileActor = { id: 'owner', role: 'customer' };
const otherUser: FileActor = { id: 'other-user', role: 'customer' };
const admin: FileActor = { id: 'admin', role: 'admin' };

const privateOwnerFile = {
	id: '00000000-0000-4000-8000-000000000001',
	filename: 'private.pdf',
	originalFilename: 'private.pdf',
	mimeType: 'application/pdf',
	fileSize: 1,
	bucketPath: 'user/owner/private.pdf',
	bucketName: 'assets',
	entityType: 'user',
	entityId: owner.id,
	uploadedBy: owner.id,
	isPublic: false,
	metadata: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	publicUrl: ''
} satisfies FileWithUrl;

describe('file authorization matrix', () => {
	it('keeps anonymous users from private files while allowing owners and self-user listings', () => {
		expect(canReadFile(null, privateOwnerFile)).toBe(false);
		expect(canReadFile(owner, privateOwnerFile)).toBe(true);
		expect(canListFilesForEntity(owner, 'user', owner.id)).toBe(true);
		expect(canManageFile(owner, privateOwnerFile)).toBe(true);
	});

	it('denies cross-user file reads, listings, and mutations', () => {
		expect(canReadFile(otherUser, privateOwnerFile)).toBe(false);
		expect(canListFilesForEntity(otherUser, 'user', owner.id)).toBe(false);
		expect(canManageFile(otherUser, privateOwnerFile)).toBe(false);
	});

	it('allows administrators to manage every file and entity list', () => {
		expect(canReadFile(admin, privateOwnerFile)).toBe(true);
		expect(canListFilesForEntity(admin, 'product', '123')).toBe(true);
		expect(canManageFile(admin, privateOwnerFile)).toBe(true);
	});

	it('forces non-admin uploads to their own private user target and rejects public uploads', async () => {
		await expect(authorizeFileUpload(owner, {})).resolves.toEqual({
			entityType: 'user',
			entityId: owner.id,
			isPublic: false
		});

		await expect(
			authorizeFileUpload(owner, {
				entityType: 'user',
				entityId: owner.id,
				isPublic: true
			})
		).rejects.toMatchObject({ statusCode: 403 });
	});
});
