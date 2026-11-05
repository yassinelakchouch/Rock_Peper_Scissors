import { describe, expect, test } from 'vitest';
import { readOut, sentence } from './copy';

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
