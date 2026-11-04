import { outcome, type Move, type Outcome } from './rules';

export const WINS_NEEDED = 3;

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
}>;

export type Action = { type: 'pick'; move: Move } | { type: 'reveal' } | { type: 'next'; rival: Move } | { type: 'again'; rival: Move };

export const newMatch = (rival: Move): Match => ({ phase: 'open', sealed: rival, picked: null, rounds: [], youWins: 0, rivalWins: 0, winner: null });

export function play(match: Match, action: Action): Match {
  switch (action.type) {
    case 'pick':
      return match.phase === 'open' ? { ...match, phase: 'sealed', picked: action.move } : match;
    case 'reveal': {
      if (match.phase !== 'sealed' || !match.picked) return match;
      const result = outcome(match.picked, match.sealed);
      const youWins = match.youWins + (result === 'win' ? 1 : 0);
      const rivalWins = match.rivalWins + (result === 'lose' ? 1 : 0);
      const winner = youWins >= WINS_NEEDED ? 'you' : rivalWins >= WINS_NEEDED ? 'rival' : null;
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
      return match.phase === 'over' ? newMatch(action.rival) : match;
  }
}

export const isMatchPoint = (match: Match) =>
  match.phase !== 'over' && (match.youWins === WINS_NEEDED - 1 || match.rivalWins === WINS_NEEDED - 1);
