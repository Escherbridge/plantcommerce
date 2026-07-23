import { test, expect, login } from './fixtures';

const password = 'aevani-local-uat-demo-2026-passphrase';

test('8. customer orders and wishlist render in the authenticated account', async ({ page }) => {
	await login(page, 'sarah@example.com', password, '/account/orders');
	await expect(page).toHaveURL(/\/account\/orders/);
	await expect(page.getByRole('heading', { level: 1, name: /Orders/i })).toBeVisible();
	// Seed data owns the exact count; assert the account renders at least one
	// real order rather than pinning a brittle exact number.
	const orderHeadings = page.getByRole('heading', { level: 3, name: /^Order #/ });
	await expect(orderHeadings.first()).toBeVisible();
	expect(await orderHeadings.count()).toBeGreaterThanOrEqual(1);
	await expect(page.locator('body')).toContainText(/Shipped|Delivered/i);

	await page.goto('/account/wishlist');
	await expect(page).toHaveURL(/\/account\/wishlist/);
	await expect(
		page.getByRole('heading', { level: 1, name: 'Wishlist unavailable' })
	).toBeVisible();
	await expect(page.locator('body')).toContainText(/Saved product details.*unavailable/i);
});
