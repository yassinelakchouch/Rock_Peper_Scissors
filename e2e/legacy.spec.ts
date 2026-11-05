import { expect, test } from '@playwright/test';

// The loading chant plays once a visit; these flows start where it hands over, at the arena.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('rps-project002:loaded', '1'));
});

test('the first version still plays at legacy/index.html, with every file found and no script error', async ({ page }) => {
  const problems: string[] = [];
  page.on('response', (r) => r.status() >= 400 && problems.push(`${r.status()} ${r.url()}`));
  page.on('pageerror', (e) => problems.push(e.message));
  await page.goto('/legacy/index.html');
  await expect(page).toHaveTitle(/Rock_Peper_Scissors/);
  await page.waitForLoadState('networkidle');
  expect(problems).toEqual([]);
});

test('the header links to the first version, on one line at phone width', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: 'First version' });
  await expect(link).toHaveAttribute('href', './legacy/index.html');
  const home = (await page.getByRole('link', { name: '← Yassine Lakchouch' }).boundingBox())!;
  const first = (await link.boundingBox())!;
  expect(Math.abs(first.y - home.y)).toBeLessThan(2);
  expect(first.height).toBeLessThan(20);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await link.click();
  await expect(page).toHaveURL(/legacy\/index\.html$/);
});

test('the header stays on one line on a 360 px phone', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  const home = (await page.getByRole('link', { name: '← Yassine Lakchouch' }).boundingBox())!;
  const first = (await page.getByRole('link', { name: 'First version' }).boundingBox())!;
  expect(Math.abs(first.y - home.y)).toBeLessThan(2);
  expect(first.x).toBeGreaterThan(home.x + home.width);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
