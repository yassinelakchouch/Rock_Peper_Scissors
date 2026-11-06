// Board R-05 · #30: a short buzz as a round lands, on phones that allow it (iPhone browsers do not); Sound off or reduced motion keep it still.
export const BUZZ = {
  win: [40, 60, 40],
  lose: [160],
  draw: [30],
  match: [40, 60, 40, 60, 200],
} as const satisfies Record<string, readonly number[]>;

export type BuzzName = keyof typeof BUZZ;

export function buzz(name: BuzzName, allowed: boolean, vibrate: ((pattern: number[]) => boolean) | undefined = navigator.vibrate?.bind(navigator)) {
  if (allowed && vibrate) vibrate([...BUZZ[name]]);
}
