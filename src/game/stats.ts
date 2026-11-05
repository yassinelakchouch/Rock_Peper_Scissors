import type { Match, Round } from './match';

export type Badge = 'first-match' | 'clean-sweep' | 'comeback' | 'mind-reader';
export const BADGES: readonly Badge[] = ['first-match', 'clean-sweep', 'comeback', 'mind-reader'];

// beatenReads: rounds won against a move the rival chose by reading you.
export type Stats = { matches: number; won: number; streak: number; bestStreak: number; beatenReads: number; badges: Badge[] };
export const EMPTY_STATS: Stats = { matches: 0, won: 0, streak: 0, bestStreak: 0, beatenReads: 0, badges: [] };

const MIND_READER_AT = 5;

const earn = (stats: Stats, wanted: [Badge, boolean][]) => wanted.filter(([badge, met]) => met && !stats.badges.includes(badge)).map(([badge]) => badge);

// Down 0–2 at some point, and the match still won.
export function wasComeback(rounds: readonly Round[]): boolean {
  let you = 0;
  let rival = 0;
  let behind = false;
  for (const round of rounds) {
    if (round.outcome === 'win') you += 1;
    if (round.outcome === 'lose') rival += 1;
    if (you === 0 && rival === 2) behind = true;
  }
  return behind && you >= 3;
}

export function afterMatch(stats: Stats, match: Match): { stats: Stats; earned: Badge[] } {
  const won = match.winner === 'you';
  const streak = won ? stats.streak + 1 : 0;
  const earned = earn(stats, [
    ['first-match', true],
    ['clean-sweep', won && match.rivalWins === 0],
    ['comeback', won && wasComeback(match.rounds)],
  ]);
  return {
    stats: { ...stats, matches: stats.matches + 1, won: stats.won + (won ? 1 : 0), streak, bestStreak: Math.max(stats.bestStreak, streak), badges: [...stats.badges, ...earned] },
    earned,
  };
}

export function afterRound(stats: Stats, round: Round, reading: boolean): { stats: Stats; earned: Badge[] } {
  const beatenReads = stats.beatenReads + (reading && round.outcome === 'win' ? 1 : 0);
  const earned = earn(stats, [['mind-reader', beatenReads >= MIND_READER_AT]]);
  return { stats: { ...stats, beatenReads, badges: [...stats.badges, ...earned] }, earned };
}
