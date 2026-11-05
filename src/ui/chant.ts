import type { SoundName } from '../sound/sound';
import { CHANT, CHANT_MS, FLY_MS, loaderMarkup } from './loader';

// Board R-04, on every load: the first tap or key opens audio and starts the count; any key during it skips to the arena.
export function runLoader(play: (name: SoundName) => void, ready: () => void) {
  const root = document.documentElement;
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
    root.classList.remove('chant');
    loader.classList.add('loader-leave');
    window.setTimeout(() => loader.remove(), 200);
    ready();
  };

  // On "shoot!" the rings open beside the word and each fist arcs from where it is into its own ring.
  const fly = () => {
    for (const fist of loader.querySelectorAll<HTMLElement>('.loader-fist')) {
      const target = loader.querySelector(`.loader-ring[data-ring="${fist.dataset.fist}"]`);
      if (!target) continue;
      const a = fist.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      const dx = b.left + b.width / 2 - (a.left + a.width / 2);
      const dy = b.top + b.height / 2 - (a.top + a.height / 2);
      const from = getComputedStyle(fist).transform;
      fist.animate(
        [
          { transform: from === 'none' ? 'translate(0, 0)' : from },
          { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 60}px) scale(0.8)`, offset: 0.5 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.4)`, opacity: 0 },
        ],
        { duration: FLY_MS, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' },
      );
    }
  };

  // The fists take turns on each beat; the last beat draws them close; "shoot!" opens the rings.
  const beat = (step: (typeof CHANT)[number], index: number) => {
    if (word) word.textContent = step.word;
    if (fists) {
      fists.dataset.beat = String(index % 2);
      fists.classList.toggle('tight', index === CHANT.length - 2);
    }
    play(step.sound);
    if (index === CHANT.length - 1) {
      loader.classList.add('loader-shoot');
      requestAnimationFrame(fly);
    }
  };

  const begin = () => {
    if (state === 'chanting') return finish();
    if (state !== 'waiting') return;
    if (still) return finish();
    state = 'chanting';
    loader.classList.add('loader-chanting');
    CHANT.forEach((step, index) => timers.push(window.setTimeout(() => beat(step, index), step.at)));
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
