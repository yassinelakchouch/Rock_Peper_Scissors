import { describe, expect, test } from 'vitest';
import { mostPlayed, rivalPick, wasRead } from './rival';
import type { Move } from './rules';

// A random source that returns the given values in turn.
const sequence = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('mostPlayed', () => {
  test('the move played most', () => expect(mostPlayed(['rock', 'paper', 'rock'])).toBe('rock'));
  test('a tie goes to the more recent move', () => expect(mostPlayed(['rock', 'paper'])).toBe('paper'));
});

describe('the rival', () => {
  test('with little history it plays at random', () => {
    expect(rivalPick([], sequence(0.1))).toEqual({ move: 'rock', reading: false });
    expect(rivalPick(['rock', 'rock'], sequence(0.0, 0.9))).toEqual({ move: 'rock', reading: false });
  });
  test('reading you, it counters your most played move of the last five', () =>
    expect(rivalPick(['paper', 'rock', 'rock', 'rock'], sequence(0.2))).toEqual({ move: 'paper', reading: true }));
  test('it only looks at your last five moves', () => {
    const history: Move[] = ['scissors', 'scissors', 'scissors', 'paper', 'paper', 'paper', 'rock', 'rock'];
    expect(rivalPick(history, sequence(0.2)).move).toBe('scissors');
  });
  test('otherwise it plays at random, spread over the three moves', () => {
    expect(rivalPick(['rock', 'rock', 'rock'], sequence(0.5, 0.1)).move).toBe('rock');
    expect(rivalPick(['rock', 'rock', 'rock'], sequence(0.5, 0.5)).move).toBe('paper');
    expect(rivalPick(['rock', 'rock', 'rock'], sequence(0.5, 0.9)).move).toBe('scissors');
  });
  test('over many rounds it reads you about 40 % of the time', () => {
    let reads = 0;
    for (let i = 0; i < 2000; i += 1) if (rivalPick(['rock', 'rock', 'rock'], Math.random).reading) reads += 1;
    expect(reads / 2000).toBeGreaterThan(0.35);
    expect(reads / 2000).toBeLessThan(0.45);
  });
});

describe('the rival read you', () => {
  const lost = { you: 'rock', rival: 'paper', outcome: 'lose' } as const;
  const won = { you: 'paper', rival: 'rock', outcome: 'win' } as const;
  test('three rounds lost to its read, in a row', () => expect(wasRead([won, lost, lost, lost], [false, true, true, true])).toBe(true));
  test('not when one of them was a random pick', () => expect(wasRead([lost, lost, lost], [true, false, true])).toBe(false));
  test('not with fewer than three rounds', () => expect(wasRead([lost, lost], [true, true])).toBe(false));
});
