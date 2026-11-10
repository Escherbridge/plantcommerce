import { ServerResponse } from 'node:http';
import type { OutgoingHttpHeaders } from 'node:http';

/**
 * Root icons. mrmime drops both `image/x-icon` and `image/vnd.microsoft.icon`,
 * so sirv (dev, preview, and adapter-node) sends `Content-Type:` empty for
 * `.ico`. Browsers then refuse the favicon. SVG and PNG already resolve; they
 * are listed so an empty header on those paths is filled the same way.
 */
export const staticIconContentTypes: Readonly<Record<string, string>> = {
	'/favicon.ico': 'image/x-icon',
	'/favicon.svg': 'image/svg+xml',
	'/favicon-32x32.png': 'image/png',
	'/apple-touch-icon.png': 'image/png',
	'/icon-192.png': 'image/png'
};

function requestPath(url: string | undefined): string {
	if (!url) return '';
	const query = url.indexOf('?');
	return query === -1 ? url : url.slice(0, query);
}

export function fillEmptyIconContentType(
	url: string | undefined,
	headers: OutgoingHttpHeaders
): void {
	const type = staticIconContentTypes[requestPath(url)];
	if (!type) return;

	const key = 'Content-Type' in headers ? 'Content-Type' : 'content-type';
	const current = headers[key];
	if (typeof current === 'string' && current.length > 0) return;
	headers[key] = type;
}

function isHeaderRecord(value: unknown): value is OutgoingHttpHeaders {
	return !!value && typeof value === 'object' && !Array.isArray(value);
}

let installed = false;

/** sirv commits the MIME header in `writeHead`, after its lookup. */
export function installStaticIconContentTypes(): void {
	if (installed) return;
	installed = true;

	const original = ServerResponse.prototype.writeHead;
	function writeHead(this: ServerResponse, statusCode: number, ...rest: unknown[]) {
		const statusMessage = rest[0];
		const headers = rest[1];
		if (isHeaderRecord(statusMessage)) {
			fillEmptyIconContentType(this.req?.url, statusMessage);
		} else if (isHeaderRecord(headers)) {
			fillEmptyIconContentType(this.req?.url, headers);
		}
		return original.apply(this, [statusCode, ...rest] as Parameters<ServerResponse['writeHead']>);
	}
	ServerResponse.prototype.writeHead = writeHead as ServerResponse['writeHead'];
}
