// Every moment's sound (docs/PLAN.md, "Motion and sound"), synthesized: no files, nothing to load.
export const SOUNDS = ['tap', 'tick', 'reveal', 'win', 'lose', 'draw', 'bell', 'coin', 'fanfare'] as const;
type SoundName = (typeof SOUNDS)[number];
type Note = { from: number; to?: number; at: number; length: number; gain: number; wave: OscillatorType };

const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;

export function tone(name: SoundName): Note[] {
  switch (name) {
    case 'tap':
      return [{ from: 420, to: 360, at: 0, length: 0.05, gain: 0.06, wave: 'triangle' }];
    case 'tick':
      return [0, 0.16, 0.32].map((at, i) => ({ from: 880 + i * 110, at, length: 0.04, gain: 0.04, wave: 'square' as const }));
    case 'reveal':
      return [{ from: 300, to: 900, at: 0, length: 0.14, gain: 0.05, wave: 'sine' }];
    case 'win':
      return [
        { from: E5, at: 0, length: 0.1, gain: 0.07, wave: 'triangle' },
        { from: G5, at: 0.08, length: 0.1, gain: 0.07, wave: 'triangle' },
        { from: C6, at: 0.16, length: 0.2, gain: 0.07, wave: 'triangle' },
      ];
    case 'lose':
      return [{ from: 220, to: 120, at: 0, length: 0.3, gain: 0.07, wave: 'triangle' }];
    case 'draw':
      return [{ from: 440, at: 0, length: 0.08, gain: 0.05, wave: 'sine' }, { from: 440, at: 0.12, length: 0.08, gain: 0.05, wave: 'sine' }];
    case 'bell':
      return [{ from: C6, to: C6 * 0.98, at: 0, length: 0.4, gain: 0.05, wave: 'sine' }];
    case 'coin':
      return [{ from: 988, at: 0, length: 0.07, gain: 0.06, wave: 'square' }, { from: 1319, at: 0.07, length: 0.22, gain: 0.06, wave: 'square' }];
    case 'fanfare':
      return [C5, E5, G5, C6].map((from, i) => ({ from, at: i * 0.12, length: i === 3 ? 0.4 : 0.11, gain: 0.07, wave: 'triangle' as const }));
  }
}

// Made on the first sound (after a key or a tap), as browsers require; muted plays nothing.
export function createSound(muted = false) {
  let context: AudioContext | null = null;
  return {
    get muted() {
      return muted;
    },
    setMuted(next: boolean) {
      muted = next;
    },
    play(name: SoundName) {
      if (muted || typeof AudioContext === 'undefined') return;
      context ??= new AudioContext();
      if (context.state === 'suspended') void context.resume();
      const now = context.currentTime;
      for (const note of tone(name)) {
        const start = now + note.at;
        const end = start + note.length;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = note.wave;
        oscillator.frequency.setValueAtTime(note.from, start);
        if (note.to) oscillator.frequency.exponentialRampToValueAtTime(note.to, end);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(note.gain, start + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(start);
        oscillator.stop(end + 0.02);
      }
    },
  };
}
