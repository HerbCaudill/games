import { DIRECTIONS } from "./constants"
import { place } from "./place"
import type { Placements } from "./types"
import type { Cell, PipsBoard } from "@/types"

/** Put a domino's first half on a cell, trying the preferred direction first and then turning clockwise. */
export function placeAt(
  /** Current placements. */
  placements: Placements,
  /** Which domino. */
  index: number,
  /** Cell for the domino's first half. */
  cell: Cell,
  /** Preferred direction from the first half to the second, as an index into DIRECTIONS. */
  direction: number,
  /** The board. */
  board: PipsBoard,
): { placements: Placements; direction: number } | undefined {
  for (let turn = 0; turn < DIRECTIONS.length; turn++) {
    const d = (direction + turn) % DIRECTIONS.length
    const [dr, dc] = DIRECTIONS[d]
    const result = place(placements, index, cell, [cell[0] + dr, cell[1] + dc], board)
    if (result) return { placements: result, direction: d }
  }
  return undefined
}
