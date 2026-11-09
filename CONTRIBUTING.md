# Contributing

How a change lands in this repo, in short.

## Run it

```sh
npm ci             # the exact versions in package-lock.json
npm run dev        # http://localhost:5181
npm test           # Vitest: rules, match, rival, stats, storage, sound, ui parts
npm run test:e2e   # Playwright on desktop and phone, in the installed Chrome; it starts the dev server itself
npm run build      # tsc type check, then the Vite build
```

CI runs `npm ci`, `npm run build`, `npm test`, `npm run test:e2e` and `npm audit --audit-level=high` on every pull request. All of them pass before a merge.

## Issues and milestones

Work starts from an issue. Each design board is a milestone (`Board R-05`, `Board R-06`, and so on), and an issue sits on the milestone of the board that draws it. Labels name the part it touches: `loader`, `arena`, `sound`, `motion`, `a11y`, `test`, `bug`, `documentation`.

## Commits

```
<type>(<scope>): <change> (#issue) so <observable result>
```

- All lowercase, plain words, no emoji.
- Type: `feat`, `fix`, `test`, `docs`, `chore`, `refactor`. Scope: the part touched, such as `arena`, `match`, `storage`, `copy`, `e2e`, `readme`.
- The `so` clause is what a reviewer can check once the change is in.
- Example from the history: `feat(storage): remember the opening scenes once seen (#44) so they never autoplay twice on a device`.

## One concern per commit

A commit does one thing: a feature, a fix, its test, a rename. A refactor never rides along with a feature. One branch and one pull request per change, naming its issue.

## Tests with each change

- A change in `src/game`, `src/sound` or `src/ui` comes with its Vitest file beside it (`match.ts` and `match.test.ts`).
- A change a player can see or do comes with a Playwright flow in `e2e/`.
- Anything that moves is checked with reduced motion too: the loader and the opening scenes have a calm path (`reducedMotion: 'reduce'` in the specs).
