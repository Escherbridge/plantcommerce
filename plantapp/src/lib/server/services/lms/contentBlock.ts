import { eq, and, asc, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as lmsTable from '$lib/server/db/lms-schema';
import type { LmsContentBlock } from '$lib/server/db/lms-schema';
import { randomUUID } from 'crypto';
import { z } from 'zod';

// Content block type-specific config schemas
const videoConfigSchema = z.object({
	videoUrl: z.string().optional(),
	duration: z.number().optional(),
	thumbnailUrl: z.string().optional(),
	captions: z.array(z.object({ language: z.string(), fileId: z.string() })).optional()
});

const textConfigSchema = z.object({
	format: z.enum(['html', 'markdown']).default('html')
});

const slidesConfigSchema = z.object({
	slideCount: z.number().optional()
});

const downloadConfigSchema = z.object({
	downloadCount: z.number().default(0)
});

const audioConfigSchema = z.object({
	duration: z.number().optional()
});

const embedConfigSchema = z.object({
	embedUrl: z.string(),
	provider: z.enum(['youtube', 'vimeo', 'codepen', 'other']).default('other'),
	width: z.number().optional(),
	height: z.number().optional()
});

const codeConfigSchema = z.object({
	language: z.string().default('javascript'),
	runnable: z.boolean().default(false)
});

const imageConfigSchema = z.object({
	caption: z.string().optional(),
	altText: z.string().optional()
});

const configSchemas: Record<string, z.ZodSchema> = {
	video: videoConfigSchema,
	text: textConfigSchema,
	slides: slidesConfigSchema,
	download: downloadConfigSchema,
	audio: audioConfigSchema,
	embed: embedConfigSchema,
	code: codeConfigSchema,
	image: imageConfigSchema
};

export interface CreateContentBlockParams {
	lessonId: string;
	type: 'video' | 'text' | 'slides' | 'download' | 'audio' | 'embed' | 'code' | 'image';
	title?: string;
	content?: string;
	fileId?: string;
	config?: Record<string, unknown>;
	isRequired?: boolean;
	completionThreshold?: number;
}

export interface UpdateContentBlockParams {
	type?: 'video' | 'text' | 'slides' | 'download' | 'audio' | 'embed' | 'code' | 'image';
	title?: string;
	content?: string;
	fileId?: string;
	config?: Record<string, unknown>;
	isRequired?: boolean;
	completionThreshold?: number;
}

export class ContentBlockService {
	static async createContentBlock(params: CreateContentBlockParams): Promise<LmsContentBlock> {
		// Verify lesson exists
		const lessonResult = await db
			.select()
			.from(lmsTable.lmsLesson)
			.where(eq(lmsTable.lmsLesson.id, params.lessonId))
			.limit(1);

		if (lessonResult.length === 0) {
			throw new Error('Lesson not found');
		}

		// Validate config against type-specific schema
		let validatedConfig: Record<string, unknown> | null = null;
		if (params.config) {
			validatedConfig = ContentBlockService.validateConfig(params.type, params.config);
		}

		// If fileId provided, verify file exists
		if (params.fileId) {
			const fileCheck = await db.execute(
				sql`SELECT 1 FROM file WHERE id = ${params.fileId} LIMIT 1`
			);

			const rows = (fileCheck as any).rows ?? fileCheck;
			if (!rows || rows.length === 0) {
				throw new Error('File not found');
			}
		}

		// Auto-assign sortOrder
		const maxOrder = await db
			.select({
				maxSort: sql<number>`coalesce(max(${lmsTable.lmsContentBlock.sortOrder}), -1)`
			})
			.from(lmsTable.lmsContentBlock)
			.where(eq(lmsTable.lmsContentBlock.lessonId, params.lessonId));

		const sortOrder = (maxOrder[0]?.maxSort ?? -1) + 1;

		const id = randomUUID();
		const now = new Date();

		const result = await db
			.insert(lmsTable.lmsContentBlock)
			.values({
				id,
				lessonId: params.lessonId,
				type: params.type,
				title: params.title || null,
				content: params.content || null,
				fileId: params.fileId || null,
				config: validatedConfig ? JSON.stringify(validatedConfig) : null,
				sortOrder,
				isRequired: params.isRequired ?? true,
				completionThreshold: params.completionThreshold ?? 100,
				createdAt: now,
				updatedAt: now
			})
			.returning();

		return result[0];
	}

	static async updateContentBlock(
		blockId: string,
		params: UpdateContentBlockParams
	): Promise<LmsContentBlock> {
		// Get current block to determine type for config validation
		const currentBlock = await db
			.select()
			.from(lmsTable.lmsContentBlock)
			.where(eq(lmsTable.lmsContentBlock.id, blockId))
			.limit(1);

		if (currentBlock.length === 0) {
			throw new Error('Content block not found');
		}

		// If type is changing or config is provided, re-validate config
		const effectiveType = params.type || currentBlock[0].type;
		let validatedConfig: Record<string, unknown> | undefined;
		if (params.config) {
			validatedConfig = ContentBlockService.validateConfig(effectiveType, params.config);
		}

		const updateData: Record<string, unknown> = { updatedAt: new Date() };
		if (params.type !== undefined) updateData.type = params.type;
		if (params.title !== undefined) updateData.title = params.title;
		if (params.content !== undefined) updateData.content = params.content;
		if (params.fileId !== undefined) updateData.fileId = params.fileId;
		if (validatedConfig !== undefined) updateData.config = JSON.stringify(validatedConfig);
		if (params.isRequired !== undefined) updateData.isRequired = params.isRequired;
		if (params.completionThreshold !== undefined)
			updateData.completionThreshold = params.completionThreshold;

		const result = await db
			.update(lmsTable.lmsContentBlock)
			.set(updateData)
			.where(eq(lmsTable.lmsContentBlock.id, blockId))
			.returning();

		return result[0];
	}

	static async deleteContentBlock(blockId: string): Promise<void> {
		// Get the block to know its lessonId and sortOrder
		const blockResult = await db
			.select()
			.from(lmsTable.lmsContentBlock)
			.where(eq(lmsTable.lmsContentBlock.id, blockId))
			.limit(1);

		if (blockResult.length === 0) {
			throw new Error('Content block not found');
		}

		const block = blockResult[0];

		// Delete block
		await db.delete(lmsTable.lmsContentBlock).where(eq(lmsTable.lmsContentBlock.id, blockId));

		// Reorder remaining blocks in lesson
		await db.execute(
			sql`UPDATE lms_content_block SET sort_order = sort_order - 1, updated_at = now() WHERE lesson_id = ${block.lessonId} AND sort_order > ${block.sortOrder}`
		);
	}

	static async getContentBlocksByLesson(lessonId: string): Promise<LmsContentBlock[]> {
		return db
			.select()
			.from(lmsTable.lmsContentBlock)
			.where(eq(lmsTable.lmsContentBlock.lessonId, lessonId))
			.orderBy(asc(lmsTable.lmsContentBlock.sortOrder));
	}

	static async reorderContentBlocks(lessonId: string, blockIds: string[]): Promise<void> {
		// Verify all blockIds belong to lessonId
		const blocks = await db
			.select()
			.from(lmsTable.lmsContentBlock)
			.where(eq(lmsTable.lmsContentBlock.lessonId, lessonId));

		const lessonBlockIds = new Set(blocks.map((b) => b.id));
		for (const id of blockIds) {
			if (!lessonBlockIds.has(id)) {
				throw new Error(`Content block ${id} does not belong to lesson ${lessonId}`);
			}
		}

		const now = new Date();
		for (let i = 0; i < blockIds.length; i++) {
			await db
				.update(lmsTable.lmsContentBlock)
				.set({ sortOrder: i, updatedAt: now })
				.where(eq(lmsTable.lmsContentBlock.id, blockIds[i]));
		}
	}

	static validateConfig(type: string, config: unknown): Record<string, unknown> {
		const schema = configSchemas[type];
		if (!schema) {
			throw new Error(`Unknown content block type: ${type}`);
		}

		const result = schema.safeParse(config);
		if (!result.success) {
			throw new Error(
				`Invalid config for type "${type}": ${result.error.issues.map((issue) => issue.message).join(', ')}`
			);
		}

		return result.data as Record<string, unknown>;
	}
}

export default ContentBlockService;
