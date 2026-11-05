import { isMatchPoint, newMatch, play, WINS_NEEDED, type Match } from './game/match';
import { rivalPick, wasRead } from './game/rival';
import { MOVES, verdict, type Move } from './game/rules';
import { afterMatch, afterRound, BADGES, type Badge, type Stats } from './game/stats';
import { load, save } from './game/storage';
import { createSound } from './sound/sound';
import { runLoader } from './ui/chant';
import { BADGE_TEXT } from './ui/copy';
import { createQueue } from './ui/queue';
import { coin, face, hand, ring, ringArc, type Mood } from './ui/parts';

const SEAL_MS = 600;
const IDLE_MS = 20_000;
const SHUFFLE_MS = 150;
const KEY_MOVES: Record<string, Move> = { r: 'rock', '1': 'rock', p: 'paper', '2': 'paper', s: 'scissors', '3': 'scissors' };

const $ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) => root.querySelector<T>(selector)!;
const $$ = <T extends Element = HTMLElement>(selector: string) => [...document.querySelectorAll<T>(selector)];

// Restarts a CSS animation on an element, even when the class is already there.
function replay(node: Element, className: string) {
  node.classList.remove(className);
  void (node as HTMLElement).offsetWidth;
  node.classList.add(className);
}

export function start() {
  const saved = load();
  const sound = createSound(saved.muted);
  let stats: Stats = saved.stats;
  const yourMoves: Move[] = [];
  const reads: boolean[] = [];
  let pick = rivalPick(yourMoves);
  let match: Match = newMatch(pick.move);
  let shuffle = 0;
  let idle = 0;

  const arena = $('#arena');
  const side = (name: 'you' | 'rival') => $(`[data-side="${name}"]`, arena);
  const keys = $$<HTMLButtonElement>('#keys .key');
  const persist = () => save({ stats, muted: sound.muted });
  // Everything said in one moment (the result, match point, the match, badges) is spoken as one message, in order.
  let spoken: string[] = [];
  const announce = (text: string) => {
    if (spoken.length === 0) queueMicrotask(() => {
      $('#live').textContent = spoken.join(' ');
      spoken = [];
    });
    spoken.push(text);
  };

  // ---------- drawing ----------
  for (const name of ['you', 'rival'] as const) $('.ring-art', side(name)).innerHTML = ring(name);
  for (const key of keys) $('.key-art', key).innerHTML = hand(key.dataset.move as Move);

  function setFace(name: 'you' | 'rival', mood: Mood, react = false) {
    const slot = $('[data-face]', side(name));
    if (slot.dataset.mood !== mood) {
      slot.innerHTML = face(mood);
      slot.dataset.mood = mood;
    }
    if (react) replay(slot, 'react');
  }

  function setBadge(name: 'you' | 'rival', content: Move | '?' | null, motion?: 'drop' | 'flip') {
    const slot = $('[data-badge]', side(name));
    slot.dataset.content = content ?? '';
    slot.innerHTML = content === null ? '' : content === '?' ? '<span class="sealed">?</span>' : hand(content);
    slot.hidden = content === null;
    if (motion) replay(slot, motion);
  }

  function setRing(name: 'you' | 'rival', wins: number, pulse = false) {
    const art = $('.ring-svg', side(name));
    const { dash, knob } = ringArc(wins);
    const progress = $('.ring-progress', art);
    progress.setAttribute('stroke-dasharray', `${dash.toFixed(1)} 999`);
    // A round line cap draws a dot even at zero length: the empty track shows nothing.
    progress.setAttribute('opacity', wins > 0 ? '1' : '0');
    const knobGroup = $('.ring-knob', art);
    knobGroup.setAttribute('transform', `translate(${knob.x.toFixed(1)} ${knob.y.toFixed(1)})`);
    knobGroup.setAttribute('opacity', wins > 0 ? '1' : '0');
    if (pulse) replay(knobGroup, 'knob-pulse');
    side(name).querySelectorAll('[data-pips] i').forEach((pip, i) => pip.classList.toggle('on', i < wins));
  }

  function setPoint() {
    for (const name of ['you', 'rival'] as const) {
      const wins = name === 'you' ? match.youWins : match.rivalWins;
      const on = isMatchPoint(match) && wins === WINS_NEEDED - 1;
      $('.ring-svg', side(name)).toggleAttribute('data-point', on);
      $('[data-chip]', side(name)).hidden = !on;
    }
  }

  function renderHistory() {
    $$('#history li').forEach((mark, i) => {
      const round = match.rounds[i];
      const state = round ? round.outcome : '';
      if (mark.dataset.state !== state) {
        mark.dataset.state = state;
        if (state) replay(mark, 'pop');
      }
      mark.setAttribute('aria-label', round ? `Round ${i + 1}: ${round.outcome === 'win' ? 'won' : round.outcome === 'lose' ? 'lost' : 'draw'}` : `Round ${i + 1}: to play`);
    });
  }

  function renderStats() {
    for (const list of $$('[data-stats]')) {
      list.innerHTML = [
        ['Matches', stats.matches],
        ['Won', stats.won],
        ['Streak', stats.streak],
        ['Best streak', stats.bestStreak],
      ]
        .map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`)
        .join('');
    }
    // A tooltip never shows on a phone: each coin carries its name, and the Stats sheet writes them out.
    for (const row of $$('[data-badges]')) {
      row.innerHTML = BADGES.map((badge) => {
        const { coin: label, name } = BADGE_TEXT[badge];
        const earned = stats.badges.includes(badge);
        return `<span class="badge-coin" role="img" aria-label="${name}, ${earned ? 'earned' : 'not yet'}" data-earned="${earned}">${coin(label)}</span>`;
      }).join('');
    }
    for (const list of $$('[data-badge-list]')) {
      list.innerHTML = BADGES.map((badge) => {
        const { coin: label, name, why } = BADGE_TEXT[badge];
        const earned = stats.badges.includes(badge);
        return `<li data-earned="${earned}"><span class="badge-coin" data-earned="${earned}" aria-hidden="true">${coin(label)}</span><span class="grid gap-0.5"><strong>${name}</strong><span class="badge-why">${why}</span></span><span class="badge-state">${earned ? 'Earned' : 'Not yet'}</span></li>`;
      }).join('');
    }
  }

  function setLine(line: string, sub: string, accent = false) {
    $('#line').textContent = line;
    $('#line').toggleAttribute('data-accent', accent);
    $('#sub').textContent = sub;
  }

  function setPhase() {
    arena.dataset.phase = match.phase;
    $('#round').textContent = match.phase === 'over' ? (match.winner === 'you' ? 'Match won' : 'Match lost') : `Round ${match.rounds.length + (match.phase === 'revealed' ? 0 : 1)}`;
    for (const key of keys) key.toggleAttribute('data-picked', match.picked === key.dataset.move && match.phase !== 'open');
  }

  // ---------- badges ----------
  const toasts = createQueue<Badge>((badge, done) => {
    const { coin: label, name, why } = BADGE_TEXT[badge];
    const toast = $('#toast');
    toast.innerHTML = `<span class="toast-coin">${coin(label)}</span><span class="grid gap-0.5"><strong>Badge · ${name}</strong><span class="font-mono text-xs text-muted">${why}</span></span>`;
    toast.hidden = false;
    replay(toast, 'drop');
    sound.play('coin');
    window.setTimeout(() => {
      toast.hidden = true;
      done();
    }, 3000);
  });

  function earn(badges: Badge[]) {
    badges.forEach((badge) => announce(`Badge earned: ${BADGE_TEXT[badge].name}.`));
    if (badges.length) renderStats();
    toasts.push(...badges);
  }

  // ---------- the round ----------
  function reveal() {
    window.clearInterval(shuffle);
    const reading = pick.reading;
    match = play(match, { type: 'reveal' });
    reads.push(reading);
    const round = match.rounds.at(-1)!;
    sound.play('reveal');
    window.setTimeout(() => sound.play(round.outcome === 'win' ? 'win' : round.outcome === 'lose' ? 'lose' : 'draw'), 140);

    setBadge('rival', round.rival, 'flip');
    const moods: Record<typeof round.outcome, [Mood, Mood]> = { win: ['win', 'lose'], lose: ['lose', 'smug'], draw: ['draw', 'draw'] };
    setFace('you', moods[round.outcome][0], true);
    setFace('rival', moods[round.outcome][1], true);
    if (round.outcome === 'win') setRing('you', match.youWins, true);
    if (round.outcome === 'lose') setRing('rival', match.rivalWins, true);

    const roundResult = afterRound(stats, round, reading);
    stats = roundResult.stats;

    const score = `${match.youWins}–${match.rivalWins}`;
    const lead = match.youWins === match.rivalWins ? `level at ${score}` : match.youWins > match.rivalWins ? `you lead ${score}` : `the rival leads ${score}`;
    const sub = round.outcome === 'draw' ? 'no point · play the round again' : `${round.outcome === 'win' ? '+1' : 'the rival scores'} · ${lead}`;
    setLine(verdict(round.you, round.rival), sub, round.outcome === 'win');
    // Spoken apart from the sub line: "+1 · 2–0" reads aloud as symbols.
    const said = round.outcome === 'draw' ? 'No point, play the round again.' : `${round.outcome === 'win' ? 'You score' : 'The rival scores'}, ${lead.replace('–', ' to ')}.`;
    announce(`${verdict(round.you, round.rival)}. ${said}`);
    earn(roundResult.earned);
    renderHistory();
    setPoint();
    if (isMatchPoint(match)) {
      announce('Match point.');
      window.setTimeout(() => sound.play('bell'), 420);
    }

    const extra = $('#extra');
    extra.innerHTML = '';
    if (match.phase !== 'over' && wasRead(match.rounds, reads)) {
      extra.innerHTML = `<span class="hint">● mix it up: it learns your last five moves</span>`;
      replay(extra.firstElementChild!, 'drop');
    }

    if (match.phase === 'over') finishMatch();
    setPhase();
    persist();
    resetIdle();
  }

  function finishMatch() {
    const won = match.winner === 'you';
    const result = afterMatch(stats, match);
    stats = result.stats;
    persist();
    renderStats();
    setLine(won ? `You won ${match.youWins}–${match.rivalWins}` : `The rival won ${match.rivalWins}–${match.youWins}`, won ? `streak ${stats.streak} · best streak ${stats.bestStreak}` : 'your streak resets · the best is kept', won);
    const winner = won ? 'you' : 'rival';
    const slot = $('[data-coin]', side(winner));
    slot.innerHTML = `${coin()}<span class="sparkle" aria-hidden="true"></span>`;
    slot.hidden = false;
    replay(slot, 'coin-drop');
    window.setTimeout(() => sound.play(won ? 'fanfare' : 'lose'), 480);
    $('#extra').innerHTML = `<button type="button" class="again" data-again>Play again · Enter</button>`;
    earn(result.earned);
    announce(`${won ? 'You won the match' : 'The rival won the match'}, ${match.youWins} to ${match.rivalWins}.`);
  }

  function shuffleRival() {
    let i = 0;
    setBadge('rival', '?', 'drop');
    const slot = $('[data-badge]', side('rival'));
    slot.classList.add('shuffle');
    sound.play('tick');
    shuffle = window.setInterval(() => {
      slot.innerHTML = hand(MOVES[i % 3]);
      i += 1;
    }, SHUFFLE_MS);
    window.setTimeout(() => slot.classList.remove('shuffle'), SEAL_MS);
  }

  function openRound() {
    pick = rivalPick(yourMoves);
    match = play(match, match.phase === 'over' ? { type: 'again', rival: pick.move } : { type: 'next', rival: pick.move });
    if (match.rounds.length === 0) {
      reads.length = 0;
      setRing('you', 0);
      setRing('rival', 0);
      for (const name of ['you', 'rival'] as const) $('[data-coin]', side(name)).hidden = true;
    }
    setBadge('you', null);
    setBadge('rival', null);
    setFace('you', 'idle');
    setFace('rival', 'idle');
    $('#extra').innerHTML = '';
    renderHistory();
    setPoint();
  }

  function choose(move: Move) {
    resetIdle();
    if (match.phase === 'sealed') {
      replay($(`.key[data-move="${move}"]`), 'nudge');
      return;
    }
    if (match.phase !== 'open') openRound();
    match = play(match, { type: 'pick', move });
    yourMoves.push(move);
    sound.play('tap');
    setBadge('you', move, 'drop');
    setFace('you', 'idle');
    setFace('rival', 'think', true);
    setLine('Rival is picking…', 'it chose before you did: it reads your history, never this move');
    shuffleRival();
    setPhase();
    window.setTimeout(reveal, SEAL_MS);
  }

  function playAgain() {
    if (match.phase !== 'over') return;
    openRound();
    setLine('Pick your move', 'first to three wins the match');
    setPhase();
    keys[0].focus();
  }

  // ---------- idle: the rival dozes, the keys breathe once ----------
  function resetIdle() {
    window.clearTimeout(idle);
    const rivalSlot = $('[data-face]', side('rival'));
    rivalSlot.classList.remove('doze');
    idle = window.setTimeout(() => {
      if (match.phase !== 'open' && match.phase !== 'revealed') return;
      setFace('rival', 'bored');
      rivalSlot.classList.add('doze');
      keys.forEach((key, i) => window.setTimeout(() => replay(key, 'breathe'), i * 120));
      setLine('Your move?', '20 s quiet · the rival is getting bored');
    }, IDLE_MS);
  }

  // ---------- wiring ----------
  for (const key of keys) {
    key.addEventListener('click', () => choose(key.dataset.move as Move));
    key.addEventListener('pointerenter', () => match.phase === 'open' && setFace('you', 'think'));
    key.addEventListener('pointerleave', () => match.phase === 'open' && setFace('you', 'idle'));
  }
  $('#extra').addEventListener('click', (event) => {
    if ((event.target as Element).closest('[data-again]')) playAgain();
  });

  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const dialog = $<HTMLDialogElement>('#stats');
    if (dialog.open) return;
    if (event.key === 'Enter' && match.phase === 'over') {
      event.preventDefault();
      playAgain();
      return;
    }
    const move = KEY_MOVES[event.key.toLowerCase()];
    if (!move) return;
    event.preventDefault();
    const key = $(`.key[data-move="${move}"]`);
    key.dataset.pressed = '';
    window.setTimeout(() => delete key.dataset.pressed, 120);
    choose(move);
  });

  $('#sound').addEventListener('click', () => {
    sound.setMuted(!sound.muted);
    $('#sound').textContent = sound.muted ? 'Sound off' : 'Sound on';
    $('#sound').setAttribute('aria-pressed', String(!sound.muted));
    sound.play('tap');
    persist();
  });

  const dialog = $<HTMLDialogElement>('#stats');
  $('#open-stats').addEventListener('click', () => dialog.showModal());
  $('[data-close]', dialog).addEventListener('click', () => dialog.close());

  $('#sound').textContent = sound.muted ? 'Sound off' : 'Sound on';
  $('#sound').setAttribute('aria-pressed', String(!sound.muted));
  setFace('you', 'idle');
  setFace('rival', 'idle');
  setBadge('you', null);
  setBadge('rival', null);
  setRing('you', 0);
  setRing('rival', 0);
  renderHistory();
  renderStats();
  setPhase();
  resetIdle();
  runLoader((name) => sound.play(name), (shown) => shown && keys[0].focus());
}
