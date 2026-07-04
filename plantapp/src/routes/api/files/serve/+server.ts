import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile } from 'fs/promises';
import { resolve, extname } from 'path';

const MIME_TYPES: Record<string, string> = {
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml'
};

export const GET: RequestHandler = async ({ url }) => {
	const path = url.searchParams.get('path');
	if (!path) {
		throw error(400, 'Missing path parameter');
	}

	// Security: only allow AI-MockAssets paths, no directory traversal
	if (path.includes('..') || !path.startsWith('AI-MockAssets/')) {
		throw error(403, 'Forbidden');
	}

	const ext = extname(path).toLowerCase();
	const mime = MIME_TYPES[ext];
	if (!mime) {
		throw error(400, 'Unsupported file type');
	}

	try {
		const filePath = resolve('src/lib/images', path);
		const data = await readFile(filePath);

		return new Response(data, {
			headers: {
				'Content-Type': mime,
				'Cache-Control': 'public, max-age=31536000, immutable'
			}
		});
	} catch {
		throw error(404, 'File not found');
	}
};
