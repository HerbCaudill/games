import { regionStatus } from "./regionStatus"
import type { Placements } from "./types"
import type { PipsBoard } from "@/types"

/** Whether every domino is placed and every rule is met. */
export function isSolved(
  /** Current placements. */
  placements: Placements,
  /** The board. */
  board: PipsBoard,
) {
  return (
    placements.every(Boolean) &&
    board.regions.every(region => regionStatus(region, placements, board) === "met")
  )
}
