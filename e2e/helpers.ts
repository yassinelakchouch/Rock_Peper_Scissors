import { expect, type Page } from '@playwright/test';

// The loading chant plays on every load: one key starts the count, a second skips to the arena, as a visitor would.
export async function passLoader(page: Page) {
  await page.keyboard.press('Space');
  await page.keyboard.press('Space');
  await expect(page.locator('.loader')).toHaveCount(0);
}

// The opening scenes (board R-06) play once per device: specs about the rest of the game mark them seen first.
export async function skipIntro(page: Page) {
  await page.addInitScript(() => localStorage.setItem('rps-project002:intro', 'seen'));
}

export async function openArena(page: Page, path = '/') {
  await skipIntro(page);
  await page.goto(path);
  await passLoader(page);
}
