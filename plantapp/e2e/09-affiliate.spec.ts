import { test, expect, login } from './fixtures';

const password = 'aevani-local-uat-demo-2026-passphrase';

test('9. affiliate routes say the program is not open', async ({ page }) => {
	await page.goto('/affiliate');
	await expect(page).toHaveURL(/\/affiliate$/);
	await expect(
		page.getByRole('heading', { level: 1, name: 'The referral program is not open.' })
	).toBeVisible();
	const plantGeo = page.getByRole('link', { name: 'Plan a site on PlantGeo' });
	await expect(plantGeo).toHaveAttribute('href', 'https://plantgeo.aevani.com');
	await expect(plantGeo).not.toHaveAttribute('rel', /nofollow/i);
	await expect(page.locator('body')).not.toContainText(/cookie window/i);
	await expect(page.locator('body')).not.toContainText(/platform fee/i);

	await page.goto('/affiliate/join');
	await expect(page).toHaveURL(/\/affiliate\/join$/);
	await expect(
		page.getByRole('heading', { level: 1, name: 'The referral program is not open.' })
	).toBeVisible();

	await page.goto('/affiliate/terms');
	await expect(page).toHaveURL(/\/affiliate\/terms$/);
	await expect(
		page.getByRole('heading', { level: 1, name: 'The referral program is not open.' })
	).toBeVisible();
	await expect(page.locator('body')).not.toContainText(/cookie window/i);

	await login(page, 'admin@aevani.com', password, '/affiliate/dashboard');
	await page.goto('/affiliate/dashboard');
	await expect(page).toHaveURL(/\/affiliate\/dashboard/);
	await expect(page.getByRole('heading', { level: 1 })).toContainText(/Affiliate|Dashboard/i);
});
