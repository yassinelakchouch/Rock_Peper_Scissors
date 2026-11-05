import type { Badge } from '../game/stats';

export const BADGE_TEXT: Record<Badge, { coin: string; name: string; why: string }> = {
  'first-match': { coin: '1', name: 'First match', why: 'your first match, played to the end' },
  'clean-sweep': { coin: '3–0', name: 'Clean sweep', why: 'a match won without losing a round' },
  comeback: { coin: '↺', name: 'Comeback', why: 'a match won after trailing 0–2' },
  'mind-reader': { coin: '★', name: 'Mind reader', why: 'five rounds won against its read' },
};
