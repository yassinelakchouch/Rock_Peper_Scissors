import type { Round } from './match';
import { counterOf, MOVES, type Move } from './rules';

const MEMORY = 5;
const READ_CHANCE = 0.4;

// The move you play most in the window; a tie goes to the one you played last.
export function mostPlayed(moves: readonly Move[]): Move {
  const counts = new Map<Move, number>();
  moves.forEach((move) => counts.set(move, (counts.get(move) ?? 0) + 1));
  return [...moves].reverse().reduce((best, move) => ((counts.get(move) ?? 0) > (counts.get(best) ?? 0) ? move : best));
}

// Called when a round opens, from your past moves only: it never sees the move you're about to make.
export function rivalPick(history: readonly Move[], random: () => number = Math.random): { move: Move; reading: boolean } {
  const recent = history.slice(-MEMORY);
  if (recent.length >= 3 && random() < READ_CHANCE) return { move: counterOf(mostPlayed(recent)), reading: true };
  return { move: MOVES[Math.min(2, Math.floor(random() * 3))], reading: false };
}

export type ReadFacts = { reads: number; habit: { move: Move; times: number; of: number } | null };

// What the rival used this match (board R-05 · #29): its reads, and the move you played most in your last five, named at three or more.
export function readFacts(reads: readonly boolean[], moves: readonly Move[]): ReadFacts {
  const recent = moves.slice(-MEMORY);
  const habit = recent.length ? mostPlayed(recent) : null;
  const times = habit ? recent.filter((move) => move === habit).length : 0;
  return { reads: reads.filter(Boolean).length, habit: habit && times >= 3 ? { move: habit, times, of: recent.length } : null };
}

// Three rounds in a row lost to a move it chose by reading you: time to say so.
export function wasRead(rounds: readonly Round[], reads: readonly boolean[]): boolean {
  if (rounds.length < 3) return false;
  return rounds.slice(-3).every((round, i) => round.outcome === 'lose' && reads[reads.length - 3 + i]);
}
