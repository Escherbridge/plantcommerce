import { test, expect } from './fixtures';

test('10. learning center and LMS course catalogue expose seeded course content', async ({
	page
}) => {
	await page.goto('/learn');
	await expect(
		page.getByRole('heading', { level: 1, name: /Learning Center/i })
	).toBeVisible();
	await expect(page.getByRole('heading', { name: /Featured Guides/i })).toBeVisible();
	await expect(page.locator('body')).toContainText(/Guides|Courses|Resources|FAQ/i);

	await page.goto('/courses');
	await expect(page.getByRole('heading', { level: 1, name: 'Course Catalog' })).toBeVisible();
	const courseLinks = page.locator('a[href^="/courses/"]');
	await expect(courseLinks.first()).toBeVisible();
	expect(await courseLinks.count()).toBeGreaterThanOrEqual(4);
	for (const title of [
		'Hydroponics Field Guide',
		'Aquaponics From Scratch',
		'Silvopasture & Agroforestry Basics',
		'Seed Saving & Soil Health'
	]) {
		await expect(page.getByText(title, { exact: true })).toBeVisible();
	}
});
