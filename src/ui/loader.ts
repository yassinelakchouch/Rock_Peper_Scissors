import type { SoundName } from '../sound/sound';
import { hand, ring } from './parts';

export const SEEN_KEY = 'rps-project002:loaded';

// The playground count (board R-04): three beats, each quicker than the last, then "shoot!" as the fists fly into the rings.
export const CHANT: readonly { at: number; word: string; sound: SoundName }[] = [
  { at: 0, word: 'Rock…', sound: 'chant1' },
  { at: 620, word: 'Paper…', sound: 'chant2' },
  { at: 1150, word: 'Scissors…', sound: 'chant3' },
  { at: 1600, word: 'shoot!', sound: 'reveal' },
];
export const FLY_MS = 450;
export const CHANT_MS = 2200;

const title = '<span class="loader-title">Rock, paper, <span class="font-serif italic">rival</span></span>';

// One button over the arena, named for what it does; the chant's words are decoration for screen readers.
export function loaderMarkup(still: boolean): string {
  if (still) {
    return `<button type="button" class="loader" data-still aria-label="Start the game">
      <span class="loader-stage" aria-hidden="true">${title}<span class="loader-rings">${ring('you')}${ring('rival')}</span><span class="loader-play">Play</span></span>
    </button>`;
  }
  return `<button type="button" class="loader" aria-label="Start the game">
    <span class="loader-stage" aria-hidden="true">
      <span class="loader-fists"><span class="loader-fist" data-fist="you">${hand('rock')}</span><span class="loader-fist" data-fist="rival">${hand('rock')}</span></span>
      <span class="loader-word">${title}</span>
      <span class="loader-sub">rps-project002</span>
      <span class="loader-cue">Tap or press any key</span>
    </span>
  </button>`;
}
