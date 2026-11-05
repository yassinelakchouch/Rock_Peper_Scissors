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
