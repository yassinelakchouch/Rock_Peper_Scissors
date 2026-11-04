import { describe, expect, test } from 'vitest';
import { isMatchPoint, newMatch, play, WINS_NEEDED, type Match } from './match';
import type { Move } from './rules';

// Plays whole rounds: the rival's move is sealed first, then yours, then the reveal.
const rounds = (match: Match, pairs: [Move, Move][]) =>
  pairs.reduce((m, [you, rival]) => {
    const opened = m.phase === 'revealed' ? play(m, { type: 'next', rival }) : { ...m, sealed: rival };
    return play(play(opened, { type: 'pick', move: you }), { type: 'reveal' });
  }, match);

describe('a round', () => {
  test('a match opens with the rival already sealed', () => {
    const match = newMatch('rock');
    expect(match).toMatchObject({ phase: 'open', sealed: 'rock', youWins: 0, rivalWins: 0, rounds: [] });
  });
  test('your pick seals the round; a second pick is ignored', () => {
    const picked = play(newMatch('rock'), { type: 'pick', move: 'paper' });
    expect(picked).toMatchObject({ phase: 'sealed', picked: 'paper' });
    expect(play(picked, { type: 'pick', move: 'scissors' })).toBe(picked);
  });
  test('the reveal scores the round', () => {
    const revealed = rounds(newMatch('rock'), [['paper', 'rock']]);
    expect(revealed).toMatchObject({ phase: 'revealed', youWins: 1, rivalWins: 0 });
    expect(revealed.rounds).toEqual([{ you: 'paper', rival: 'rock', outcome: 'win' }]);
  });
  test('a draw counts for no one and is still remembered', () => {
    const drawn = rounds(newMatch('rock'), [['rock', 'rock']]);
    expect(drawn).toMatchObject({ youWins: 0, rivalWins: 0 });
    expect(drawn.rounds).toHaveLength(1);
  });
  test('the next round seals a new rival move', () =>
    expect(play(rounds(newMatch('rock'), [['paper', 'rock']]), { type: 'next', rival: 'scissors' })).toMatchObject({ phase: 'open', sealed: 'scissors', picked: null }));
  test('a reveal before a pick does nothing', () => {
    const match = newMatch('rock');
    expect(play(match, { type: 'reveal' })).toBe(match);
  });
});

describe('the match', () => {
  test(`first to ${WINS_NEEDED} wins it`, () => {
    const won = rounds(newMatch('rock'), [['paper', 'rock'], ['rock', 'paper'], ['rock', 'scissors'], ['scissors', 'paper']]);
    expect(won).toMatchObject({ phase: 'over', youWins: 3, rivalWins: 1, winner: 'you' });
  });
  test('the rival can win it too', () =>
    expect(rounds(newMatch('rock'), [['scissors', 'rock'], ['scissors', 'rock'], ['scissors', 'rock']])).toMatchObject({ phase: 'over', winner: 'rival' }));
  test('nothing moves after the match is over', () => {
    const over = rounds(newMatch('rock'), [['paper', 'rock'], ['paper', 'rock'], ['paper', 'rock']]);
    expect(play(over, { type: 'pick', move: 'rock' })).toBe(over);
    expect(play(over, { type: 'next', rival: 'rock' })).toBe(over);
  });
  test('play again starts fresh with a new sealed move', () => {
    const over = rounds(newMatch('rock'), [['paper', 'rock'], ['paper', 'rock'], ['paper', 'rock']]);
    expect(play(over, { type: 'again', rival: 'paper' })).toEqual(newMatch('paper'));
  });
  test('match point when either side needs one more win', () => {
    expect(isMatchPoint(rounds(newMatch('rock'), [['paper', 'rock'], ['paper', 'rock']]))).toBe(true);
    expect(isMatchPoint(rounds(newMatch('rock'), [['paper', 'rock']]))).toBe(false);
    expect(isMatchPoint(rounds(newMatch('rock'), [['paper', 'rock'], ['paper', 'rock'], ['paper', 'rock']]))).toBe(false);
  });
});
