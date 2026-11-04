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

// Three rounds in a row lost to a move it chose by reading you: time to say so.
export function wasRead(rounds: readonly Round[], reads: readonly boolean[]): boolean {
  if (rounds.length < 3) return false;
  return rounds.slice(-3).every((round, i) => round.outcome === 'lose' && reads[reads.length - 3 + i]);
}
