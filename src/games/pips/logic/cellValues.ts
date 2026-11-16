import { cellKey } from "./cellKey"
import type { Placements } from "./types"
import type { PipsBoard } from "@/types"

/** Pip counts on occupied cells. */
export function cellValues(
  /** Current placements. */
  placements: Placements,
  /** The board. */
  board: PipsBoard,
) {
  const values = new Map<string, number>()
  placements.forEach((cells, i) => {
    if (!cells) return
    values.set(cellKey(cells[0]), board.dominoes[i][0])
    values.set(cellKey(cells[1]), board.dominoes[i][1])
  })
  return values
}
