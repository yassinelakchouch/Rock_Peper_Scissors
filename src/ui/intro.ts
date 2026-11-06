export type IntroEnd = 'done' | 'skip' | 'play';

type Options = {
  count: number;
  hold: number;
  show: (index: number) => void;
  end: (reason: IntroEnd) => void;
};

// Board R-06: after the loader the game acts a round out by itself, one scene per hold; it ends on its own, on Skip, or when a hand is played.
export function createIntro({ count, hold, show, end }: Options) {
  let index = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running = false;

  const go = (next: number) => {
    clearTimeout(timer);
    if (next >= count) return stop('done');
    index = Math.max(0, next);
    show(index);
    timer = setTimeout(() => go(index + 1), hold);
  };

  function stop(reason: IntroEnd) {
    if (!running) return;
    running = false;
    clearTimeout(timer);
    end(reason);
  }

  return {
    get running() {
      return running;
    },
    start() {
      running = true;
      go(0);
    },
    next() {
      if (running) go(index + 1);
    },
    back() {
      if (running) go(index - 1);
    },
    stop,
  };
}
