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
  return readStored<GameStatus>(statusKey(game, date)) ?? "new"
}
