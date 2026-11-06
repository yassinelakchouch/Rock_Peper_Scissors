import type { ReadFacts } from '../game/rival';
import type { Badge } from '../game/stats';

// The read-out after a match (board R-05 · #29): the pill's parts, and the same words as one sentence for screen readers.
export function readOut({ reads, habit }: ReadFacts): string[] {
  if (reads === 0) return ['it guessed every round: nothing to read'];
  const times = reads === 1 ? 'once' : reads === 2 ? 'twice' : `${reads} times`;
  return [`it read you ${times}`, habit ? `you lean on ${habit.move}, ${habit.times} of your last ${habit.of}` : 'no habit stood out'];
}

export const sentence = (parts: readonly string[]) => `${parts.join('; ').replace(/^./, (first) => first.toUpperCase())}.`;

export const BADGE_TEXT: Record<Badge, { coin: string; name: string; why: string }> = {
  'first-match': { coin: '1', name: 'First match', why: 'your first match, played to the end' },
  'clean-sweep': { coin: '3–0', name: 'Clean sweep', why: 'a match won without losing a round' },
  comeback: { coin: '↺', name: 'Comeback', why: 'a match won from one round from losing, with none won' },
  'mind-reader': { coin: '★', name: 'Mind reader', why: 'five rounds won against its read' },
};

const NUMBER_WORDS = ['none', 'one', 'two', 'three', 'four'];
export const firstTo = (needed: number) => `first to ${NUMBER_WORDS[needed]} wins the match`;

// The opening scenes (board R-06): what each one says, in the hint pill and to screen readers.
export const introLines = (needed: number) => [
  ['a click on a hand plays it', 'tap, click, or R · P · S'],
  ['the rival picked first', 'it never sees your move'],
  ['paper covers rock', 'rock breaks scissors', 'scissors cut paper'],
  [firstTo(needed), 'the rival learns your habits', 'badges go to Stats'],
];
