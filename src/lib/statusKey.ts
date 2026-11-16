import type { GameId } from "@/types"

/** Storage key for a puzzle's status. */
export function statusKey(
  /** The game. */
  game: GameId,
  /** Date as YYYY-MM-DD. */
  date: string,
) {
  return `status:${game}:${date}`
}
