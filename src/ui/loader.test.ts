import { describe, expect, it } from 'vitest';
import { CHANT, CHANT_MS, FLY_MS, loaderMarkup, stageUnit } from './loader';

describe('loader', () => {
  it('counts three beats, each quicker than the last, then shoots inside about 2.2 s', () => {
    expect(CHANT.map((step) => step.word)).toEqual(['Rock…', 'Paper…', 'Scissors…', 'shoot!']);
    const gaps = CHANT.slice(1).map((step, i) => step.at - CHANT[i].at);
    expect(gaps[1]).toBeLessThan(gaps[0]);
    expect(gaps[2]).toBeLessThan(gaps[1]);
    expect(CHANT.at(-1)!.at + FLY_MS).toBeLessThanOrEqual(CHANT_MS);
    expect(CHANT_MS).toBeGreaterThanOrEqual(2000);
    expect(CHANT_MS).toBeLessThanOrEqual(2400);
  });

  it('is one button named Start the game, its words hidden from screen readers', () => {
    const html = loaderMarkup();
    expect(html).toContain('aria-label="Start the game"');
    expect(html).toContain('class="loader-stage" aria-hidden="true"');
    expect(html.split('class="loader-fist"').length - 1).toBe(2);
    expect(html).toContain('Tap or press any key');
  });

  it('holds frame 05: the arena’s two rings with faces, the rival thinking with its question mark', () => {
    const html = loaderMarkup();
    expect(html.split('class="ring-box loader-ring"').length - 1).toBe(2);
    expect(html).toContain('data-mood="idle"');
    expect(html).toContain('data-mood="think"');
    expect(html).toContain('data-content="?"');
  });

  it('keeps the board’s 720 by 420 proportions on any screen', () => {
    expect(stageUnit(1440, 900)).toBe(2);
    expect(stageUnit(720, 420)).toBe(1);
    expect(stageUnit(390, 844)).toBeCloseTo(390 / 720);
  });
});
