import { expect, test, type Page } from '@playwright/test';

// A steady random source: the rival plays rock until it has three of your moves, then reads you every time.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.1;
  });
  await page.goto('/');
});

const line = (page: Page) => page.locator('#line');
const marks = (page: Page) => page.locator('#history li');
const playRound = async (page: Page, key: string) => {
  await page.keyboard.press(key);
  await expect(page.locator('#arena')).not.toHaveAttribute('data-phase', 'sealed', { timeout: 3000 });
};

test('a round by keyboard: paper beats the rival’s rock', async ({ page }) => {
  await playRound(page, 'p');
  await expect(line(page)).toHaveText('Paper covers rock');
  await expect(page.locator('#sub')).toHaveText('+1 · you lead 1–0');
  await expect(marks(page).first()).toHaveAttribute('data-state', 'win');
  await expect(page.locator('[data-side="you"] [data-pips] i.on')).toHaveCount(1);
});

test('tapping a key plays the same; the same move is a draw', async ({ page }) => {
  await page.getByRole('button', { name: /^Rock/ }).click();
  await expect(line(page)).toHaveText('Both rock', { timeout: 3000 });
  await expect(marks(page).first()).toHaveAttribute('data-state', 'draw');
});

test('while the rival is sealed, other picks are ignored', async ({ page }) => {
  await page.keyboard.press('p');
  await page.keyboard.press('s');
  await expect(page.locator('#arena')).toHaveAttribute('data-phase', 'revealed', { timeout: 3000 });
  await expect(marks(page).filter({ has: page.locator('[data-state]') })).toHaveCount(0);
  await expect(page.locator('#history li[data-state="win"]')).toHaveCount(1);
});

test('three wins take the match: the coin lands, the streak counts, Enter plays again', async ({ page }) => {
  for (let i = 0; i < 3; i += 1) await playRound(page, 'p');
  await expect(line(page)).toHaveText('You won 3–0');
  await expect(page.locator('[data-side="you"] [data-coin]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play again · Enter' })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Badge · First match' })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(line(page)).toHaveText('Pick your move');
  await expect(page.locator('#history li[data-state="win"]')).toHaveCount(0);
});

test('the rival learns: after three papers, it answers paper with scissors', async ({ page }) => {
  for (let i = 0; i < 3; i += 1) await playRound(page, 'p');
  await page.keyboard.press('Enter');
  await playRound(page, 'p');
  await expect(line(page)).toHaveText('Scissors cut paper');
});

test('stats and the sound setting survive a reload', async ({ page }) => {
  for (let i = 0; i < 3; i += 1) await playRound(page, 'p');
  await page.getByRole('button', { name: 'Sound on' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Stats' }).click();
  const sheet = page.getByRole('dialog', { name: 'Stats' });
  await expect(sheet).toContainText('Matches1');
  await expect(sheet).toContainText('Won1');
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
  await expect(page.getByRole('button', { name: 'Sound off' })).toBeVisible();
});

test('on a phone nothing scrolls sideways and every key is at least 44 px', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone layout');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  for (const name of [/^Rock/, /^Paper/, /^Scissors/]) expect((await page.getByRole('button', { name }).boundingBox())!.height).toBeGreaterThanOrEqual(44);
});
