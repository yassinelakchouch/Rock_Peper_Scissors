# Rock, paper, rival: the plan

The 2022 game (kept in `public/legacy/`, playable at `/legacy/`) reloaded the page after every round, made its moves out of bare SVG icons a keyboard couldn't reach, and on a phone clipped two of the three moves off screen. This rebuild keeps it one small page and gives a match a reason to be played again: two faces that react, a ring that fills toward the win, and a rival that learns your habits but never sees your move.

The design lives on the Design canvas, page "Other personal project": R-01 (study), R-02 (storyboard), R-03 (hi-fi and parts).

## Stack

| Part | Choice | Why |
| --- | --- | --- |
| Build | Vite 8, dev server on port 5181 | Static output for GitHub Pages |
| Language | TypeScript 7, strict | Rules, rival and match are pure functions with types |
| Styles | Tailwind CSS v4, `@theme` tokens in `src/style.css` | One CSS file: ground, cream, accent |
| State | One pure reducer: open → picked → revealed → match over | Every transition is a test |
| Rival | `rivalPick(history, random)`, called at round start | It can't see the move you are about to make |
| Art | Faces, hands, ring and coins drawn in SVG for this game | No borrowed icons |
| Motion | CSS transitions and keyframes on the SVG parts | Small, cheap, every state has its move |
| Sound | Web Audio synthesis | No files; one switch mutes it |
| Storage | `localStorage` in `try`/`catch` | Stats, badges and sound stay on the device |
| Tests | Vitest (rules, rival, match, stats), Playwright in the installed Chrome (flows) | Logic proven before the page |
| CI | GitHub Actions: build, unit, end-to-end, audit | Every PR proves itself |

## Steps, one PR each into `dev`

1. **Setup:** the 2022 files move to `legacy/`; Vite, TypeScript, Tailwind, Vitest, Playwright, CI and this plan.
2. **Rules and match:** who beats whom, and the match reducer, test first.
3. **Rival, stats and badges:** the fair rival, streaks, badges and what is saved.
4. **Parts:** faces, hands, the ring and coins as SVG, with their animations.
5. **Page:** the arena, keys, keyboard, reveal, rounds, match over, idle, Stats, sound.
6. **Tests and release:** end-to-end flows, README, the Pages workflow; then `dev` → `main`.

## Rules (board R-02)

| Rule | Value |
| --- | --- |
| Match | Best of five: first to three wins; a draw replays the round |
| Rival | Fixed at round start: 60 % random, 40 % counters your most played move of the last five |
| Fairness | The rival's pick is sealed before yours; it never reads the current move |
| Pace | Tap → 0.6 s sealed → reveal → result; the next round waits for you |
| Streak | Matches won in a row; a loss resets it, the best is kept |
| Badges | First match · Clean sweep (3–0) · Comeback (won from 0–2) · Mind reader (5 rounds won against its guess) |

## Motion and sound (every state has its move)

| Moment | Motion | Sound |
| --- | --- | --- |
| Opening the page (board R-04) | on a stage kept at the board's 720 x 420 proportions: two fists pump together; after a tap one rises per beat on "Rock… Paper… Scissors…" while the stage tightens, then they fly into two rings around an orange "shoot!" and the faces open their eyes; the arena's keys rise in, 60 ms apart; reduced motion shows the title, two rings at ease and Play | three rising ticks, then the reveal whoosh; the arena announces itself to screen readers |
| Hover, focus | the key lifts with an orange ring; your face starts to think | none |
| Press | the key sinks | a soft tap |
| Your pick | your hand drops into its badge with a small bounce | tap |
| Rival sealed | its badge shuffles the three hands for 0.6 s | three ticks |
| Reveal | both hands flip in; faces squash and stretch into their reaction | a short whoosh |
| Round won · lost · draw | the winner's ring fills a third and its knob pulses | rising chime · low thud · flat blip |
| Match point | the leader's ring breathes a halo | one bell |
| Match won | the coin drops onto the ring, bounces, sparkles | coin and a short fanfare |
| A round mark | each of the five marks pops in | none |
| Idle 20 s | the rival dozes; the keys breathe once | none |

## Cases to try (each one is a test)

| Try | Result |
| --- | --- |
| Rock against scissors | You win the round; your ring fills a third |
| Paper against paper | Draw; nothing fills; the round is played again |
| Win three rounds | Match won; the coin lands; streak +1 |
| Win from 0–2 | Comeback badge |
| Win 3–0 | Clean sweep badge |
| Press 1, 2 or 3, or R, P or S | The same as tapping the key |
| Press keys during a reveal | Ignored until the result is shown |
| Reload in the middle of a match | The match starts again; stats and badges stay |

## Repo flow

Branch → PR into `dev` → CI green → merge. `dev` → `main` releases to GitHub Pages.
