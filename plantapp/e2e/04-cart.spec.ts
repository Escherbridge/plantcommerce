import { test, expect } from './fixtures';

const productPath = '/products/hydroponics/vertical-tower-garden-system';

test('4. adding a product produces a real cart line and supports quantity changes', async ({
	page
}) => {
	await page.goto(productPath);
	await page.waitForLoadState('networkidle');
	const addButton = page.getByRole('button', { name: /Add to cart/i });
	await expect(addButton).toBeVisible();
	await expect(addButton).toBeEnabled();
	// Add-to-cart is an async tRPC mutation; wait for it to persist server-side
	// before navigating so the SSR cart load actually sees the new line.
	await Promise.all([
		page.waitForResponse(
			(res) => res.url().includes('/api/trpc/cart.addItem') && res.request().method() === 'POST'
		),
		addButton.click()
	]);

	await page.goto('/cart');
	await expect(page.getByRole('heading', { level: 1 })).toContainText(/Cart/i);
	const cartLine = page
		.locator('[data-cart-item]')
		.filter({ hasText: /Vertical Tower Garden System/i })
		.first();
	await expect(cartLine).toBeVisible();
	await expect(cartLine).toContainText('$349.99');

	const quantity = cartLine.locator('[data-cart-qty]');
	await expect(quantity).toHaveText('1');
	const increase = cartLine.getByRole('button', { name: /Increase quantity/i });
	await expect(increase).toBeVisible();
	await increase.click();
	await expect(quantity).toHaveText('2');
	await expect(cartLine).toContainText('$699.98');
});
