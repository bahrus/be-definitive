import { test, expect } from '@playwright/test';
test('test4d', async ({ page }) => {
    await page.goto('./tests/ExampleIVd.html');
    // wait for 1 second
    await page.waitForTimeout(12000);
    const editor = page.locator('#target');
    await expect(editor).toHaveAttribute('mark', 'good');
});
