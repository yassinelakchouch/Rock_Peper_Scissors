import { expect, test } from '@playwright/test';

test('the page answers with its name', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/rps-project002/);
});

test('a shared link shows the card', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://yassinelakchouch.github.io/Rock_Peper_Scissors/og.jpg');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  const image = await request.get('/og.jpg');
  expect(image.status()).toBe(200);
  expect(image.headers()['content-type']).toContain('image/jpeg');
});

test('scrollbars are thin and dark, not the browser’s light default', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveCSS('scrollbar-width', 'thin');
  await expect(page.locator('html')).toHaveCSS('scrollbar-color', 'rgb(42, 45, 48) rgba(0, 0, 0, 0)');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
});
