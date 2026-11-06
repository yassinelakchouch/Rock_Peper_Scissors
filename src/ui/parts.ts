import { LENGTHS, type Length } from '../game/match';
import type { Move } from '../game/rules';

// Board R-03: every part drawn for this game. SVG strings sized by CSS, so one drawing serves every screen.
export type Mood = 'idle' | 'think' | 'win' | 'lose' | 'draw' | 'smug' | 'bored';
export const MOODS: readonly Mood[] = ['idle', 'think', 'win', 'lose', 'draw', 'smug', 'bored'];

const INK = '#0b0c0d';
const CREAM = '#ece8e1';
const SHADE = '#d3cdc3';
const line = (d: string, width = 4) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${width}" stroke-linecap="round"/>`;

const FEATURES: Record<Mood, string> = {
  idle: `<circle cx="36" cy="44" r="5"/><circle cx="64" cy="44" r="5"/>${line('M38 64 Q50 70 62 64')}`,
  think: `<circle cx="40" cy="40" r="5"/><circle cx="68" cy="40" r="5"/>${line('M28 30 Q36 26 44 29', 3.5)}<circle cx="56" cy="66" r="4.5" fill="none" stroke="${INK}" stroke-width="3.5"/>`,
  win:
    `<circle cx="36" cy="40" r="6"/><circle cx="64" cy="40" r="6"/><circle cx="38" cy="38" r="1.8" fill="${CREAM}"/><circle cx="66" cy="38" r="1.8" fill="${CREAM}"/>` +
    `<path d="M27 56 Q50 59 73 56 Q71 82 50 82 Q29 82 27 56 Z"/><path d="M31 58 Q50 61 69 58 L67 64 Q50 67 33 64 Z" fill="${CREAM}"/>`,
  lose: `${line('M24 38 Q34 32 46 36')}${line('M56 36 Q67 32 78 37')}<circle cx="42" cy="46" r="5.5"/><circle cx="72" cy="46" r="5.5"/>${line('M40 70 Q50 63 60 70')}`,
  draw: `${line('M28 33 L44 31', 3.5)}${line('M56 31 L72 33', 3.5)}<circle cx="36" cy="44" r="5"/><circle cx="64" cy="44" r="5"/>${line('M38 66 L62 66')}`,
  smug: `${line('M26 34 Q36 26 46 33')}${line('M56 37 L76 37')}<circle cx="36" cy="44" r="5"/>${line('M58 46 L72 46')}${line('M38 64 Q54 70 66 59')}`,
  bored: `${line('M29 45 L43 45')}${line('M57 45 L71 45')}${line('M42 67 L60 64')}<text x="76" y="26" font-family="Geist Mono, monospace" font-size="13" fill="${INK}">z</text>`,
};

export const face = (mood: Mood) =>
  `<svg class="face" data-mood="${mood}" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="52" r="46" fill="${SHADE}"/><circle cx="50" cy="47" r="43" fill="${CREAM}"/><g fill="${INK}">${FEATURES[mood]}</g></svg>`;

// Silhouettes outlined once: the shapes in thick ink underneath, the same shapes in cream on top, then the knuckle lines.
const HANDS: Record<Move, [string, string]> = {
  rock: [
    '<rect x="22" y="30" width="56" height="52" rx="18"/><rect x="14" y="46" width="22" height="16" rx="8" transform="rotate(-20 25 54)"/>',
    `<path d="M36 31 V42 M50 30 V42 M64 31 V42" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M28 56 Q44 50 58 60" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  ],
  paper: [
    '<rect x="28" y="44" width="46" height="44" rx="15"/><rect x="29" y="16" width="10" height="40" rx="5"/><rect x="41" y="10" width="10" height="44" rx="5"/><rect x="53" y="12" width="10" height="42" rx="5"/><rect x="65" y="20" width="9" height="36" rx="4.5"/><rect x="17" y="50" width="13" height="30" rx="6.5" transform="rotate(-32 23 66)"/>',
    `<path d="M34 50 V56 M46 48 V56 M58 48 V56" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/>`,
  ],
  scissors: [
    '<rect x="26" y="50" width="50" height="38" rx="15"/><rect x="31" y="10" width="11" height="50" rx="5.5" transform="rotate(-14 36 56)"/><rect x="51" y="10" width="11" height="50" rx="5.5" transform="rotate(14 56 56)"/>',
    `<path d="M44 62 Q56 58 68 64" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M58 52 V60 M68 54 V60" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  ],
};

export const hand = (move: Move) => {
  const [shapes, lines] = HANDS[move];
  return `<svg class="hand" data-move="${move}" viewBox="0 0 100 100" aria-hidden="true"><g fill="${INK}" stroke="${INK}" stroke-width="8" stroke-linejoin="round">${shapes}</g><g class="hand-fill">${shapes}</g>${lines}</svg>`;
};

export const coin = (label = '★') => {
  const star = 'M50 22 L58 40 L78 42 L63 55 L67 75 L50 65 L33 75 L37 55 L22 42 L42 40 Z';
  const inner = label === '★' ? `<path d="${star}" fill="${INK}"/>` : `<text x="50" y="60" text-anchor="middle" font-family="Schibsted Grotesk, sans-serif" font-size="30" font-weight="700" fill="${INK}">${label}</text>`;
  return `<svg class="coin" viewBox="0 0 100 100" aria-hidden="true"><circle cx="52" cy="54" r="44" fill="${INK}"/><circle cx="50" cy="50" r="44" fill="#ff5a2c" stroke="${INK}" stroke-width="5"/><circle cx="50" cy="50" r="34" fill="none" stroke="${INK}" stroke-width="2.5" opacity="0.35"/>${inner}</svg>`;
};

// The ring's track covers three quarters of a circle from bottom-left; each round won fills a third of it.
const RADIUS = 88;
export const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ringArc(wins: number, needed = 3) {
  const share = Math.max(0, Math.min(needed, wins)) / needed;
  const angle = ((135 + 270 * share) * Math.PI) / 180;
  return { dash: CIRCUMFERENCE * 0.75 * share, knob: { x: 100 + RADIUS * Math.cos(angle), y: 100 + RADIUS * Math.sin(angle) } };
}

// Only the art: track, progress, knob and halo. The face, the pick, the chip and the coin are HTML layers on top (src/style.css).
export const ring = (side: 'you' | 'rival') =>
  `<svg class="ring-svg" data-ring="${side}" viewBox="-8 -12 216 222" aria-hidden="true">` +
  `<circle class="ring-halo" cx="100" cy="100" r="96" fill="none" stroke="#ff5a2c" stroke-width="2"/>` +
  `<circle cx="100" cy="100" r="${RADIUS}" fill="none" stroke="#2a2d30" stroke-width="14"/><circle cx="100" cy="100" r="78" fill="#141617"/>` +
  `<circle class="ring-progress" cx="100" cy="100" r="${RADIUS}" fill="none" stroke="#ff5a2c" stroke-width="14" stroke-linecap="round" stroke-dasharray="0 ${CIRCUMFERENCE}" transform="rotate(135 100 100)"/>` +
  `<g class="ring-knob" opacity="0"><circle r="10" fill="#ff5a2c"/><circle r="3.8" fill="${CREAM}"/></g>` +
  `</svg>`;

// The rival's voice, mid-match and after it (board R-05 · #29): one pill that wraps only between its parts.
export const hint = (parts: readonly string[]) =>
  `<span class="hint">${parts.map((part, i) => `<span class="hint-part">${i === 0 ? '● ' : ''}${part}${i < parts.length - 1 ? ' ·' : ''}</span>`).join(' ')}</span>`;

// Match length (board R-05 · #28): three toggle chips after "BEST OF", disabled once the match starts.
export const lengthChips = (length: Length) =>
  `<span class="length" role="group" aria-label="Match length">${LENGTHS.map((n) => `<button type="button" class="length-chip" data-length="${n}" aria-pressed="${n === length}" aria-label="Best of ${n}">${n}</button>`).join('')}</span>`;

// The opening scenes (board R-06): where they are and the way out, on every scene.
export const introBar = (index: number, count: number) =>
  `<span class="intro-label">How to play · ${index + 1}/${count}</span>` +
  `<span class="intro-steps" aria-hidden="true">${Array.from({ length: count }, (_, i) => `<i${i <= index ? ' class="on"' : ''}></i>`).join('')}</span>` +
  `<button type="button" class="text-link" data-skip>Skip · Esc</button>`;
