import { test, expect, login } from './fixtures';

const password = 'aevani-local-uat-demo-2026-passphrase';

test('9. public affiliate pages stay closed while join validates', async ({ page }) => {
	await page.goto('/affiliate');
	await expect(page).toHaveURL(/\/affiliate$/);
	await expect(
		page.getByRole('heading', { level: 1, name: 'The referral program is not open.' })
	).toBeVisible();
	const plantGeo = page.getByRole('link', { name: 'Plan a site on PlantGeo' });
	await expect(plantGeo).toHaveAttribute('href', 'https://plantgeo.aevani.com');
	await expect(page.locator('body')).not.toContainText(/cookie window/i);
	await expect(page.locator('body')).not.toContainText(/platform fee/i);

	await page.goto('/affiliate/terms');
	await expect(page).toHaveURL(/\/affiliate\/terms$/);
	await expect(
		page.getByRole('heading', { level: 1, name: 'The referral program is not open.' })
	).toBeVisible();

	await page.goto('/affiliate/join');
	await expect(page).toHaveURL(/\/affiliate\/join$/);
	await expect(
		page.getByRole('heading', { level: 1, name: 'Affiliate application' })
	).toBeVisible();
	await page.getByRole('button', { name: 'Submit application' }).click();
	await expect(page.getByRole('alert')).toBeVisible();
	await expect(page).toHaveURL(/\/affiliate\/join$/);

	await page.locator('#audience').fill('Garden readers');
	await page.locator('#promotionMethod').selectOption('website');
	await page.locator('#monthlyTraffic').selectOption('under-1000');
	await page.locator('#whyJoin').fill('I will share catalogue links with readers.');
	await page.locator('#agreeTerms').check();
	await page.getByRole('button', { name: 'Submit application' }).click();
	await expect(page).toHaveURL(/\/register\?redirect=%2Faffiliate%2Fjoin$/);
	await expect(page.getByRole('heading', { level: 1, name: 'Create an account' })).toBeVisible();
});

test('9b. affiliate dashboard is reachable for a signed-in admin', async ({ page }) => {
	await login(page, 'admin@aevani.com', password, '/affiliate/dashboard');
	await expect(page).toHaveURL(/\/affiliate\/dashboard/);
	await expect(page.getByRole('heading', { level: 1, name: 'Affiliate Dashboard' })).toBeVisible();
	await expect(page.locator('.platform-content')).not.toContainText(
		'The referral program is not open.'
	);
});
