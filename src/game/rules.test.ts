import { describe, expect, test } from 'vitest';
import { counterOf, MOVES, outcome, verdict } from './rules';

describe('who beats whom', () => {
  test.each([
    ['rock', 'scissors', 'win'],
    ['scissors', 'paper', 'win'],
    ['paper', 'rock', 'win'],
    ['scissors', 'rock', 'lose'],
    ['paper', 'scissors', 'lose'],
    ['rock', 'paper', 'lose'],
  ] as const)('%s against %s: %s', (you, rival, expected) => expect(outcome(you, rival)).toBe(expected));

  test('the same move is a draw', () => MOVES.forEach((move) => expect(outcome(move, move)).toBe('draw')));
});

describe('what the result line says', () => {
  test.each([
    ['paper', 'rock', 'Paper covers rock'],
    ['rock', 'paper', 'Paper covers rock'],
    ['rock', 'scissors', 'Rock breaks scissors'],
    ['scissors', 'paper', 'Scissors cut paper'],
    ['rock', 'rock', 'Both rock'],
  ] as const)('%s and %s: %s', (you, rival, line) => expect(verdict(you, rival)).toBe(line));
});

test('the counter to each move beats it', () => MOVES.forEach((move) => expect(outcome(counterOf(move), move)).toBe('win')));
