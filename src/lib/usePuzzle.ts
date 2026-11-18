import { useEffect, useState } from "react"
import type { GameId, PuzzleFor } from "@/types"
import { NYT_TOKEN_HEADER } from "../../server/constants.ts"
import { readStored } from "./readStored"
import { writeStored } from "./writeStored"

/** Load a game's puzzle for a date, from the local copy if there is one, otherwise from the API. */
export function usePuzzle<G extends GameId>(
  /** The game. */
  game: G,
  /** Date as YYYY-MM-DD. */
  date: string,
  /** The NYT-S cookie value saved on this device, if any. */
  token: string,
): PuzzleLoad<PuzzleFor[G]> {
  const key = `puzzle:${game}:${date}:v${PUZZLE_FORMAT}`
  // A new token retries a request that failed for want of one.
  const request = `${key} ${token}`
  const [load, setLoad] = useState<PuzzleLoad<PuzzleFor[G]> & { request: string }>(() =>
    initialLoad(key, request),
  )
  if (load.request !== request) setLoad(initialLoad(key, request))

  useEffect(() => {
    if (readStored(key)) return
    let cancelled = false
    fetch(`/api/${game}/${date}`, { headers: token ? { [NYT_TOKEN_HEADER]: token } : {} })
      .then(async response => {
        const body = await response.json()
        if (response.status === 401) throw new NeedsToken(body.error)
        if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`)
        return body as PuzzleFor[G]
      })
      .then(puzzle => {
        writeStored(key, puzzle)
        if (!cancelled) setLoad({ request, status: "ready", puzzle })
      })
      .catch((error: Error) => {
        if (cancelled) return
        const status = error instanceof NeedsToken ? "needs-token" : "error"
        setLoad({ request, status, message: error.message })
      })
    return () => {
      cancelled = true
    }
  }, [game, date, key, token, request])

  return load
}

/** Start from the local copy when there is one. */
function initialLoad<P>(
  /** Storage key for the puzzle. */
  key: string,
  /** Identifies the request this state belongs to. */
  request: string,
): PuzzleLoad<P> & { request: string } {
  const puzzle = readStored<P>(key)
  return puzzle ? { request, status: "ready", puzzle } : { request, status: "loading" }
}

/** The API needs a valid NYT token. */
class NeedsToken extends Error {}

// CONSTANTS

/** Bump when the API's puzzle shape changes, so devices fetch puzzles again instead of using stale local copies. */
const PUZZLE_FORMAT = 2

// TYPES

/** The state of a puzzle request. */
export type PuzzleLoad<P> =
  | { status: "loading" }
  | { status: "ready"; puzzle: P }
  | { status: "error" | "needs-token"; message: string }
