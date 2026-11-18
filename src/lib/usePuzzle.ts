import type { GameId, PuzzleFor } from "@/types"
import { useApi } from "./useApi"

/** Load a game's puzzle for a date, from the local copy if there is one, otherwise from the API. */
export function usePuzzle<G extends GameId>(
  /** The game. */
  game: G,
  /** Date as YYYY-MM-DD. */
  date: string,
  /** The NYT-S cookie value saved on this device, if any. */
  token: string,
) {
  return useApi<PuzzleFor[G]>(`/api/${game}/${date}`, token, {
    storageKey: `puzzle:${game}:${date}:v${PUZZLE_FORMAT}`,
  })
}

// CONSTANTS

/** Bump when the API's puzzle shape changes, so devices fetch puzzles again instead of using stale local copies. */
const PUZZLE_FORMAT = 2
