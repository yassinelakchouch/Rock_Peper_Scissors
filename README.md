# Rock, paper, rival · rps-project002

Rock paper scissors, best of five, against a rival that learns your habits but never sees your move. Two faces react to every round, a ring fills toward the win, and a coin lands when the match is yours.

It started as a 2022 side project, still playable as it was at [`/legacy/`](https://yassinelakchouch.github.io/Rock_Peper_Scissors/legacy/) (linked from the header as "First version"), and was redrawn in 2026: playable by keyboard, no page reloads, our own art.

## Play

| Do | What happens |
| --- | --- |
| Open the page, then tap or press any key | The loading chant: the fists count "Rock… Paper… Scissors…" with rising ticks, then fly into the two rings on "shoot!"; any key during it skips to the arena. With reduced motion: the title, the rings and Play |
| Tap a key, or press 1 2 3 / R P S | Your hand drops in; the rival's sealed pick shuffles for 0.6 s, then both flip |
| Win a round | Your ring fills a third; three wins take the match |
| Reach 2 wins | MATCH POINT, and the ring breathes |
| Win the match | The coin lands; your streak grows; Enter plays again |
| Play the same move a lot | The rival starts countering it, and says so after three reads |

**The rival is fair:** it picks when a round opens, from your past moves only (60 % random, 40 % countering your most played move of the last five). It never sees the move you are about to make.

Badges: First match · Clean sweep (3–0) · Comeback (from 0–2) · Mind reader (5 rounds won against its read).

## Stack

Vite 8 · TypeScript 7 (strict) · Tailwind CSS v4 (`@theme` tokens) · a pure match reducer · SVG faces, hands and rings drawn for this game · CSS keyframes for every moment · Web Audio for the sound effects · `localStorage` for stats, badges and sound · Vitest and Playwright.

## Run

```sh
npm ci
npm run dev        # http://localhost:5181
npm test           # rules, match, rival, stats, storage, sound, parts
npm run test:e2e   # flows on desktop and phone, in the installed Chrome
npm run build
```

## Layout

```
src/game    rules, the match reducer, the rival, stats and badges, storage
src/sound   the nine synthesized effects
src/ui      faces, hands, the ring and coins as SVG
src/app.ts  the page: rounds, motion, sound, keys and Stats
e2e/        Playwright flows
public/legacy/  the 2022 version, served at /legacy/
docs/       the plan
```
