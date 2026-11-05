import type { SoundName } from '../sound/sound';
import { CHANT, CHANT_MS, FLY_MS, SEEN_KEY, loaderMarkup } from './loader';

const seen = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
};

const remember = () => {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    // Storage refused: the chant simply plays again next visit.
  }
};

// Board R-04, once a visit: the first tap opens audio and starts the count; any key during it skips to the arena.
export function runLoader(play: (name: SoundName) => void, ready: (shown: boolean) => void) {
  const root = document.documentElement;
  if (seen()) {
    root.classList.remove('chant');
    return ready(false);
  }
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.insertAdjacentHTML('beforeend', loaderMarkup(still));
  const loader = document.querySelector<HTMLButtonElement>('.loader')!;
  const word = loader.querySelector<HTMLElement>('.loader-word');
  const fists = loader.querySelector<HTMLElement>('.loader-fists');
  const timers: number[] = [];
  let state: 'waiting' | 'chanting' | 'done' = 'waiting';

  const finish = () => {
    if (state === 'done') return;
    state = 'done';
    timers.forEach((id) => window.clearTimeout(id));
    window.removeEventListener('keydown', onKey, true);
    remember();
    root.classList.remove('chant');
    loader.classList.add('loader-leave');
    window.setTimeout(() => loader.remove(), 200);
    ready(true);
  };

  // On "shoot!" each fist arcs into its ring in the arena below, which keeps its layout while hidden.
  const fly = () => {
    for (const fist of loader.querySelectorAll<HTMLElement>('.loader-fist')) {
      const target = document.querySelector(`#arena [data-side="${fist.dataset.fist}"] .ring-box`);
      if (!target) continue;
      const a = fist.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      const dx = b.left + b.width / 2 - (a.left + a.width / 2);
      const dy = b.top + b.height / 2 - (a.top + a.height / 2);
      fist.animate(
        [
          { transform: 'translate(0, 0) scale(1)' },
          { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 70}px) scale(0.8)`, offset: 0.5 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.55)`, opacity: 0 },
        ],
        { duration: FLY_MS, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' },
      );
    }
  };

  const beat = (step: (typeof CHANT)[number]) => {
    if (word) word.textContent = step.word;
    if (fists) {
      fists.classList.remove('beat');
      void fists.offsetWidth;
      fists.classList.add('beat');
    }
    play(step.sound);
    if (step === CHANT.at(-1)) fly();
  };

  const begin = () => {
    if (state === 'chanting') return finish();
    if (state !== 'waiting') return;
    if (still) return finish();
    state = 'chanting';
    loader.classList.add('loader-chanting');
    for (const step of CHANT) timers.push(window.setTimeout(() => beat(step), step.at));
    timers.push(window.setTimeout(finish, CHANT_MS));
  };

  // Keys never reach the game while the loader is up; Tab still moves focus.
  function onKey(event: KeyboardEvent) {
    if (event.metaKey || event.ctrlKey || event.altKey || event.key === 'Tab') return;
    event.preventDefault();
    event.stopPropagation();
    begin();
  }

  // A keyboard Enter or Space also fires a click (detail 0); the keydown already handled it.
  loader.addEventListener('click', (event) => {
    if (event.detail !== 0) begin();
  });
  window.addEventListener('keydown', onKey, true);
}
