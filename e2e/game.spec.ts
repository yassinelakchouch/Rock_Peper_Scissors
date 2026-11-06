import { expect, test, type Page } from '@playwright/test';
import { openArena, passLoader } from './helpers';

// A steady random source: the rival plays rock until it has three of your moves, then reads you every time.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.1;
  });
  await openArena(page);
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
  await expect(page.locator('#extra .hint')).toHaveText('● it guessed every round: nothing to read');
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
  await passLoader(page);
  await page.getByRole('button', { name: 'Stats' }).click();
  const sheet = page.getByRole('dialog', { name: 'Stats' });
  await expect(sheet).toContainText('Matches1');
  await expect(sheet).toContainText('Won1');
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
  await expect(page.getByRole('button', { name: 'Sound off' })).toBeVisible();
});

test('a round is read out in words, not symbols', async ({ page }) => {
  await playRound(page, 'p');
  await expect(page.locator('#live')).toHaveText('Paper covers rock. You score, you lead 1 to 0.');
});

test('screen readers hear match point, the match and each badge', async ({ page }) => {
  const live = page.locator('#live');
  for (let i = 0; i < 2; i += 1) await playRound(page, 'p');
  await expect(live).toHaveText(/^Paper covers rock\..* Match point\.$/);
  await playRound(page, 'p');
  await expect(live).toContainText('You won the match, 3 to 0.');
  await expect(live).toContainText('Badge earned: First match. Badge earned: Clean sweep.');
});

test('the Stats sheet names every badge and says which are earned', async ({ page }) => {
  for (let i = 0; i < 3; i += 1) await playRound(page, 'p');
  await page.getByRole('button', { name: 'Stats' }).click();
  const badges = page.getByRole('list', { name: 'Badges' }).getByRole('listitem');
  await expect(badges).toHaveCount(4);
  await expect(badges.filter({ hasText: 'First match' })).toContainText('Earned');
  await expect(badges.filter({ hasText: 'Clean sweep' })).toContainText('Earned');
  await expect(badges.filter({ hasText: 'Comeback' })).toContainText('Not yet');
});

test('on a phone nothing scrolls sideways and every key is at least 44 px', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone layout');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  for (const name of [/^Rock/, /^Paper/, /^Scissors/]) expect((await page.getByRole('button', { name }).boundingBox())!.height).toBeGreaterThanOrEqual(44);
});

test('after a match the rival says how it read you (board R-05 · #29)', async ({ page }) => {
  // Three draws while it guesses rock, then it reads your rock and plays paper three times.
  for (let i = 0; i < 6; i += 1) await playRound(page, 'r');
  await expect(line(page)).toHaveText('The rival won 3–0');
  await expect(page.locator('#extra .hint')).toHaveText('● it read you 3 times · you lean on rock, 5 of your last 5');
  await expect(page.locator('#live')).toContainText('It read you 3 times; you lean on rock, 5 of your last 5.');
});

test.describe('key names (#35)', () => {
  test('stay hidden until a key is pressed, then show on the keys', async ({ browser }) => {
    const page = await browser.newPage({ hasTouch: true });
    await page.goto('/');
    await page.locator('.loader').tap();
    await page.locator('.loader').tap();
    await expect(page.locator('.loader')).toHaveCount(0, { timeout: 3000 });
    await expect(page.locator('.key-hint').first()).toBeHidden();
    await expect(page.getByRole('button', { name: 'Rock (R or 1)' })).toBeVisible();
    await page.keyboard.press('Shift');
    await expect(page.locator('.key-hint').first()).toBeVisible();
    await page.close();
  });
});

test('a round won buzzes twice where phones can vibrate, and Sound off keeps it still (#30)', async ({ page }) => {
  await page.addInitScript(() => {
    const calls: number[][] = ((window as unknown as { buzzes: number[][] }).buzzes = []);
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: (pattern: number[]) => calls.push(pattern) > 0 });
  });
  await page.reload();
  await passLoader(page);
  const buzzes = () => page.evaluate(() => (window as unknown as { buzzes: number[][] }).buzzes);
  await playRound(page, 'p');
  await expect.poll(buzzes).toEqual([[40, 60, 40]]);
  await page.getByRole('button', { name: 'Sound on' }).click();
  await playRound(page, 'p');
  await page.waitForTimeout(400);
  expect(await buzzes()).toHaveLength(1);
});

test('best of 3 before round 1: two pips, three marks, two wins take it; the chips lock, and the choice is kept (#28)', async ({ page }) => {
  await page.getByRole('button', { name: 'Best of 3' }).click();
  await expect(page.getByRole('button', { name: 'Best of 3' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-side="you"] [data-pips] i')).toHaveCount(2);
  await expect(marks(page)).toHaveCount(3);
  await expect(page.locator('#sub')).toHaveText('first to two wins the match');
  await playRound(page, 'p');
  await expect(page.getByRole('button', { name: 'Best of 7' })).toBeDisabled();
  await playRound(page, 'p');
  await expect(line(page)).toHaveText('You won 2–0');
  await page.reload();
  await passLoader(page);
  await expect(page.getByRole('button', { name: 'Best of 3' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Best of 3' })).toBeEnabled();
});

