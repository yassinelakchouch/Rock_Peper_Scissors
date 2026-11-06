import { describe, expect, test, vi } from 'vitest';
import { BUZZ, buzz } from './buzz';

describe('the buzz', () => {
  test('a win is two short, a loss one long, a draw one short, the match longer than any round', () => {
    expect(BUZZ.win).toEqual([40, 60, 40]);
    expect(BUZZ.lose).toEqual([160]);
    expect(BUZZ.draw).toEqual([30]);
    const total = (pattern: readonly number[]) => pattern.reduce((sum, ms) => sum + ms, 0);
    expect(total(BUZZ.match)).toBeGreaterThan(Math.max(total(BUZZ.win), total(BUZZ.lose), total(BUZZ.draw)));
  });

  test('plays its pattern only when allowed, and does nothing where phones cannot vibrate', () => {
    const vibrate = vi.fn(() => true);
    buzz('win', true, vibrate);
    buzz('lose', false, vibrate);
    expect(vibrate).toHaveBeenCalledTimes(1);
    expect(vibrate).toHaveBeenCalledWith([40, 60, 40]);
    expect(() => buzz('draw', true, undefined)).not.toThrow();
  });
});
