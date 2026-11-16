import type { RequestHandler } from '@sveltejs/kit';
import { llmsTxtResponse } from '$lib/content/llms';

export const GET: RequestHandler = () => llmsTxtResponse();
