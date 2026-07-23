import { test as base, expect, type Page } from '@playwright/test';

type BrowserDiagnostics = {
	consoleErrors: string[];
	pageErrors: string[];
	brokenImages: string[];
};

async function findBrokenImages(page: Page): Promise<string[]> {
	return page
		.locator('img')
		.evaluateAll((images) =>
			images
				.filter((image) => {
					const element = image as HTMLImageElement;
					return element.complete && element.naturalWidth === 0;
				})
				.map((image) => (image as HTMLImageElement).currentSrc || (image as HTMLImageElement).src)
		)
		.catch(() => []);
}

export const test = base.extend<{ diagnostics: BrowserDiagnostics }>({
	diagnostics: [
		async ({ page }, use, testInfo) => {
			const diagnostics: BrowserDiagnostics = {
				consoleErrors: [],
				pageErrors: [],
				brokenImages: []
			};

			page.on('console', (message) => {
				if (message.type() === 'error') diagnostics.consoleErrors.push(message.text());
			});
			page.on('pageerror', (error) => diagnostics.pageErrors.push(error.message));
			page.on('response', (response) => {
				if (
					response.request().resourceType() === 'image' &&
					!response.ok() &&
					response.status() !== 304
				) {
					diagnostics.brokenImages.push(`${response.status()} ${response.url()}`);
				}
			});

			await use(diagnostics);

			diagnostics.brokenImages.push(...(await findBrokenImages(page)));
			if (
				diagnostics.consoleErrors.length ||
				diagnostics.pageErrors.length ||
				diagnostics.brokenImages.length
			) {
				console.log(
					`[browser-diagnostics] ${testInfo.titlePath.join(' > ')}\n${JSON.stringify(diagnostics, null, 2)}`
				);
			}
		},
		{ auto: true }
	]
});

export { expect };

export async function login(
	page: Page,
	email: string,
	password: string,
	redirectPath = '/account'
): Promise<void> {
	await page.goto(`/login?redirect=${encodeURIComponent(redirectPath)}`);
	await page.waitForLoadState('networkidle');
	await page.locator('input[name="usernameOrEmail"]').fill(email);
	await page.locator('input[name="password"]').fill(password);
	await page.getByRole('button', { name: /^sign in$/i }).click();
	await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
}

export async function expectImagesLoaded(
	page: Page,
	images: ReturnType<Page['locator']>
): Promise<void> {
	const count = await images.count();
	expect(count).toBeGreaterThan(0);
	for (let index = 0; index < count; index += 1) {
		await expect(images.nth(index)).toBeVisible();
		await expect
			.poll(() =>
				images.nth(index).evaluate((image) => {
					const element = image as HTMLImageElement;
					return element.complete && element.naturalWidth > 0;
				})
			)
			.toBe(true);
	}
}
