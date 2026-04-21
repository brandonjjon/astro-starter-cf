import { test, expect } from '@playwright/test';

test('home renders', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('404 renders', async ({ page }) => {
	const res = await page.goto('/does-not-exist');
	expect(res?.status()).toBe(404);
});
