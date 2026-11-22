import { boardCells } from "./boardCells"
import { footprint } from "./footprint"
import type { Point } from "./types"
import type { PipsBoard } from "@/types"

/**
 * Whether a dragged domino is over the board. It's measured at its loose size even once it has
 * grown, so that changing size can't move it on or off the board.
 */
export function isOverBoard(
  /** Its center, in cell units from the board's corner. */
  center: Point,
  /** Quarter turns clockwise. */
  turn: number,
  /** The board. */
  board: PipsBoard,
) {
  const { left, top, right, bottom } = footprint(center, turn)
  const covered = boardCells(board).reduce((sum, [r, c]) => {
    const x = Math.min(c + 1, right) - Math.max(c, left)
    const y = Math.min(r + 1, bottom) - Math.max(r, top)
    return sum + Math.max(0, x) * Math.max(0, y)
  }, 0)
  return covered >= MIN_OVERLAP
}

// CONSTANTS

/** How much of the board, in cells, a domino has to cover to count as over it. */
const MIN_OVERLAP = 0.15
