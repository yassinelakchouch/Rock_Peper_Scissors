import { DEFAULT_LENGTH, LENGTHS, type Length } from './match';
import { BADGES, EMPTY_STATS, type Badge, type Stats } from './stats';

type Store = Pick<Storage, 'getItem' | 'setItem'>;
type Saved = { stats: Stats; muted: boolean; length: Length };

const KEY = 'rps-project002';
const fresh = (): Saved => ({ stats: EMPTY_STATS, muted: false, length: DEFAULT_LENGTH });
const count = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0;

// Storage can be missing or blocked (private windows): every read and write is wrapped, and bad data starts fresh.
export function load(store?: Store): Saved {
  try {
    const raw = (store ?? window.localStorage).getItem(KEY);
    if (!raw) return fresh();
    const { stats, muted, length } = JSON.parse(raw) ?? {};
    const badges: unknown = stats?.badges;
    const numbers = ['matches', 'won', 'streak', 'bestStreak', 'beatenReads'].every((key) => count(stats?.[key]));
    if (!numbers || typeof muted !== 'boolean' || !Array.isArray(badges) || !badges.every((badge) => BADGES.includes(badge))) return fresh();
    const { matches, won, streak, bestStreak, beatenReads } = stats;
    // The match length came later (#28): a visit saved before it keeps its stats and plays best of five.
    const chosen: Length = LENGTHS.includes(length) ? length : DEFAULT_LENGTH;
    return { stats: { matches, won, streak, bestStreak, beatenReads, badges: badges as Badge[] }, muted, length: chosen };
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
