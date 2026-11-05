import { expect, test } from 'vitest';
import { SOUNDS, tone } from './sound';

test('every effect is short and quiet', () => {
  for (const name of SOUNDS) {
    const notes = tone(name);
    expect(notes.length).toBeGreaterThan(0);
    for (const note of notes) {
      expect(note.at + note.length, name).toBeLessThanOrEqual(name === 'fanfare' ? 0.9 : 0.45);
      expect(note.gain, name).toBeLessThanOrEqual(0.1);
    }
  }
});

test('a win rises and a loss falls', () => {
  const win = tone('win');
  expect(win.at(-1)!.from).toBeGreaterThan(win[0].from);
  const [lose] = tone('lose');
  expect(lose.to).toBeLessThan(lose.from);
});

test('the shuffle ticks three times, inside the 0.6 s seal', () => {
  const ticks = tone('tick');
  expect(ticks).toHaveLength(3);
  expect(ticks.at(-1)!.at + ticks.at(-1)!.length).toBeLessThan(0.6);
});

test('the fanfare climbs to its last note', () => {
  const notes = tone('fanfare');
  const pitches = notes.map((note) => note.from);
  expect(Math.max(...pitches)).toBe(pitches.at(-1));
});

test('the loader’s count climbs a step on each beat', () => {
  const pitches = (['chant1', 'chant2', 'chant3'] as const).map((name) => tone(name)[0].from);
  expect(pitches).toEqual([330, 392, 494]);
});

