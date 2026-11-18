import type { GameId } from "@/types"

/** Storage key for the local copy of a game's puzzle. */
export function puzzleKey(
  /** The game. */
  game: GameId,
  /** Date as YYYY-MM-DD. */
  date: string,
) {
  return `puzzle:${game}:${date}:v${PUZZLE_FORMAT}`
}

// CONSTANTS

/** Bump when the API's puzzle shape changes, so devices fetch puzzles again instead of using stale local copies. */
const PUZZLE_FORMAT = 2
