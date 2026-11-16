import { cellKey } from "./cellKey"
import type { Cell, PipsBoard } from "@/types"

/** Every cell on the board, which is every cell in a region. */
export function boardCells(
  /** The board. */
  board: PipsBoard,
): Cell[] {
  const seen = new Map<string, Cell>()
  for (const region of board.regions) for (const cell of region.cells) seen.set(cellKey(cell), cell)
  return [...seen.values()]
}
