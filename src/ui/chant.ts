import type { SoundName } from '../sound/sound';
import { CHANT, CHANT_MS, FLY_MS, loaderMarkup, stageUnit } from './loader';

const ARENA_OPEN = 'Best of five against the rival. Pick rock, paper or scissors.';

// Board R-04, on every load: the first tap or key opens audio and starts the count; any key during it skips to the arena.
export function runLoader(play: (name: SoundName) => void, ready: () => void) {
  const root = document.documentElement;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.insertAdjacentHTML('beforeend', loaderMarkup(still));
  const loader = document.querySelector<HTMLButtonElement>('.loader')!;
  const word = loader.querySelector<HTMLElement>('.loader-word');
  const sub = loader.querySelector<HTMLElement>('.loader-sub');
  const fists = loader.querySelector<HTMLElement>('.loader-fists');
  const timers: number[] = [];
  let state: 'waiting' | 'chanting' | 'done' = 'waiting';

  // The stage keeps the board's 720 by 420 proportions: every size in the CSS is a board number times --u.
  const fit = () => loader.style.setProperty('--u', stageUnit(innerWidth, innerHeight).toFixed(3));
  fit();
  window.addEventListener('resize', fit);

  const finish = () => {
    if (state === 'done') return;
    state = 'done';
    timers.forEach((id) => window.clearTimeout(id));
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', fit);
    root.classList.remove('chant');
    loader.classList.add('loader-leave');
    window.setTimeout(() => loader.remove(), 200);
    // The arena takes over: its keys rise in 60 ms apart and it says what it is (rules, board R-04).
    const keys = document.querySelector('#keys');
    if (keys && !still) {
      keys.classList.add('keys-rise');
      window.setTimeout(() => keys.classList.remove('keys-rise'), 700);
    }
    const live = document.querySelector('#live');
    if (live) live.textContent = ARENA_OPEN;
    ready();
  };

  // Frame 05: each fist leaves the count where it stands and arcs into its ring as the rings open around "shoot!".
  const shoot = () => {
    const flying = [...loader.querySelectorAll<HTMLElement>('.loader-fist')].map((fist) => {
      const r = fist.getBoundingClientRect();
      const copy = fist.cloneNode(true) as HTMLElement;
      copy.classList.add('loader-flying');
      Object.assign(copy.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
      loader.append(copy);
      return { copy, side: fist.dataset.fist, from: r };
    });
    loader.classList.add('loader-shoot');
    requestAnimationFrame(() => {
      for (const { copy, side, from } of flying) {
        const target = loader.querySelector(`.loader-row .loader-ring[data-ring="${side}"]`);
        if (!target) continue;
        const b = target.getBoundingClientRect();
        const dx = b.left + b.width / 2 - (from.left + from.width / 2);
        const dy = b.top + b.height / 2 - (from.top + from.height / 2);
        copy
          .animate(
            [
              { transform: 'translate(0, 0) scale(1)' },
              { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - from.height * 0.7}px) scale(0.8)`, offset: 0.5 },
              { transform: `translate(${dx}px, ${dy}px) scale(0.4)`, opacity: 0 },
            ],
            { duration: FLY_MS, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' },
          )
          .finished.then(() => copy.remove(), () => copy.remove());
      }
    });
  };

  // Frames 02-04: one fist rises on each beat, the rival's first, while the other rests; "tick" names what you hear; the last beat tightens the stage.
  const beat = (step: (typeof CHANT)[number], index: number) => {
    if (word) word.textContent = step.word;
    if (sub) sub.textContent = 'tick';
    if (fists) fists.dataset.beat = String((index + 1) % 2);
    loader.classList.toggle('loader-tight', index === CHANT.length - 2);
    play(step.sound);
    if (index === CHANT.length - 1) shoot();
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
