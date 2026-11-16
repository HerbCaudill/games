import type { GameId } from "../src/types.ts"
import { parseConnections, type RawConnections } from "./parseConnections.ts"
import { parseCrossword, type RawCrossword } from "./parseCrossword.ts"
import { parseLetterBoxed } from "./parseLetterBoxed.ts"
import { parsePips, type RawPips } from "./parsePips.ts"
import { parseSpellingBee, type RawActiveSpellingBees } from "./parseSpellingBee.ts"

/** Serve `/api/<game>/<YYYY-MM-DD>` by fetching that puzzle from NYT. */
export async function handleApiRequest(
  /** Request path, such as `/api/pips/2026-11-16`. */
  path: string,
  /** The NYT-S cookie value for the subscriber account. */
  token: string | undefined,
): Promise<ApiResponse> {
  const match = path.match(/^\/api\/([a-z-]+)\/(\d{4}-\d{2}-\d{2})$/)
  if (!match) return error(404, "Not found")
  const [, game, date] = match
  const load = loaders[game as GameId]
  if (!load) return error(404, `Unknown game: ${game}`)
  try {
    const puzzle = await load(date, (url, as) => fetchNyt(url, as, token))
    if (!puzzle) return error(404, `No ${game} puzzle for ${date}`)
    return { status: 200, body: puzzle }
  } catch (e) {
    return error(502, e instanceof Error ? e.message : String(e))
  }
}

/** Fetch an NYT URL as the subscriber, reusing recent responses. */
async function fetchNyt(
  /** The URL. */
  url: string,
  /** How to read the body. */
  as: "json" | "text",
  /** The NYT-S cookie value. */
  token: string | undefined,
): Promise<unknown> {
  const cached = cache.get(url)
  if (cached && cached.expires > Date.now()) return cached.value
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      ...(token ? { "nyt-s": token, Cookie: `NYT-S=${token}` } : {}),
    },
  })
  if (response.status === 404) return undefined
  if (!response.ok) throw new Error(`NYT returned ${response.status} for ${url}`)
  const value = as === "json" ? await response.json() : await response.text()
  cache.set(url, { value, expires: Date.now() + CACHE_MS })
  return value
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

// CONSTANTS

/** How to load each game's puzzle for a date. */
const loaders: Record<GameId, Loader> = {
  crossword: async (date, get) => {
    const raw = await get(`${NYT}/svc/crosswords/v6/puzzle/daily/${date}.json`, "json")
    return raw && parseCrossword(raw as RawCrossword)
  },
  pips: async (date, get) => {
    const raw = await get(`${NYT}/svc/pips/v1/${date}.json`, "json")
    return raw && parsePips(raw as RawPips)
  },
  "spelling-bee": async (date, get) => {
    // NYT only publishes answers for the current and previous week.
    const raw = await get(`${NYT}/svc/spelling-bee/v1/active.json`, "json")
    return raw && parseSpellingBee(raw as RawActiveSpellingBees, date)
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

/** NYT rejects requests without a browser-like user agent. */
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"

/** How long to reuse an NYT response. */
const CACHE_MS = 10 * 60 * 1000

/** Recent NYT responses by URL. */
const cache = new Map<string, { value: unknown; expires: number }>()

// TYPES

/** A JSON response for the API. */
export type ApiResponse = { status: number; body: unknown }

/** Loads one game's puzzle for a date. */
type Loader = (
  date: string,
  get: (url: string, as: "json" | "text") => Promise<unknown>,
) => Promise<unknown>
