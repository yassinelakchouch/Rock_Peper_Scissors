import type { SoundName } from '../sound/sound';
import { face, hand, ring } from './parts';

// The playground count (board R-04): three beats, each quicker than the last, then "shoot!" as the fists fly into the rings.
export const CHANT: readonly { at: number; word: string; sound: SoundName }[] = [
  { at: 0, word: 'Rock…', sound: 'chant1' },
  { at: 620, word: 'Paper…', sound: 'chant2' },
  { at: 1150, word: 'Scissors…', sound: 'chant3' },
  { at: 1600, word: 'shoot!', sound: 'reveal' },
];
export const FLY_MS = 450;
export const CHANT_MS = 2200;

// The board draws each frame as a whole screen of 720 by 420; the loader keeps those proportions on any screen.
export const STAGE = { width: 720, height: 420 };
export const stageUnit = (width: number, height: number) => Math.min(width / STAGE.width, height / STAGE.height);

// The arena's own ring and face; at "shoot!" the rival thinks with its question mark (frame 05).
const ringFace = (side: 'you' | 'rival', thinking: boolean) =>
  `<span class="ring-box loader-ring" data-ring="${side}"><span class="ring-art">${ring(side)}</span>` +
  `<span class="ring-face">${face(thinking ? 'think' : 'idle')}</span>` +
  (thinking ? '<span class="ring-badge" data-content="?">?</span>' : '') +
  `</span>`;

// One button over the arena, named for what it does; the chant's words are decoration for screen readers.
export function loaderMarkup(): string {
  return `<button type="button" class="loader" aria-label="Start the game">
    <span class="loader-stage" aria-hidden="true">
      <span class="loader-fists"><span class="loader-fist" data-fist="you">${hand('rock')}</span><span class="loader-fist" data-fist="rival">${hand('rock')}</span></span>
      <span class="loader-row">${ringFace('you', false)}<span class="loader-word">Rock, paper, rival</span>${ringFace('rival', true)}</span>
      <span class="loader-sub">rps-project002</span>
      <span class="loader-pill loader-cue">Tap or press any key</span>
    </span>
  </button>`;
}
