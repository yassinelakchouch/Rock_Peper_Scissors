import { expect, test, type Page } from '@playwright/test';

const loader = (page: Page) => page.getByRole('button', { name: 'Start the game' });

// A stand-in AudioContext that writes down each tone, so a flow can hear the count.
async function listen(page: Page) {
  await page.addInitScript(() => {
    const tones: number[] = ((window as unknown as { tones: number[] }).tones = []);
    const param = () => ({ setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} });
    class Fake {
      state = 'running';
      currentTime = 0;
      destination = {};
      resume() {}
      createGain() {
        return { gain: param(), connect: (to: unknown) => to };
      }
      createOscillator() {
        return { type: '', frequency: { ...param(), setValueAtTime: (f: number) => tones.push(f) }, connect: (to: unknown) => to, start() {}, stop() {} };
      }
    }
    (window as unknown as { AudioContext: unknown }).AudioContext = Fake;
  });
}

test('every load waits for a tap, counts three beats with rising ticks, then opens the arena; a reload plays it again', async ({ page }) => {
  await listen(page);
  await page.goto('/');
  await expect(loader(page)).toBeVisible();
  await expect(page.locator('#arena')).toBeHidden();
  await loader(page).click();
  await expect(page.locator('.loader-word')).toHaveText('Rock…');
  await expect(loader(page)).toHaveCount(0, { timeout: 6000 });
  await expect(page.locator('#arena')).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { tones: number[] }).tones.slice(0, 4))).toEqual([330, 392, 494, 300]);
  await page.reload();
  await expect(loader(page)).toBeVisible();
});

test('the fists take turns on each beat, close in on the last, and "shoot!" opens two rings with faces (board R-04)', async ({ page }) => {
  await page.goto('/');
  await loader(page).click();
  const fists = page.locator('.loader-fists');
  await expect(fists).toHaveAttribute('data-beat', '0');
  await expect(fists).toHaveAttribute('data-beat', '1');
  await expect(fists).toHaveClass(/tight/);
  await expect(page.locator('.loader-word')).toHaveText('shoot!');
  const rings = page.locator('.loader-row .loader-ring');
  await expect(rings).toHaveCount(2);
  await expect(rings.first()).toBeVisible();
  await expect(rings.locator('.face[data-mood="idle"]')).toHaveCount(1);
  await expect(rings.locator('.face[data-mood="think"]')).toHaveCount(1);
});

test('a key starts the count, any key during it skips to the arena, and the first move key gets the focus', async ({ page, isMobile }) => {
  test.skip(isMobile, 'a keyboard flow');
  await page.goto('/');
  // No focus ring on arrival: keys are caught on the window, and Tab reaches the loader, the only control while the arena is hidden.
  await page.keyboard.press('Tab');
  await expect(loader(page)).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.locator('.loader-word')).toHaveText('Rock…');
  await page.keyboard.press('r');
  await expect(loader(page)).toHaveCount(0, { timeout: 700 });
  await expect(page.getByRole('button', { name: 'Rock (R or 1)' })).toBeFocused();
  // The key that skipped is not a move: after a full round's reveal time, your badge is still empty.
  await page.waitForTimeout(900);
  await expect(page.locator('#arena [data-side="you"] [data-badge]')).toBeEmpty();
});

test('with reduced motion it is still: the title, two rings and Play, and one press opens the arena', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.loader[data-still]')).toBeVisible();
  await expect(page.locator('.loader .ring-svg')).toHaveCount(2);
  await expect(page.locator('.loader-fist')).toHaveCount(0);
  await loader(page).click();
  await expect(loader(page)).toHaveCount(0, { timeout: 700 });
  await expect(page.locator('#arena')).toBeVisible();
});
