import { useEffect, useState } from "react"
import type { GameId, PuzzleFor } from "@/types"
import { readStored, writeStored } from "./storage"

/** Load a game's puzzle for a date, from the local copy if there is one, otherwise from the API. */
export function usePuzzle<G extends GameId>(
  /** The game. */
  game: G,
  /** Date as YYYY-MM-DD. */
  date: string,
): PuzzleLoad<PuzzleFor[G]> {
  const key = `puzzle:${game}:${date}`
  const [load, setLoad] = useState<PuzzleLoad<PuzzleFor[G]> & { key: string }>(() =>
    initialLoad(key),
  )
  if (load.key !== key) setLoad(initialLoad(key))

  useEffect(() => {
    if (readStored(key)) return
    let cancelled = false
    fetch(`/api/${game}/${date}`)
      .then(async response => {
        const body = await response.json()
        if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`)
        return body as PuzzleFor[G]
      })
      .then(puzzle => {
        writeStored(key, puzzle)
        if (!cancelled) setLoad({ key, status: "ready", puzzle })
      })
      .catch((error: Error) => {
        if (!cancelled) setLoad({ key, status: "error", message: error.message })
      })
    return () => {
      cancelled = true
    }
  }, [game, date, key])

  return load
}

/** Start from the local copy when there is one. */
function initialLoad<P>(
  /** Storage key for the puzzle. */
  key: string,
): PuzzleLoad<P> & { key: string } {
  const puzzle = readStored<P>(key)
  return puzzle ? { key, status: "ready", puzzle } : { key, status: "loading" }
}

// TYPES

/** The state of a puzzle request. */
export type PuzzleLoad<P> =
  | { status: "loading" }
  | { status: "ready"; puzzle: P }
  | { status: "error"; message: string }
