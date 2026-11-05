import { expect, type Page } from '@playwright/test';

// The loading chant plays on every load: one key starts the count, a second skips to the arena, as a visitor would.
export async function passLoader(page: Page) {
  await page.keyboard.press('Space');
  await page.keyboard.press('Space');
  await expect(page.locator('.loader')).toHaveCount(0);
}

export async function openArena(page: Page, path = '/') {
  await page.goto(path);
  await passLoader(page);
}
