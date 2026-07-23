import { test, expect, login } from './fixtures';

const password = 'aevani-local-uat-demo-2026-passphrase';

test('9. affiliate terms, join, and authorized dashboard routes render', async ({ page }) => {
	// `/affiliate` now funnels straight to the join flow.
	await page.goto('/affiliate');
	await expect(page).toHaveURL(/\/affiliate\/join$/);
	await expect(
		page.getByRole('heading', { level: 1, name: 'Grow With Aevani' })
	).toBeVisible();
	await expect(page.locator('body')).toContainText(/application|apply|program/i);

	// Terms still render (with the real tier + cookie details) when visited directly.
	await page.goto('/affiliate/terms');
	await expect(page).toHaveURL(/\/affiliate\/terms$/);
	await expect(page.getByRole('heading', { level: 1 })).toContainText(/Affiliate/i);
	await expect(page.locator('body')).toContainText(/up to 5%/i);
	await expect(page.locator('body')).toContainText(/60-day/i);

	await login(page, 'admin@aevani.com', password, '/affiliate/dashboard');
	await page.goto('/affiliate/dashboard');
	await expect(page).toHaveURL(/\/affiliate\/dashboard/);
	await expect(page.getByRole('heading', { level: 1 })).toContainText(/Affiliate|Dashboard/i);
});
