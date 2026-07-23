import { test, expect } from './fixtures';

const productPath = '/products/hydroponics/vertical-tower-garden-system';

test('5. checkout is unavailable by design and fails gracefully without a 500 screen', async ({
	page
}) => {
	// The cart is open again: `/checkout` redirects to the working cart page.
	await page.goto('/checkout');
	await expect(page).toHaveURL(/\/cart(?:\?|$)/);
	await expect(page.getByRole('heading', { level: 1, name: /Cart/i })).toBeVisible();

	// Put a real line in the cart so the checkout control is present. Wait for the
	// async add-to-cart mutation to persist before navigating.
	await page.goto(productPath);
	await page.waitForLoadState('networkidle');
	await Promise.all([
		page.waitForResponse(
			(res) => res.url().includes('/api/trpc/cart.addItem') && res.request().method() === 'POST'
		),
		page.getByRole('button', { name: /Add to cart/i }).click()
	]);
	await page.goto('/cart');

	const checkout = page.getByRole('button', { name: /Proceed to checkout/i });
	await expect(checkout).toBeVisible();
	await checkout.click();

	// POST /api/checkout returns a graceful 503; the page shows an unavailable
	// notice in place, never a redirect to a crashed 500 screen.
	await expect(page.getByText(/temporarily unavailable/i)).toBeVisible();
	await expect(page).toHaveURL(/\/cart(?:\?|$)/);
	await expect(page.getByRole('heading', { level: 1, name: /Cart/i })).toBeVisible();
	await expect(page.locator('body')).not.toContainText(/500|Internal Server Error/i);
});
