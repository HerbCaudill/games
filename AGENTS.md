# Games

A personal client for five NYT daily games, in this order: Crossword, Pips, Spelling Bee, Connections and Letter Boxed. It plays the real daily puzzles from Herb's NYT subscription, with its own look rather than NYT's.

## Running it

`pnpm dev` starts everything. The puzzle API is a Vite plugin (`server/nytApiPlugin.ts`), so there is no separate server process.

The API needs `NYT_TOKEN` in `.env` (git-ignored; see `.env.example`). It is the value of the `NYT-S` cookie from a signed-in nytimes.com session. Spelling Bee Buddy (`../spelling-bee-buddy/.env`, `VITE_NYT_TOKEN`) uses the same token.

## Architecture

- `server/` fetches each game's NYT feed with the token and converts it to the app's own types in `src/types.ts`. Routes are `/api/<game>/<YYYY-MM-DD>`. Each `parse*.ts` handles one feed.
- `src/games/<game>/` holds each game. `logic/` has the pure game rules, one function per file, tested in `logic/tests/`. The `.tsx` files are the UI.
- `src/lib/` holds shared hooks: puzzle loading (`usePuzzle`, cached in localStorage for offline use), saved progress (`usePersistentState`), and routing (`useRoute`).
- Progress lives in localStorage under `progress:<game>:<date>`, and menu status under `status:<game>:<date>`.

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
