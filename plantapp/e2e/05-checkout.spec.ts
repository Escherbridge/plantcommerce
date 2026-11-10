import { test, expect } from './fixtures';

const productPath = '/products/hydroponics/vertical-tower-garden-system';

test('5. placeholder products never reach checkout', async ({ page }) => {
	await page.goto('/checkout');
	await expect(page).toHaveURL(/\/cart(?:\?|$)/);
	await expect(page.getByRole('heading', { level: 1, name: /Cart/i })).toBeVisible();

	await page.goto(productPath);
	await page.waitForLoadState('networkidle');
	await expect(page.getByRole('button', { name: /Add to cart/i })).toHaveCount(0);
	await expect(page.getByText(/isn't available to purchase/i)).toBeVisible();

	await page.goto('/cart');
	await expect(page.getByRole('button', { name: /Proceed to checkout/i })).toHaveCount(0);
	await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
});
