import { test, expect } from './fixtures';

const productPath = '/products/hydroponics/vertical-tower-garden-system';

test('4. placeholder products stay viewable and cannot be added to the cart', async ({ page }) => {
	await page.goto(productPath);
	await page.waitForLoadState('networkidle');

	await expect(page.getByRole('heading', { level: 1 })).toContainText(
		/Vertical Tower Garden System/i
	);
	await expect(page.getByText(/coming soon/i).first()).toBeVisible();
	await expect(page.getByRole('button', { name: /Add to cart/i })).toHaveCount(0);

	await page.goto('/cart');
	await expect(page.getByRole('heading', { level: 1 })).toContainText(/Cart/i);
	await expect(page.getByRole('button', { name: /Proceed to checkout/i })).toHaveCount(0);
});
