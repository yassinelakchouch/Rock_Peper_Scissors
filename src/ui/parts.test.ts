import { describe, expect, test } from 'vitest';
import { MOVES } from '../game/rules';
import { CIRCUMFERENCE, coin, face, hand, hint, introBar, lengthChips, MOODS, ring, ringArc } from './parts';

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

describe('the hint pill', () => {
  test('starts with the dot and wraps only between its parts', () => {
    const html = hint(['it read you 3 times', 'you lean on rock, 4 of your last 5']);
    expect(html.split('class="hint-part"').length - 1).toBe(2);
    expect(html).toContain('● it read you 3 times ·</span> <span class="hint-part">you lean on rock');
  });
});

describe('the match length chips (#28)', () => {
  test('three toggle buttons named for what they choose, the current one pressed', () => {
    const html = lengthChips(3);
    expect(html).toContain('role="group" aria-label="Match length"');
    expect(html.split('class="length-chip"').length - 1).toBe(3);
    expect(html).toContain('data-length="3" aria-pressed="true" aria-label="Best of 3"');
    expect(html).toContain('data-length="5" aria-pressed="false"');
  });

  test('the ring fills by the wins the length needs', () => {
    expect(ringArc(1, 2).dash).toBeCloseTo(CIRCUMFERENCE * 0.375);
    expect(ringArc(4, 4).dash).toBeCloseTo(CIRCUMFERENCE * 0.75);
  });
});

describe('the opening scenes bar (board R-06)', () => {
  test('says which scene of how many, lights the steps so far and offers Skip', () => {
    const html = introBar(1, 4);
    expect(html).toContain('How to play · 2/4');
    expect(html.match(/<i class="on"><\/i>/g)).toHaveLength(2);
    expect(html.match(/<i><\/i>/g)).toHaveLength(2);
    expect(html).toContain('<button type="button" class="text-link" data-skip>Skip · Esc</button>');
  });
});
