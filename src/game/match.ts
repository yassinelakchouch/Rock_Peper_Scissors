import { outcome, type Move, type Outcome } from './rules';

// Match length (board R-05 · #28): best of 3, 5 or 7, chosen before round 1.
export const LENGTHS = [3, 5, 7] as const;
export type Length = (typeof LENGTHS)[number];
export const DEFAULT_LENGTH: Length = 5;
export const winsNeeded = (length: Length) => (length + 1) / 2;

export type Round = { you: Move; rival: Move; outcome: Outcome };

// The rival's move is sealed when a round opens, before yours exists: fair by construction.
export type Match = Readonly<{
  phase: 'open' | 'sealed' | 'revealed' | 'over';
  sealed: Move;
  picked: Move | null;
  rounds: readonly Round[];
  youWins: number;
  rivalWins: number;
  winner: 'you' | 'rival' | null;
  length: Length;
}>;

type Action = { type: 'length'; length: Length } | { type: 'pick'; move: Move } | { type: 'reveal' } | { type: 'next'; rival: Move } | { type: 'again'; rival: Move };

export const newMatch = (rival: Move, length: Length = DEFAULT_LENGTH): Match => ({ phase: 'open', sealed: rival, picked: null, rounds: [], youWins: 0, rivalWins: 0, winner: null, length });

export function play(match: Match, action: Action): Match {
  switch (action.type) {
    case 'length':
      return match.phase === 'open' && match.rounds.length === 0 ? { ...match, length: action.length } : match;
    case 'pick':
      return match.phase === 'open' ? { ...match, phase: 'sealed', picked: action.move } : match;
    case 'reveal': {
      if (match.phase !== 'sealed' || !match.picked) return match;
      const result = outcome(match.picked, match.sealed);
      const youWins = match.youWins + (result === 'win' ? 1 : 0);
      const rivalWins = match.rivalWins + (result === 'lose' ? 1 : 0);
      const needed = winsNeeded(match.length);
      const winner = youWins >= needed ? 'you' : rivalWins >= needed ? 'rival' : null;
      return {
        ...match,
        phase: winner ? 'over' : 'revealed',
        rounds: [...match.rounds, { you: match.picked, rival: match.sealed, outcome: result }],
        youWins,
        rivalWins,
        winner,
      };
    }
    case 'next':
      return match.phase === 'revealed' ? { ...match, phase: 'open', sealed: action.rival, picked: null } : match;
    case 'again':
      return match.phase === 'over' ? newMatch(action.rival, match.length) : match;
  }
}

export const isMatchPoint = (match: Match) =>
  match.phase !== 'over' && (match.youWins === winsNeeded(match.length) - 1 || match.rivalWins === winsNeeded(match.length) - 1);
