import { describe, expect, test } from 'vitest';
import { MOVES } from '../game/rules';
import { CIRCUMFERENCE, coin, face, hand, MOODS, ring, ringArc } from './parts';

describe('the ring fills a third per round won', () => {
  test('empty at 0', () => expect(ringArc(0).dash).toBe(0));
  test('a quarter of the circle per third of the track', () => expect(ringArc(1).dash).toBeCloseTo(CIRCUMFERENCE * 0.25));
  test('full track at 3, and never past it', () => {
    expect(ringArc(3).dash).toBeCloseTo(CIRCUMFERENCE * 0.75);
    expect(ringArc(5).dash).toBeCloseTo(CIRCUMFERENCE * 0.75);
  });
  test('like a gauge: the knob starts bottom-left, passes the top, ends bottom-right, always on the track', () => {
    const start = ringArc(0).knob;
    const half = ringArc(1.5).knob;
    const end = ringArc(3).knob;
    expect(start.x).toBeLessThan(100);
    expect(start.y).toBeGreaterThan(100);
    expect(half.x).toBeCloseTo(100);
    expect(half.y).toBeCloseTo(12);
    expect(end.x).toBeCloseTo(200 - start.x);
    expect(end.y).toBeCloseTo(start.y);
    expect(Math.hypot(end.x - 100, end.y - 100)).toBeCloseTo(88);
  });
});

describe('the drawings', () => {
  test('seven moods, each its own face', () => {
    const drawn = MOODS.map(face);
    expect(new Set(drawn).size).toBe(7);
    drawn.forEach((svg, i) => expect(svg).toContain(`data-mood="${MOODS[i]}"`));
  });
  test('three hands, outlined once', () =>
    MOVES.forEach((move) => {
      const svg = hand(move);
      expect(svg).toContain(`data-move="${move}"`);
      expect(svg).toContain('stroke-width="8"');
    }));
  test('a coin shows a star or a label', () => {
    expect(coin()).toContain('<path d="M50 22');
    expect(coin('3–0')).toContain('>3–0</text>');
  });
  test('every drawing hides itself from screen readers; the page speaks the result', () =>
    [face('idle'), hand('rock'), coin(), ring('you')].forEach((svg) => expect(svg).toContain('aria-hidden="true"')));
});
