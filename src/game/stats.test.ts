import { describe, expect, test } from 'vitest';
import type { Match, Round } from './match';
import { afterMatch, afterRound, EMPTY_STATS, wasComeback } from './stats';

const win: Round = { you: 'paper', rival: 'rock', outcome: 'win' };
const lose: Round = { you: 'rock', rival: 'paper', outcome: 'lose' };
const draw: Round = { you: 'rock', rival: 'rock', outcome: 'draw' };
const over = (rounds: Round[]): Match => {
  const youWins = rounds.filter((r) => r.outcome === 'win').length;
  const rivalWins = rounds.filter((r) => r.outcome === 'lose').length;
  return { phase: 'over', sealed: 'rock', picked: null, rounds, youWins, rivalWins, winner: youWins === 3 ? 'you' : 'rival' };
};

describe('after a match', () => {
  test('the first finished match earns First match, won or lost', () => {
    expect(afterMatch(EMPTY_STATS, over([lose, lose, lose])).earned).toEqual(['first-match']);
  });
  test('a win counts and grows the streak', () => {
    const one = afterMatch(EMPTY_STATS, over([win, lose, win, win])).stats;
    const two = afterMatch(one, over([win, win, lose, win])).stats;
    expect(two).toMatchObject({ matches: 2, won: 2, streak: 2, bestStreak: 2 });
  });
  test('a loss resets the streak and keeps the best', () => {
    const won = afterMatch(afterMatch(EMPTY_STATS, over([win, win, win])).stats, over([win, win, win])).stats;
    expect(afterMatch(won, over([lose, lose, lose])).stats).toMatchObject({ streak: 0, bestStreak: 2, won: 2, matches: 3 });
  });
  test('3–0 earns Clean sweep, once', () => {
    const first = afterMatch(EMPTY_STATS, over([win, draw, win, win]));
    expect(first.earned).toEqual(['first-match', 'clean-sweep']);
    expect(afterMatch(first.stats, over([win, win, win])).earned).toEqual([]);
  });
  test('winning from 0–2 earns Comeback', () => expect(afterMatch(EMPTY_STATS, over([lose, lose, win, win, win])).earned).toContain('comeback'));
});

describe('comebacks', () => {
  test('down 0–2, then three wins', () => expect(wasComeback([lose, draw, lose, win, win, win])).toBe(true));
  test('down 1–2 is not a comeback from 0–2', () => expect(wasComeback([win, lose, lose, win, win])).toBe(false));
  test('a loss is never a comeback', () => expect(wasComeback([lose, lose, win, lose])).toBe(false));
});

describe('after a round', () => {
  test('winning against its read counts toward Mind reader, earned at five', () => {
    let stats = EMPTY_STATS;
    const earned: string[] = [];
    for (let i = 0; i < 5; i += 1) {
      const next = afterRound(stats, win, true);
      stats = next.stats;
      earned.push(...next.earned);
    }
    expect(stats.beatenReads).toBe(5);
    expect(earned).toEqual(['mind-reader']);
  });
  test('a win against a random pick does not count', () => expect(afterRound(EMPTY_STATS, win, false).stats.beatenReads).toBe(0));
  test('a loss to its read does not count', () => expect(afterRound(EMPTY_STATS, lose, true).stats.beatenReads).toBe(0));
});
