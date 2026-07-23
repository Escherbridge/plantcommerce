import { test, expect, login } from './fixtures';

const password = 'aevani-local-uat-demo-2026-passphrase';

test('6. registration gives a success outcome and admin login establishes a session', async ({
	page
}) => {
	const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	const email = `qa-${unique}@example.com`;

	await page.goto('/register');
	await page.locator('input[name="firstName"]').fill('Playwright');
	await page.locator('input[name="lastName"]').fill('QA');
	await page.locator('input[name="username"]').fill(`qa_${unique}`.replace(/-/g, '_'));
	await page.locator('input[name="email"]').fill(email);
	await page.locator('input[name="password"]').fill(password);
	await page.locator('input[name="confirmPassword"]').fill(password);
	await page.getByRole('button', { name: /Create account|Register|Sign up/i }).click();

	await expect
		.poll(async () => `${page.url()}\n${await page.locator('body').innerText()}`)
		.toMatch(/verify-email|verification|check your email|account created|sign in/i);

	await page.context().clearCookies();
	await login(page, 'admin@aevani.com', password, '/admin');
	await expect(page).toHaveURL(/\/admin(?:\/|\?|$)/);
	await expect(
		page
			.getByRole('link', { name: /Account|Admin|Dashboard|Products/i })
			.or(page.getByRole('button', { name: /Account|Profile|Admin/i }))
			.first()
	).toBeVisible();
});
