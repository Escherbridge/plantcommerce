import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	fullyParallel: false,
	workers: 1,
	timeout: 45_000,
	expect: {
		timeout: 10_000
	},
	reporter: [['list']],
	use: {
		baseURL: 'http://localhost:5173',
		headless: true,
		viewport: { width: 1440, height: 1000 },
		actionTimeout: 10_000,
		navigationTimeout: 20_000,
		screenshot: 'off',
		trace: 'off',
		video: 'off'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});
