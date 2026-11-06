import { expect, test, type Page } from '@playwright/test';
import { passLoader } from './helpers';

// Board R-06: after the loader, a first visit watches the arena act a round out, then plays. The rival plays rock (steady random source).
const bar = (page: Page) => page.locator('#intro');

test.use({ reducedMotion: 'no-preference' });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.1;
  });
  await page.goto('/');
  await passLoader(page);
});

test('a first visit plays four scenes after the loader, then hands over a clean arena', async ({ page }) => {
  await expect(bar(page)).toContainText('How to play · 1/4');
  await expect(page.locator('#extra')).toContainText('a click on a hand plays it');
  await expect(page.getByRole('button', { name: 'Rock (R or 1)' })).toBeFocused();
  await expect(bar(page)).toContainText('How to play · 3/4', { timeout: 6000 });
  await expect(page.locator('#line')).toHaveText('Paper covers rock');
  await expect(bar(page)).toBeHidden({ timeout: 6000 });
  await expect(page.locator('#line')).toHaveText('Pick your move');
  await expect(page.locator('[data-side="you"] [data-pips] i.on')).toHaveCount(0);
  await expect(page.locator('[data-side="you"] [data-coin]')).toBeHidden();
  await expect(page.locator('#how')).toHaveAttribute('data-ring', '');
});

test('Esc skips, and the scenes never play by themselves again on this device', async ({ page }) => {
  await expect(bar(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(bar(page)).toBeHidden();
  await expect(page.locator('#line')).toHaveText('Pick your move');
  await page.reload();
  await passLoader(page);
  await expect(page.locator('#line')).toHaveText('Pick your move');
  await expect(bar(page)).toBeHidden();
});

test('a hand played during the scenes plays a real round; the scenes count nothing', async ({ page }) => {
  await expect(bar(page)).toContainText('How to play · 2/4', { timeout: 4000 });
  await page.keyboard.press('p');
  await expect(bar(page)).toBeHidden();
  await expect(page.locator('#arena')).not.toHaveAttribute('data-phase', 'sealed', { timeout: 3000 });
  await expect(page.locator('#line')).toHaveText('Paper covers rock');
  await expect(page.locator('#sub')).toHaveText('+1 · you lead 1–0');
  await expect(page.locator('[data-side="you"] [data-pips] i.on')).toHaveCount(1);
});

test('How to play brings the scenes back; → steps on and Skip leaves', async ({ page }) => {
  await page.keyboard.press('Escape');
  await expect(bar(page)).toBeHidden();
  await page.getByRole('button', { name: 'How to play' }).click();
  await expect(bar(page)).toContainText('How to play · 1/4');
  await page.waitForTimeout(700);
  await page.keyboard.press('ArrowRight');
  await expect(bar(page)).toContainText('How to play · 2/4');
  await page.getByRole('button', { name: 'Skip · Esc' }).click();
  await expect(bar(page)).toBeHidden();
  await expect(page.locator('#line')).toHaveText('Pick your move');
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the same scenes play as stills, nothing drops or flips', async ({ page }) => {
    await expect(bar(page)).toContainText('How to play · 1/4');
    await expect(bar(page)).toContainText('How to play · 2/4', { timeout: 4000 });
    await expect(page.locator('#line')).toHaveText('Rival is picking…');
    await expect(page.locator('[data-side="you"] [data-badge]')).not.toHaveClass(/drop/);
  });
});
