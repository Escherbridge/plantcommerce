import { test, expect, expectImagesLoaded } from './fixtures';

test('1. home renders its hero, navigation, systems, products, images, and footer', async ({
	page
}) => {
	await page.goto('/');

	const heroHeadline = page.getByRole('heading', {
		level: 1,
		name: 'Grow something that outlasts the season.'
	});
	await expect(heroHeadline).toBeVisible();
	const headlineIsTopmost = await heroHeadline.evaluate((element) => {
		const rect = element.getBoundingClientRect();
		const topmost = document.elementFromPoint(
			rect.left + rect.width / 2,
			rect.top + rect.height / 2
		);
		return topmost === element || element.contains(topmost);
	});
	expect(headlineIsTopmost, 'hero headline must not be covered by the hero image').toBe(true);

	const header = page.locator('header').first();
	for (const linkName of ['Shop', 'Learn', 'Growing systems', 'About']) {
		await expect(header.getByRole('link', { name: linkName, exact: true })).toBeVisible();
	}

	const systems = page.locator('#systems .system-card');
	await expect(systems).toHaveCount(4);
	for (const system of ['Hydroponics', 'Aquaponics', 'Silvopasture', 'Agroforestry']) {
		await expect(page.locator('#systems').getByText(system, { exact: true })).toBeVisible();
	}

	const featured = page
		.locator('section')
		.filter({ has: page.getByRole('heading', { name: "What we're reaching for this season" }) });
	await expect(featured).toBeVisible();
	const productImages = featured.locator('a.pc img[src^="/assets/"][src$=".png"]');
	await expectImagesLoaded(page, productImages);

	const footer = page.locator('footer').first();
	await expect(footer).toBeVisible();
	await expect(footer).toContainText(/Aevani|Grow/i);
	const footerBackground = await footer.evaluate(
		(element) => getComputedStyle(element).backgroundColor
	);
	expect(footerBackground).not.toBe('rgba(0, 0, 0, 0)');

	await page.screenshot({ path: 'e2e/screenshots/home.png', fullPage: true });
});
