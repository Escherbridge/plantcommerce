import { test, expect, expectImagesLoaded } from './fixtures';

test('2. shop renders the seeded catalogue, featured tiles, filtering, and category landing', async ({
	page
}) => {
	await page.goto('/products');
	await expect(
		page.getByRole('heading', { level: 1, name: 'Every tool here earned its place.' })
	).toBeVisible();

	const featured = page.locator('section[aria-label="Featured products"]');
	await expect(featured).toBeVisible();
	await expect(featured.locator('a.pc--featured')).toHaveCount(3);

	const productGrid = page.locator('section[aria-label="Products"] .product-grid');
	const cards = productGrid.locator('a.pc--standard');
	await expect(cards.first()).toBeVisible();
	// The seeded catalogue owns the exact count; assert a full grid renders with a
	// valid price on every card rather than pinning a brittle exact number.
	const cardCount = await cards.count();
	expect(cardCount).toBeGreaterThan(0);
	const prices = await cards.locator('.pc__price').allInnerTexts();
	expect(prices).toHaveLength(cardCount);
	expect(prices.every((price) => /\$\d/.test(price))).toBe(true);
	await expectImagesLoaded(page, cards.locator('img.pc__img').first());
	await page.screenshot({ path: 'e2e/screenshots/shop.png', fullPage: true });

	await page.getByRole('button', { name: 'Hydroponics', exact: true }).click();
	await expect(page).toHaveURL(/[?&]category=hydroponics(?:&|$)/);
	const filteredCards = productGrid.locator('a.pc--standard');
	await expect(filteredCards.first()).toBeVisible();
	const filteredCount = await filteredCards.count();
	expect(filteredCount).toBeGreaterThan(0);
	expect(filteredCount).toBeLessThan(cardCount);
	for (let index = 0; index < filteredCount; index += 1) {
		await expect(filteredCards.nth(index)).toHaveAttribute(
			'href',
			/^\/products\/hydroponics\//
		);
	}

	await page.goto('/products/hydroponics');
	await expect(page.getByRole('heading', { level: 1, name: 'Hydroponics' })).toBeVisible();
	const landingCards = page.locator('.product-grid a.pc');
	await expect(landingCards.first()).toBeVisible();
	expect(await landingCards.count()).toBeGreaterThan(0);
});
