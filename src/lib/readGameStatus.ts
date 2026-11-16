import type { GameId } from "@/types"
import { readStored } from "./readStored"
import { statusKey } from "./statusKey"
import type { GameStatus } from "./useGameStatus"

/** Read a puzzle's saved status. */
export function readGameStatus(
  /** The game. */
  game: GameId,
  /** Date as YYYY-MM-DD. */
  date: string,
): GameStatus {
  const status = readStored<GameStatus>(statusKey(game, date)) ?? "new"
  if (game === "letter-boxed" && status === "solved") {
    const progress = readStored<{ words: string[] }>(`progress:${game}:${date}`)
    if (progress && progress.words.length !== 2) return "started"
  }
  return status
}
