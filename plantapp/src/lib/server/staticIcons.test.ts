import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import sirv from 'sirv';
import { describe, expect, it } from 'vitest';
import {
	fillEmptyIconContentType,
	installStaticIconContentTypes,
	staticIconContentTypes
} from './staticIcons';

const root = new URL('../../../', import.meta.url);

describe('static icons', () => {
	it('keeps icon links root-absolute so nested routes do not resolve them relatively', async () => {
		const html = await readFile(new URL('./src/app.html', root), 'utf8');

		expect(html).toContain('href="/favicon.ico"');
		expect(html).toContain('href="/favicon.svg"');
		expect(html).toContain('href="/favicon-32x32.png"');
		expect(html).toContain('href="/apple-touch-icon.png"');
		expect(html).toContain('href="/site.webmanifest"');
		expect(html).not.toContain('%sveltekit.assets%/favicon');
		expect(html).not.toContain('%sveltekit.assets%/apple-touch-icon');
		expect(html).not.toContain('%sveltekit.assets%/site.webmanifest');
	});

	it('points the web manifest at the 192 mark', async () => {
		const manifest = JSON.parse(await readFile(new URL('./static/site.webmanifest', root), 'utf8'));

		expect(manifest.icons).toContainEqual({
			src: '/icon-192.png',
			sizes: '192x192',
			type: 'image/png'
		});
		const icon = await readFile(new URL('./static/icon-192.png', root));
		expect(
			icon.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
		).toBe(true);
	});

	it('ships a real ICO containing the 32px mark', async () => {
		const ico = await readFile(new URL('./static/favicon.ico', root));
		const png = await readFile(new URL('./static/favicon-32x32.png', root));

		expect(ico.readUInt16LE(0)).toBe(0);
		expect(ico.readUInt16LE(2)).toBe(1);
		expect(ico.readUInt16LE(4)).toBeGreaterThan(0);
		expect(ico.includes(png)).toBe(true);
	});

	it('fills only an empty icon content type', () => {
		const ico = { 'Content-Type': '' };
		fillEmptyIconContentType('/favicon.ico', ico);
		expect(ico['Content-Type']).toBe('image/x-icon');

		const svg = { 'Content-Type': 'image/svg+xml' };
		fillEmptyIconContentType('/favicon.svg?v=1', svg);
		expect(svg['Content-Type']).toBe('image/svg+xml');

		const png = { 'Content-Type': '' };
		fillEmptyIconContentType('/favicon-32x32.png', png);
		expect(png['Content-Type']).toBe(staticIconContentTypes['/favicon-32x32.png']);

		const other = { 'Content-Type': '' };
		fillEmptyIconContentType('/og-image.png', other);
		expect(other['Content-Type']).toBe('');
	});

	it('serves the static icons with their content types', async () => {
		installStaticIconContentTypes();
		const handler = sirv(fileURLToPath(new URL('./static/', root)), { etag: true });
		const server = http.createServer((req, res) => {
			handler(req, res);
		});
		server.listen(0, '127.0.0.1');
		await once(server, 'listening');
		const address = server.address();
		if (!address || typeof address === 'string') {
			throw new Error('expected the icon server to listen on a port');
		}

		try {
			const ico = await fetch(`http://127.0.0.1:${address.port}/favicon.ico`);
			const svg = await fetch(`http://127.0.0.1:${address.port}/favicon.svg`);
			const png = await fetch(`http://127.0.0.1:${address.port}/favicon-32x32.png`);
			const touch = await fetch(`http://127.0.0.1:${address.port}/apple-touch-icon.png`);
			const large = await fetch(`http://127.0.0.1:${address.port}/icon-192.png`);

			expect(ico.status).toBe(200);
			expect(ico.headers.get('content-type')).toBe('image/x-icon');
			expect(svg.headers.get('content-type')).toBe('image/svg+xml');
			expect(png.headers.get('content-type')).toBe('image/png');
			expect(touch.headers.get('content-type')).toBe('image/png');
			expect(large.headers.get('content-type')).toBe('image/png');

			await Promise.all([
				ico.arrayBuffer(),
				svg.arrayBuffer(),
				png.arrayBuffer(),
				touch.arrayBuffer(),
				large.arrayBuffer()
			]);
		} finally {
			server.closeAllConnections();
			server.close();
		}
	});

	it('installs the content-type fix for the dev server and the node server', async () => {
		const vite = await readFile(new URL('./vite.config.ts', root), 'utf8');
		const hooks = await readFile(new URL('./src/hooks.server.ts', root), 'utf8');

		expect(vite).toContain('installStaticIconContentTypes()');
		expect(hooks).toContain('installStaticIconContentTypes()');
	});
});
