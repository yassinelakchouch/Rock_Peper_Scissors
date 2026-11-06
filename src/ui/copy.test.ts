import { describe, expect, test } from 'vitest';
import { firstTo, introLines, readOut, sentence } from './copy';

describe('the read-out after a match', () => {
  test('says the rival only guessed when it never read you', () => {
    expect(readOut({ reads: 0, habit: null })).toEqual(['it guessed every round: nothing to read']);
  });

  test('names the reads in words, and the habit when there is one', () => {
    expect(readOut({ reads: 1, habit: null })).toEqual(['it read you once', 'no habit stood out']);
    expect(readOut({ reads: 2, habit: null })[0]).toBe('it read you twice');
    expect(readOut({ reads: 3, habit: { move: 'rock', times: 4, of: 5 } })).toEqual(['it read you 3 times', 'you lean on rock, 4 of your last 5']);
  });

  test('is one sentence for screen readers', () => {
    expect(sentence(['it read you once', 'no habit stood out'])).toBe('It read you once; no habit stood out.');
  });
});

test('the open line names the wins the match length needs (#28)', () => {
  expect([2, 3, 4].map(firstTo)).toEqual(['first to two wins the match', 'first to three wins the match', 'first to four wins the match']);
});

describe('the opening scenes say the rules once each (board R-06)', () => {
  test('four scenes; the last names the match length chosen', () => {
    const lines = introLines(2);
    expect(lines).toHaveLength(4);
    expect(lines[2]).toEqual(['paper covers rock', 'rock breaks scissors', 'scissors cut paper']);
    expect(lines[3][0]).toBe('first to two wins the match');
    expect(sentence(lines[1])).toBe('The rival picked first; it never sees your move.');
  });
});
