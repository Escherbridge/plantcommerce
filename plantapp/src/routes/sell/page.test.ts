import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isRedirect } from '@sveltejs/kit';
import { render } from 'svelte/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/sellerApplication/service', () => ({
	SellerApplicationService: {
		hasRecentDuplicate: vi.fn(),
		create: vi.fn()
	}
}));

import {
	SELLER_APPLICATION_DUPLICATE_WINDOW_MS,
	resetSellerApplicationLimits
} from '$lib/server/sellerApplication/intake';
import { SellerApplicationService } from '$lib/server/sellerApplication/service';
import SellPage from './+page.svelte';
import { actions, load } from './+page.server';
import { applySellEnhanceResult, SELL_TRANSPORT_ERROR, sellDraftFromFormData } from './enhance';

const pageSource = readFileSync(
	join(dirname(fileURLToPath(import.meta.url)), '+page.svelte'),
	'utf8'
);

const valid = {
	name: 'Ada Grower',
	email: 'Ada@Example.com',
	businessName: 'North Bed Farm',
	websiteOrSocial: 'https://example.com/ada',
	offerings: 'Salad greens and herb starts',
	location: 'Hudson Valley, NY',
	message: 'I would like to sell seasonal starts.'
};

function post(fields: Record<string, string>, ip = '203.0.113.10') {
	return {
		request: new Request('https://aevani.com/sell', {
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				origin: 'https://aevani.com'
			},
			body: new URLSearchParams(fields)
		}),
		getClientAddress: () => ip
	};
}

function tag(html: string, id: string): string {
	return html.match(new RegExp(`<(?:input|textarea)\\b[^>]*\\bid="${id}"[^>]*>`))?.[0] ?? '';
}

async function confirmation(fields: Record<string, string>, ip?: string): Promise<string> {
	try {
		await actions.default(post(fields, ip) as never);
	} catch (error) {
		expect(isRedirect(error)).toBe(true);
		if (!isRedirect(error)) return '';
		expect(error.status).toBe(303);
		return error.location;
	}
	expect.fail('expected a redirect');
	return '';
}

describe('seller application page', () => {
	beforeEach(() => {
		resetSellerApplicationLimits();
		vi.mocked(SellerApplicationService.hasRecentDuplicate).mockReset();
		vi.mocked(SellerApplicationService.create).mockReset();
		vi.mocked(SellerApplicationService.hasRecentDuplicate).mockResolvedValue(false);
		vi.mocked(SellerApplicationService.create).mockImplementation(async (input) => ({
			...input,
			id: 1
		}));
	});

	it('renders the 400 summary, field links, and textarea aria wiring', async () => {
		const result = await actions.default(
			post({ ...valid, offerings: '   ', message: '' }) as never
		);

		expect(result).toMatchObject({ status: 400 });
		if (!result || typeof result !== 'object' || !('data' in result)) {
			throw new Error('expected a 400 failure');
		}
		expect(result.data).toMatchObject({
			fieldErrors: {
				offerings: 'Tell us what you grow or make.',
				message: 'Add a short message.'
			}
		});
		expect(SellerApplicationService.create).not.toHaveBeenCalled();
		expect(SellerApplicationService.hasRecentDuplicate).not.toHaveBeenCalled();

		const rendered = render(SellPage, {
			props: {
				data: { applied: false, user: null, session: null, commerceMode: 'database' },
				form: result.data
			}
		});
		const body = rendered.body;
		expect(rendered.head.match(/<title\b[^>]*>[\s\S]*?<\/title>/g)).toEqual([
			'<title>Sell on Aevani — a flat 8%</title>'
		]);

		const summaryAt = body.indexOf(
			"Your application didn't go through. Fix these and send it again:"
		);
		const headingAt = body.indexOf('>Application<');
		expect(summaryAt).toBeGreaterThan(-1);
		expect(summaryAt).toBeLessThan(headingAt);
		expect(body).not.toContain('Check the highlighted fields and try again.');

		expect(body.indexOf('href="#offerings"')).toBeGreaterThan(summaryAt);
		expect(body.indexOf('href="#offerings"')).toBeLessThan(body.indexOf('href="#message"'));
		expect(body).toContain('What you grow or make: Tell us what you grow or make.');
		expect(body).toContain('Message: Add a short message.');
		expect(body).toContain('id="offerings-error"');
		expect(body).toContain('id="message-error"');

		const summary = body.match(/<div\b[^>]*\bid="application-error-summary"[^>]*>/)?.[0] ?? '';
		expect(summary).toContain('tabindex="-1"');
		expect(summary).toContain('autofocus');
		expect(summary).toContain('role="alert"');

		for (const [id, errorId] of [
			['offerings', 'offerings-error'],
			['message', 'message-error']
		] as const) {
			const field = tag(body, id);
			expect(field).toContain('aria-invalid="true"');
			expect(field).toContain(`aria-describedby="${errorId}"`);
		}

		const name = tag(body, 'name');
		expect(name).not.toContain('aria-invalid');
		expect(name).toContain('value="Ada Grower"');
		expect(body).toContain('>Submit application<');
		expect(body).not.toMatch(/<button\b[^>]*\bdisabled\b/);
		expect(body).toContain('method="POST"');
	});

	it('returns 303 to the focused confirmation after a save', async () => {
		await expect(confirmation(valid)).resolves.toBe('/sell?applied=1');
		expect(SellerApplicationService.create).toHaveBeenCalledTimes(1);
		expect(SellerApplicationService.create).toHaveBeenCalledWith(
			expect.objectContaining({
				email: 'ada@example.com',
				businessName: 'North Bed Farm',
				offerings: 'Salad greens and herb starts'
			})
		);

		expect(await load({ url: new URL('https://aevani.com/sell?applied=1') } as never)).toEqual({
			applied: true
		});
		expect(await load({ url: new URL('https://aevani.com/sell') } as never)).toEqual({
			applied: false
		});

		const body = render(SellPage, {
			props: {
				data: { applied: true, user: null, session: null, commerceMode: 'database' },
				form: null
			}
		}).body;
		expect(body).toContain('Application received');
		const panel = body.match(/<div\b[^>]*\bid="application-received"[^>]*>/)?.[0] ?? '';
		expect(panel).toContain('role="status"');
		expect(panel).toContain('tabindex="-1"');
		expect(panel).toContain('autofocus');
		expect(body).not.toContain('Submit application');
	});

	it('counts the same email and business name within 10 minutes as one application', async () => {
		vi.mocked(SellerApplicationService.hasRecentDuplicate).mockResolvedValue(true);
		const before = Date.now();
		await expect(confirmation(valid, '203.0.113.20')).resolves.toBe('/sell?applied=1');
		const after = Date.now();

		expect(SellerApplicationService.create).not.toHaveBeenCalled();
		expect(SellerApplicationService.hasRecentDuplicate).toHaveBeenCalledTimes(1);
		const [email, businessName, since] = vi.mocked(SellerApplicationService.hasRecentDuplicate).mock
			.calls[0];
		expect(email).toBe('ada@example.com');
		expect(businessName).toBe('North Bed Farm');
		expect(since).toBeInstanceOf(Date);
		expect(since.getTime()).toBeGreaterThanOrEqual(before - SELLER_APPLICATION_DUPLICATE_WINDOW_MS);
		expect(since.getTime()).toBeLessThanOrEqual(after - SELLER_APPLICATION_DUPLICATE_WINDOW_MS);
	});

	it('keeps the no-JS post and only changes the button label while enhance is sending', () => {
		expect(pageSource).toContain('use:enhance={submitApplication}');
		expect(pageSource).toContain('method="POST"');
		expect(pageSource).toContain('Sending your application…');
		expect(pageSource).toContain('Submit application');
		expect(pageSource).toContain('disabled={submitting}');
	});

	it('keeps the form when enhance gets an error result instead of opening the error page', async () => {
		const update = vi.fn(async () => {});
		await expect(applySellEnhanceResult({ type: 'error' }, update)).resolves.toBe('kept');
		expect(update).not.toHaveBeenCalled();

		await expect(applySellEnhanceResult({ type: 'failure' }, update)).resolves.toBe('applied');
		await expect(applySellEnhanceResult({ type: 'redirect' }, update)).resolves.toBe('applied');
		expect(update).toHaveBeenCalledTimes(2);

		const callback = pageSource.slice(pageSource.indexOf('const submitApplication'));
		expect(callback).toContain('applySellEnhanceResult(result, () => update())');
		expect(callback.indexOf("outcome === 'kept'")).toBeLessThan(
			callback.indexOf('keptDraft = null')
		);
		expect(callback).toContain('transportError = true');
		expect(callback).toContain('controller.signal.addEventListener');
		expect(callback).toContain("'abort'");
		expect(pageSource).toContain('role="alert"');
		expect(pageSource).toContain('{SELL_TRANSPORT_ERROR}');
		expect(SELL_TRANSPORT_ERROR).toBe("That didn't send. Check your connection and try again.");

		const open = render(SellPage, {
			props: {
				data: { applied: false, user: null, session: null, commerceMode: 'database' },
				form: null
			}
		}).body;
		expect(open).not.toContain(SELL_TRANSPORT_ERROR);
		expect(open).not.toContain('This page did not load');
		expect(open).toContain('Submit application');

		const entered = new FormData();
		entered.set('name', 'Ada Grower');
		entered.set('email', 'ada@example.com');
		entered.set('businessName', 'North Bed Farm');
		entered.set('websiteOrSocial', '');
		entered.set('offerings', 'Herb starts');
		entered.set('location', 'Hudson Valley, NY');
		entered.set('message', 'Seasonal starts');
		entered.set('company_fax', 'ignore me');
		expect(sellDraftFromFormData(entered)).toEqual({
			name: 'Ada Grower',
			email: 'ada@example.com',
			businessName: 'North Bed Farm',
			websiteOrSocial: '',
			offerings: 'Herb starts',
			location: 'Hudson Valley, NY',
			message: 'Seasonal starts'
		});
	});
});
