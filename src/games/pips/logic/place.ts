import { boardCells } from "./boardCells"
import { cellKey } from "./cellKey"
import type { Placements } from "./types"
import type { Cell, PipsBoard } from "@/types"

/** Put a domino on two cells, first half on `a`; undefined if the move is not allowed. */
export function place(
  /** Current placements. */
  placements: Placements,
  /** Which domino. */
  index: number,
  /** Cell for the domino's first half. */
  a: Cell,
  /** Cell for the domino's second half. */
  b: Cell,
  /** The board. */
  board: PipsBoard,
): Placements | undefined {
  const onBoard = new Set(boardCells(board).map(cellKey))
  if (!onBoard.has(cellKey(a)) || !onBoard.has(cellKey(b))) return undefined
  if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) !== 1) return undefined
  const taken = new Set(
    placements.flatMap((cells, i) => (cells && i !== index ? cells.map(cellKey) : [])),
  )
  if (taken.has(cellKey(a)) || taken.has(cellKey(b))) return undefined
  return placements.map((cells, i) => (i === index ? [a, b] : cells))
}
