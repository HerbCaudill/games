import type { Cell, PipsBoard } from "@/types"
import { cellKey } from "./cellKey"

/** The index of the region under each half of a placed domino; undefined where the region has no rule. */
export function halfRegions(
  /** The board. */
  board: PipsBoard,
  /** The domino's cells, first half first. */
  pair: [Cell, Cell],
): [number | undefined, number | undefined] {
  const regionAt = (cell: Cell) => {
    const i = board.regions.findIndex(region =>
      region.cells.some(c => cellKey(c) === cellKey(cell)),
    )
    return i >= 0 && board.regions[i].type !== "empty" ? i : undefined
  }
  return [regionAt(pair[0]), regionAt(pair[1])]
}
