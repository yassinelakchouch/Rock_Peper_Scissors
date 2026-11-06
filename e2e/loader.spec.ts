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

test('the count plays board R-04 frame by frame: one fist rises per beat, "tick", the stage tightens, "shoot!" opens two rings', async ({ page }) => {
  // A paused clock steps through the chant's timeline, so short frames are checked on slow machines too; it pauses 10 s in, past even a slow load.
  await page.clock.install({ time: new Date('2026-11-05T12:00:00') });
  await page.goto('/');
  await page.clock.pauseAt(new Date('2026-11-05T12:00:10'));
  await loader(page).click();
  const fists = page.locator('.loader-fists');
  await page.clock.runFor(10);
  await expect(fists).toHaveAttribute('data-beat', '1');
  await expect(page.locator('.loader-sub')).toHaveText('tick');
  await page.clock.runFor(620);
  await expect(fists).toHaveAttribute('data-beat', '0');
  await page.clock.runFor(530);
  await expect(page.locator('.loader')).toHaveClass(/loader-tight/);
  await page.clock.runFor(450);
  await expect(page.locator('.loader-word')).toHaveText('shoot!');
  const rings = page.locator('.loader-row .loader-ring');
  await expect(rings).toHaveCount(2);
  await expect(rings.first()).toBeVisible();
  await expect(rings.locator('.face[data-mood="idle"]')).toHaveCount(1);
  await expect(rings.locator('.face[data-mood="think"]')).toHaveCount(1);
  await page.clock.runFor(700);
  await expect(page.locator('#live')).toHaveText('Best of five against the rival. Pick rock, paper or scissors.');
});

test('the stage keeps the board’s proportions: at 1440 x 900 every size is twice the board’s', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the desktop proportion');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const size = await page.evaluate(() => ({
    fist: document.querySelector('.loader-fist')!.getBoundingClientRect().width,
    word: parseFloat(getComputedStyle(document.querySelector('.loader-word')!).fontSize),
  }));
  expect(size).toEqual({ fist: 168, word: 88 });
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

test('with reduced motion the count runs calm (board R-05 · #33): a fist lights up instead of rising, none flies, the rings fade in', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install({ time: new Date('2026-11-05T12:00:00') });
  await page.goto('/');
  await page.clock.pauseAt(new Date('2026-11-05T12:00:10'));
  await expect(page.locator('.loader')).toHaveClass(/loader-calm/);
  await expect(page.locator('.loader-fist')).toHaveCount(2);
  await loader(page).click();
  await page.clock.runFor(10);
  await expect(page.locator('.loader-word')).toHaveText('Rock…');
  const look = (side: string) =>
    page.locator(`.loader-fist[data-fist="${side}"]`).evaluate((fist) => ({ opacity: getComputedStyle(fist).opacity, transform: getComputedStyle(fist).transform }));
  await expect.poll(() => look('rival')).toEqual({ opacity: '1', transform: 'none' });
  await expect.poll(() => look('you')).toEqual({ opacity: '0.4', transform: 'none' });
  await page.clock.runFor(1600);
  await expect(page.locator('.loader-word')).toHaveText('shoot!');
  await expect(page.locator('.loader-flying')).toHaveCount(0);
  await expect(page.locator('.loader-row .loader-ring').first()).toBeVisible();
  await page.clock.runFor(700);
  await expect(page.locator('#live')).toHaveText('Best of five against the rival. Pick rock, paper or scissors.');
  await expect(page.locator('#keys')).not.toHaveClass(/keys-rise/);
});

test('before any stylesheet arrives, the first paint is the dark ground with no arena (#37)', async ({ page }) => {
  await page.route((url) => url.pathname.endsWith('/src/main.ts'), (route) => route.abort());
  await page.goto('/');
  const first = await page.evaluate(() => ({
    ground: getComputedStyle(document.documentElement).backgroundColor,
    arena: getComputedStyle(document.querySelector('body > div')!).visibility,
  }));
  expect(first).toEqual({ ground: 'rgb(11, 12, 13)', arena: 'hidden' });
});

