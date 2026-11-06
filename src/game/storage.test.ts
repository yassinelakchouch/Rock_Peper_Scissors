import { expect, test } from 'vitest';
import { EMPTY_STATS } from './stats';
import { load, save } from './storage';

const memory = () => {
  const items = new Map<string, string>();
  return { getItem: (key: string) => items.get(key) ?? null, setItem: (key: string, value: string) => void items.set(key, value) };
};

test('what is saved comes back', () => {
  const store = memory();
  const stats = { ...EMPTY_STATS, matches: 4, won: 3, streak: 2, bestStreak: 3, beatenReads: 2, badges: ['first-match' as const] };
  save({ stats, muted: true, length: 7 }, store);
  expect(load(store)).toEqual({ stats, muted: true, length: 7 });
});

test('a first visit starts fresh with sound on', () => expect(load(memory())).toEqual({ stats: EMPTY_STATS, muted: false, length: 5 }));

test('broken or foreign data starts fresh', () => {
  const store = memory();
  store.setItem('rps-project002', '{"stats":');
  expect(load(store)).toEqual({ stats: EMPTY_STATS, muted: false, length: 5 });
  store.setItem('rps-project002', JSON.stringify({ stats: { ...EMPTY_STATS, won: -1, badges: ['cheater'] }, muted: 'no' }));
  expect(load(store)).toEqual({ stats: EMPTY_STATS, muted: false, length: 5 });
});

test('a blocked storage (private window) neither throws nor saves', () => {
  const blocked = {
    getItem: () => {
      throw new Error('denied');
    },
    setItem: () => {
      throw new Error('denied');
    },
  };
  expect(load(blocked)).toEqual({ stats: EMPTY_STATS, muted: false, length: 5 });
  expect(() => save({ stats: EMPTY_STATS, muted: false, length: 5 }, blocked)).not.toThrow();
});

test('a visit saved before the match length keeps its stats and plays best of five (#28)', () => {
  const store = memory();
  store.setItem('rps-project002', JSON.stringify({ stats: { ...EMPTY_STATS, matches: 2 }, muted: false }));
  expect(load(store)).toMatchObject({ stats: { matches: 2 }, length: 5 });
  store.setItem('rps-project002', JSON.stringify({ stats: EMPTY_STATS, muted: false, length: 9 }));
  expect(load(store).length).toBe(5);
});
