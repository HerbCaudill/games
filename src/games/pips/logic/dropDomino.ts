import { DIRECTIONS } from "./constants"
import { place } from "./place"
import type { Placements, Point } from "./types"
import type { Cell, PipsBoard } from "@/types"

/** Place a domino dropped with its center at a point, on the cells under its halves; undefined if it doesn't fit there. */
export function dropDomino(
  /** Current placements. */
  placements: Placements,
  /** Which domino. */
  index: number,
  /** Where its center was dropped, in cell units from the board's corner. */
  center: Point,
  /** Direction from its first half to its second, as an index into DIRECTIONS. */
  direction: number,
  /** The board. */
  board: PipsBoard,
): Placements | undefined {
  const [dr, dc] = DIRECTIONS[direction]
  const under = (sign: number): Cell => [
    Math.floor(center[1] + (sign * dr) / 2),
    Math.floor(center[0] + (sign * dc) / 2),
  ]
  return place(placements, index, under(-1), under(1), board)
}
