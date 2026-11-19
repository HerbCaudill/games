# Games

A personal client for five NYT daily games, in this order: Crossword, Pips, Spelling Bee, Connections and Letter Boxed. It plays the real daily puzzles from Herb's NYT subscription, with its own look rather than NYT's.

## Running it

`pnpm dev` starts everything. In development the puzzle API is a Vite plugin (`server/nytApiPlugin.ts`), so there is no separate server process. In production it is a Vercel function (`api/[game]/[date].ts`); `vercel.json` sends every other path to the app.

The API needs each player's own NYT token: the value of the `NYT-S` cookie from a signed-in nytimes.com session. The server never stores it, in development or production. The app asks for it on first load, saves it in localStorage on each device, asks again when the API answers 401, and sends it in the `X-NYT-Token` header. Playwright's `e2e/mockApi.ts` saves a test token before each page loads.

Spelling Bee hints are written by Claude with the server's `ANTHROPIC_API_KEY`: in `.env` for development and a Vercel environment variable in production. Without it, the hints route answers 503 and everything else works.

## Architecture

- `server/` fetches each game's NYT feed with the token and converts it to the app's own types in `src/types.ts`. Routes are `/api/<resource>/<YYYY-MM-DD>`, where a resource is a game, `spelling-bee-hints` (Claude's clues, written once per puzzle per server instance; the prompt came from Spelling Bee Buddy), `spelling-bee-stats` (the share of NYT players who found each word) or `<game>-progress` (the player's progress in the NYT account, which `PUT` saves back; see below). Each `parse*.ts` handles one feed. `handleApiRequest` serves both the dev plugin and the Vercel function. NYT's puzzle feeds answer without any token, so before serving a puzzle it checks the token against an NYT account endpoint and trusts an accepted token for an hour. The token is the API's only access control.
- `src/games/<game>/` holds each game. `logic/` has the pure game rules, one function per file, tested in `logic/tests/`. The `.tsx` files are the UI.
- `src/lib/` holds shared hooks: API requests (`useApi`, and `usePuzzle` on top of it, cached in localStorage for offline use), saved progress (`usePersistentState`), and routing (`useRoute`).
- Crossword, Spelling Bee and Connections progress syncs with the NYT account through NYT's games state API (`GET svc/games/state/<game>/latests?puzzle_ids=<id>`, `POST svc/games/state`), so a puzzle can be started in one place and finished in the other and counts toward NYT stars, streaks and stats. NYT's web client keeps Pips and Letter Boxed only in localStorage, so they can't sync. `server/<game>Progress.ts` converts each game's NYT record to and from the shapes in `src/types.ts`, keeping NYT fields the app doesn't track; `useNytSync` pulls NYT's progress when a puzzle opens, merges it with the device's (each game's `logic/mergeSync.ts`), and saves changes once play pauses. The API is unofficial: a write goes to Herb's real account, so check any converter change against real records read-only (fetch, convert both ways, compare) before shipping it.
- Progress lives in localStorage under `progress:<game>:<date>`, menu status under `status:<game>:<date>`, time spent under `time:<game>:<date>` (Crossword and Pips keep it in their progress instead), Spelling Bee hints under `hints:spelling-bee:<date>`, and the NYT token under `nyt-token`.

## NYT feeds

| Game         | Source                                               | Dates                   |
| ------------ | ---------------------------------------------------- | ----------------------- |
| Crossword    | `svc/crosswords/v6/puzzle/daily/<date>.json`         | Any                     |
| Pips         | `svc/pips/v1/<date>.json`                            | Any                     |
| Spelling Bee | `svc/spelling-bee/v1/active.json`                    | This week and last week |
| Connections  | `svc/connections/v2/<date>.json`                     | Any                     |
| Letter Boxed | `window.gameData` in the `puzzles/letter-boxed` page | Today only              |

Dates follow New York time (`src/lib/nytToday.ts`). Keep real NYT puzzle content out of the repository: tests use the small synthetic puzzles in `e2e/mockApi.ts` and the test files.

## Commands

- `pnpm test` runs Vitest; `pnpm test:pw` runs Playwright on desktop Chrome, Android and iPhone profiles with the API mocked.
- `pnpm test:all` runs typecheck, unit tests, Playwright and the PWA update check.
- `pnpm lint` runs Oxlint with Herb's shared rules; `pnpm format` runs Oxfmt.

## Task tracking

This repository uses Beads (`bd`) for durable task tracking. Run `bd prime` for the workflow.
