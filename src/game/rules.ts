export type Move = 'rock' | 'paper' | 'scissors';
export type Outcome = 'win' | 'lose' | 'draw';

export const MOVES: readonly Move[] = ['rock', 'paper', 'scissors'];

// Each move and the one it beats, with the words the result line uses.
const BEATS: Record<Move, { beats: Move; verb: string }> = {
  rock: { beats: 'scissors', verb: 'breaks' },
  paper: { beats: 'rock', verb: 'covers' },
  scissors: { beats: 'paper', verb: 'cut' },
};

const capital = (move: Move) => move[0].toUpperCase() + move.slice(1);

export function outcome(you: Move, rival: Move): Outcome {
  if (you === rival) return 'draw';
  return BEATS[you].beats === rival ? 'win' : 'lose';
}

// "Paper covers rock" reads the same whoever played it.
export function verdict(you: Move, rival: Move): string {
  if (you === rival) return `Both ${you}`;
  const [winner, loser] = BEATS[you].beats === rival ? [you, rival] : [rival, you];
  return `${capital(winner)} ${BEATS[winner].verb} ${loser}`;
}

export const counterOf = (move: Move): Move => MOVES.find((candidate) => BEATS[candidate].beats === move)!;
