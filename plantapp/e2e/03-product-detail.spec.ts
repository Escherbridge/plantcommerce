import { test, expect, expectImagesLoaded } from './fixtures';

const productPath = '/products/hydroponics/vertical-tower-garden-system';

test('3. product detail renders commerce data, rich content, FAQ, and reviews', async ({ page }) => {
	await page.goto(productPath);

	await expect(
		page.getByRole('heading', { level: 1, name: /Vertical Tower Garden System/i })
	).toBeVisible();
	await expect(page.locator('.pdp-hero__gallery img').first()).toHaveAttribute(
		'src',
		/^\/assets\/.*\.png(?:\?.*)?$/
	);
	await expectImagesLoaded(page, page.locator('.pdp-hero__gallery img').first());
	await expect(page.locator('.pdp-hero').getByText('$349.99', { exact: true })).toBeVisible();
	await page.screenshot({ path: 'e2e/screenshots/product.png', fullPage: true });

	for (const sectionLabel of ['By the numbers', 'Specifications', 'In the box']) {
		await expect(page.getByText(sectionLabel, { exact: true })).toBeVisible();
	}
	// Specs render as label/value rows (a glass card), not a <table>.
	const specsSection = page.locator('section').filter({ hasText: 'Specifications' }).first();
	const specRow = specsSection.locator('.specs__row').first();
	await expect(specRow).toBeVisible();
	await expect(specRow.locator('.specs__label')).not.toBeEmpty();
	await expect(specRow.locator('.specs__value')).not.toBeEmpty();
	await expect(page.locator('section').filter({ hasText: 'In the box' }).first()).toContainText(
		/\S+/
	);

	const faq = page.locator('details.faq__item').nth(1);
	await expect(faq).toBeVisible();
	const faqAnswer = faq.locator('.faq__a');
	await expect(faq).not.toHaveAttribute('open', '');
	await faq.locator('summary').click();
	await expect(faq).toHaveAttribute('open', '');
	await expect(faqAnswer).toBeVisible();
	await expect(faqAnswer).not.toBeEmpty();

	const reviews = page.locator('section').filter({ has: page.locator('.reviews__summary') });
	await expect(reviews).toBeVisible();
	await expect(reviews.locator('.reviews__list .review').first()).toBeVisible();
	await expect(reviews.locator('[aria-label$="out of 5"]').first()).toBeVisible();

	const longRead = page.locator('.longread__body');
	await expect(longRead).toBeVisible();
	await expect(longRead.locator('p').first()).toBeVisible();
	await expect(longRead.getByRole('heading', { name: 'Why grow vertically' })).toBeVisible();
	await expect(longRead.locator('strong').first()).toBeVisible();
	const rawText = await longRead.innerText();
	expect(rawText).not.toContain('<p>');
	expect(rawText).not.toContain('&lt;');

});
