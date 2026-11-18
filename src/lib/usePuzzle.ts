import type { GameId, PuzzleFor } from "@/types"
import { puzzleKey } from "./puzzleKey"
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
    storageKey: puzzleKey(game, date),
  })
}
