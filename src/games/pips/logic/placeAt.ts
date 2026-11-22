import { DIRECTIONS } from "./constants"
import { leftHalf } from "./leftHalf"
import { place } from "./place"
import type { Placements } from "./types"
import type { Cell, PipsBoard } from "@/types"

/** Put the half that starts on the left on a cell, trying the preferred direction first and then turning clockwise. */
export function placeAt(
  /** Current placements. */
  placements: Placements,
  /** Which domino. */
  index: number,
  /** Cell for the half that starts on the left. */
  cell: Cell,
  /** Preferred direction from the first half to the second, as an index into DIRECTIONS. */
  direction: number,
  /** The board. */
  board: PipsBoard,
): { placements: Placements; direction: number } | undefined {
  const half = leftHalf(board.dominoes[index])
  for (let turn = 0; turn < DIRECTIONS.length; turn++) {
    const d = (direction + turn) % DIRECTIONS.length
    const [dr, dc] = DIRECTIONS[d]
    // Step back from the cell to the first half when it's the second half going there.
    const a: Cell = [cell[0] - half * dr, cell[1] - half * dc]
    const result = place(placements, index, a, [a[0] + dr, a[1] + dc], board)
    if (result) return { placements: result, direction: d }
  }
  return undefined
}
