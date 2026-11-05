import { BADGES, EMPTY_STATS, type Badge, type Stats } from './stats';

type Store = Pick<Storage, 'getItem' | 'setItem'>;
type Saved = { stats: Stats; muted: boolean };

const KEY = 'rps-project002';
const fresh = (): Saved => ({ stats: EMPTY_STATS, muted: false });
const count = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0;

// Storage can be missing or blocked (private windows): every read and write is wrapped, and bad data starts fresh.
export function load(store?: Store): Saved {
  try {
    const raw = (store ?? window.localStorage).getItem(KEY);
    if (!raw) return fresh();
    const { stats, muted } = JSON.parse(raw) ?? {};
    const badges: unknown = stats?.badges;
    const numbers = ['matches', 'won', 'streak', 'bestStreak', 'beatenReads'].every((key) => count(stats?.[key]));
    if (!numbers || typeof muted !== 'boolean' || !Array.isArray(badges) || !badges.every((badge) => BADGES.includes(badge))) return fresh();
    const { matches, won, streak, bestStreak, beatenReads } = stats;
    return { stats: { matches, won, streak, bestStreak, beatenReads, badges: badges as Badge[] }, muted };
  } catch {
    return fresh();
  }
}

export function save(saved: Saved, store?: Store) {
  try {
    (store ?? window.localStorage).setItem(KEY, JSON.stringify(saved));
  } catch {
    // Nothing to do: the visit still works, it just won't be remembered.
  }
}
