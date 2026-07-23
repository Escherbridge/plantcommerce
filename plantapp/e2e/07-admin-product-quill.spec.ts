import { test, expect, login } from './fixtures';

const password = 'aevani-local-uat-demo-2026-passphrase';

test('7. admin creates an active product with Quill heading and bold formatting', async ({
	page
}) => {
	const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
	const productName = `Playwright QA Grow Kit ${unique}`;
	const slug = `playwright-qa-grow-kit-${unique}`;

	await login(page, 'admin@aevani.com', password, '/admin/products');
	await expect(page.getByRole('heading', { level: 1, name: /Products/i })).toBeVisible();
	await page.getByRole('link', { name: /Add Product/i }).click();
	await expect(page).toHaveURL(/\/admin\/products\/new$/);

	await page.locator('input[name="name"]').fill(productName);
	await page.locator('input[name="slug"]').fill(slug);
	await page.locator('input[name="sku"]').fill(`PW-${unique}`.toUpperCase());
	await page.locator('input[name="price"]').fill('29.95');
	await page.locator('select[name="categoryId"]').selectOption({ label: 'Hydroponics' });
	await page.locator('input[name="stockQuantity"]').fill('12');
	await page
		.locator('textarea[name="shortDescription"]')
		.fill('A browser-created test product for end-to-end QA.');
	await page.locator('textarea[name="keyFeatures"]').fill('Tool-free setup\nQA verified');
	await page.locator('textarea[name="inTheBox"]').fill('Grow tray\nQuick-start guide');
	await page
		.locator('textarea[name="stats"]')
		.fill('[{"value":"12","label":"Plant sites"}]');
	await page
		.locator('textarea[name="specs"]')
		.fill('[{"label":"Material","value":"Recycled polymer"}]');
	await page
		.locator('textarea[name="faqs"]')
		.fill('[{"q":"Is this a QA product?","a":"Yes, it was created through the admin UI."}]');

	const editor = page.locator('.rich-text-editor .ql-editor');
	await expect(editor).toBeVisible();
	await editor.click();
	const headerPicker = page.locator('.rich-text-editor .ql-picker.ql-header');
	await headerPicker.locator('.ql-picker-label').click();
	await headerPicker.locator('.ql-picker-item[data-value="2"]').click();
	await editor.pressSequentially('QA Rich Text Heading');
	await editor.press('Enter');
	await page.locator('.rich-text-editor button.ql-bold').click();
	await editor.pressSequentially('Bold browser-authored product copy.');
	await page.locator('.rich-text-editor button.ql-bold').click();
	await expect(editor.locator('h2')).toContainText('QA Rich Text Heading');
	await expect(editor.locator('strong')).toContainText('Bold browser-authored product copy.');

	await page.getByRole('button', { name: /Create Product/i }).click();
	await expect(page).toHaveURL(/\/admin\/products$/);
	await expect(page.getByText(productName, { exact: true })).toBeVisible();

	await page.goto(`/products/hydroponics/${slug}`);
	await expect(page.getByRole('heading', { level: 1, name: productName })).toBeVisible();
	const longRead = page.locator('.longread__body');
	await expect(longRead.locator('h2')).toContainText('QA Rich Text Heading');
	await expect(longRead.locator('strong')).toContainText('Bold browser-authored product copy.');
});
