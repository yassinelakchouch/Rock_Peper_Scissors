import { describe, expect, it } from 'vitest';
import { CHANT, CHANT_MS, FLY_MS, loaderMarkup } from './loader';

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
    const html = loaderMarkup(false);
    expect(html).toContain('aria-label="Start the game"');
    expect(html).toContain('class="loader-stage" aria-hidden="true"');
    expect(html.split('class="loader-fist"').length - 1).toBe(2);
    expect(html).toContain('Tap or press any key');
  });

  it('has a still version with the two rings and Play, and no fists', () => {
    const html = loaderMarkup(true);
    expect(html).toContain('data-still');
    expect(html.split('class="ring-svg"').length - 1).toBe(2);
    expect(html).toContain('>Play<');
    expect(html).not.toContain('loader-fist');
  });
});
