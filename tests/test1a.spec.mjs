import { test, expect } from '@playwright/test';
test('test1a', async ({ page }) => {
    await page.goto('./tests/ExampleIa.html');
    // wait for 1 second
    await page.waitForTimeout(12000);
    const editor = page.locator('#target');
    await expect(editor).toHaveAttribute('mark', 'good');
});
