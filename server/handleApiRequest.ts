import type { GameId, SpellingBeeHints, SpellingBeePuzzle } from "../src/types.ts"
import { parseConnections, type RawConnections } from "./parseConnections.ts"
import { parseCrossword, type RawCrossword } from "./parseCrossword.ts"
import { parseLetterBoxed } from "./parseLetterBoxed.ts"
import { parsePips, type RawPips } from "./parsePips.ts"
import { parseSpellingBee, type RawActiveSpellingBees } from "./parseSpellingBee.ts"
import { parseSpellingBeeStats, type RawSpellingBeeStats } from "./parseSpellingBeeStats.ts"

/**
 * Serve `/api/<resource>/<YYYY-MM-DD>`: a game's puzzle from NYT, or a Spelling Bee's hints or
 * player stats.
 */
export async function handleApiRequest(
  /** Request path, such as `/api/pips/2026-11-16`. */
  path: string,
  /** The NYT-S cookie value for the subscriber account. */
  token: string | undefined,
  /** Services the server has set up. */
  services: ApiServices = {},
): Promise<ApiResponse> {
  const match = path.match(/^\/api\/([a-z-]+)\/(\d{4}-\d{2}-\d{2})$/)
  if (!match) return error(404, "Not found")
  const [, resource, date] = match
  const load = loaders[resource as Resource]
  if (!load) return error(404, `Unknown resource: ${resource}`)
  if (!token) return error(401, "An NYT token is required.")
  try {
    await checkToken(token)
    const body = await load(date, (url, as) => fetchNyt(url, as, token), services)
    if (!body) return error(404, `No ${describe(resource as Resource)} for ${date}`)
    return { status: 200, body }
  } catch (e) {
    if (e instanceof TokenRejected) return error(401, "NYT rejected the token.")
    if (e instanceof NotSetUp) return error(503, e.message)
    return error(502, e instanceof Error ? e.message : String(e))
  }
}

/** Write hints for a Spelling Bee once per puzzle, sharing the work between overlapping requests. */
function hintsFor(
  /** The puzzle. */
  puzzle: SpellingBeePuzzle,
  /** Writes clues for the answers. */
  writeHints: HintWriter,
): Promise<SpellingBeeHints> {
  let hints = writtenHints.get(puzzle.date)
  if (!hints) {
    hints = writeHints(puzzle.answers, puzzle.pangrams).then(h => ({ date: puzzle.date, hints: h }))
    writtenHints.set(puzzle.date, hints)
    // A failed attempt shouldn't stop the next request from trying again.
    hints.catch(() => writtenHints.delete(puzzle.date))
  }
  return hints
}

/** Confirm the token belongs to a signed-in NYT account, since the puzzle feeds don't check. */
async function checkToken(
  /** The NYT-S cookie value. */
  token: string,
) {
  if ((verifiedTokens.get(token) ?? 0) > Date.now()) return
  const response = await fetch(ACCOUNT_CHECK_URL, { headers: nytHeaders(token) })
  if (response.status === 401 || response.status === 403) throw new TokenRejected()
  if (response.status >= 500) throw new Error(`NYT returned ${response.status} checking the token`)
  verifiedTokens.set(token, Date.now() + TOKEN_CHECK_MS)
}

/** Fetch an NYT URL as the subscriber, reusing recent responses. */
async function fetchNyt(
  /** The URL. */
  url: string,
  /** How to read the body. */
  as: "json" | "text",
  /** The NYT-S cookie value. */
  token: string,
): Promise<unknown> {
  const cached = cache.get(url)
  if (cached && cached.expires > Date.now()) return cached.value
  const response = await fetch(url, { headers: nytHeaders(token) })
  if (response.status === 401 || response.status === 403) throw new TokenRejected()
  if (response.status === 404) return undefined
  if (!response.ok) throw new Error(`NYT returned ${response.status} for ${url}`)
  const value = as === "json" ? await response.json() : await response.text()
  cache.set(url, { value, expires: Date.now() + CACHE_MS })
  return value
}

/** Headers that make a request as the signed-in NYT account. */
function nytHeaders(
  /** The NYT-S cookie value. */
  token: string,
) {
  return { "User-Agent": USER_AGENT, "nyt-s": token, Cookie: `NYT-S=${token}` }
}

/** Load a Spelling Bee; NYT only publishes answers for the current and previous week. */
async function loadSpellingBee(
  /** Print date as YYYY-MM-DD. */
  date: string,
  /** Fetches NYT URLs. */
  get: Fetcher,
) {
  const raw = await get(`${NYT}/svc/spelling-bee/v1/active.json`, "json")
  return raw ? parseSpellingBee(raw as RawActiveSpellingBees, date) : undefined
}

/** Name a resource in messages, such as "pips puzzle" or "Spelling Bee hints". */
function describe(
  /** The resource. */
  resource: Resource,
) {
  return resource.startsWith("spelling-bee-")
    ? `Spelling Bee ${resource.slice("spelling-bee-".length)}`
    : `${resource} puzzle`
}

/** Build an error response. */
function error(
  /** HTTP status. */
  status: number,
  /** What went wrong. */
  message: string,
): ApiResponse {
  return { status, body: { error: message } }
}

/** NYT refused the subscriber token. */
class TokenRejected extends Error {}

/** The server lacks something a request needs, such as an API key. */
class NotSetUp extends Error {}

// CONSTANTS

/** How to load each resource for a date: each game's puzzle, plus Spelling Bee hints and stats. */
const loaders: Record<Resource, Loader> = {
  crossword: async (date, get) => {
    const raw = await get(`${NYT}/svc/crosswords/v6/puzzle/daily/${date}.json`, "json")
    return raw && parseCrossword(raw as RawCrossword)
  },
  pips: async (date, get) => {
    const raw = await get(`${NYT}/svc/pips/v1/${date}.json`, "json")
    return raw && parsePips(raw as RawPips)
  },
  "spelling-bee": (date, get) => loadSpellingBee(date, get),
  "spelling-bee-hints": async (date, get, { writeHints }) => {
    if (!writeHints) throw new NotSetUp("Hints aren't set up on this server.")
    const puzzle = await loadSpellingBee(date, get)
    return puzzle && hintsFor(puzzle, writeHints)
  },
  "spelling-bee-stats": async (date, get) => {
    const puzzle = await loadSpellingBee(date, get)
    const raw = puzzle && (await get(`${SPELLING_BEE_STATS}/${puzzle.id}.json`, "json"))
    return raw && parseSpellingBeeStats(raw as RawSpellingBeeStats)
  },
  connections: async (date, get) => {
    const raw = await get(`${NYT}/svc/connections/v2/${date}.json`, "json")
    return raw && parseConnections(raw as RawConnections)
  },
  "letter-boxed": async (date, get) => {
    // Only today's puzzle is available, embedded in the game page.
    const html = await get(`${NYT}/puzzles/letter-boxed`, "text")
    const puzzle = html ? parseLetterBoxed(html as string) : undefined
    return puzzle?.date === date ? puzzle : undefined
  },
}

/** NYT origin. */
const NYT = "https://www.nytimes.com"

/** Where NYT publishes how many players found each Spelling Bee word, by puzzle ID. */
const SPELLING_BEE_STATS =
  "https://static01.nyt.com/newsgraphics/2023-01-18-spelling-bee-buddy/stats"

/** Hints written during this server's life, by puzzle date. */
const writtenHints = new Map<string, Promise<SpellingBeeHints>>()

/** NYT rejects requests without a browser-like user agent. */
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"

/** An account endpoint: without a puzzle ID it answers 400 for a signed-in token and 403 otherwise. */
const ACCOUNT_CHECK_URL = `${NYT}/svc/games/state/spelling_bee/latest`

/** How long to trust a token NYT accepted. */
const TOKEN_CHECK_MS = 60 * 60 * 1000

/** When each accepted token next needs checking. */
const verifiedTokens = new Map<string, number>()

/** How long to reuse an NYT response. */
const CACHE_MS = 10 * 60 * 1000

/** Recent NYT responses by URL. */
const cache = new Map<string, { value: unknown; expires: number }>()

// TYPES

/** A JSON response for the API. */
export type ApiResponse = { status: number; body: unknown }

/** What the API serves: each game's puzzle, plus Spelling Bee hints and player stats. */
type Resource = GameId | "spelling-bee-hints" | "spelling-bee-stats"

/** Fetches an NYT URL as the subscriber. */
type Fetcher = (url: string, as: "json" | "text") => Promise<unknown>

/** Loads one resource for a date. */
type Loader = (date: string, get: Fetcher, services: ApiServices) => Promise<unknown>

/** Writes a clue for each answer, keyed by word. */
export type HintWriter = (answers: string[], pangrams: string[]) => Promise<Record<string, string>>

/** Services the server has set up for the API. */
export type ApiServices = {
  /** Writes Spelling Bee hints; missing when the server has no Anthropic API key. */
  writeHints?: HintWriter
}
