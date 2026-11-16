import { boardCells } from "./boardCells"
import { DIRECTIONS } from "./constants"
import { place } from "./place"
import type { Placements, Point } from "./types"
import type { Cell, PipsBoard } from "@/types"

/**
 * Where a dragged domino ends up. Dropped clear of the board, it stays loose where it lies.
 * Dropped on or partly on the board, it settles in the nearest spot that fits, facing the same way
 * if any such spot is free; if nothing fits anywhere, the drop is blocked.
 */
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
): Drop {
  const cells = boardCells(board)
  const [down, across] = DIRECTIONS[direction]
  // Half the domino's width and height.
  const [hx, hy] = [0.5 + Math.abs(across) / 2, 0.5 + Math.abs(down) / 2]
  const overlap = cells.reduce((sum, [r, c]) => {
    const x = Math.min(c + 1, center[0] + hx) - Math.max(c, center[0] - hx)
    const y = Math.min(r + 1, center[1] + hy) - Math.max(r, center[1] - hy)
    return sum + Math.max(0, x) * Math.max(0, y)
  }, 0)
  if (overlap < MIN_OVERLAP) return { kind: "loose" }

  // Its own direction first, then the others clockwise from it.
  for (let turn = 0; turn < DIRECTIONS.length; turn++) {
    const [dr, dc] = DIRECTIONS[(direction + turn) % DIRECTIONS.length]
    let best: { placements: Placements; distance: number } | undefined
    for (const a of cells) {
      const b: Cell = [a[0] + dr, a[1] + dc]
      const result = place(placements, index, a, b, board)
      if (!result) continue
      const distance = Math.hypot(
        (a[1] + b[1]) / 2 + 0.5 - center[0],
        (a[0] + b[0]) / 2 + 0.5 - center[1],
      )
      if (!best || distance < best.distance) best = { placements: result, distance }
    }
    if (best) return { kind: "placed", placements: best.placements }
  }
  return { kind: "blocked" }
}

// CONSTANTS

/** How much of the board, in cells, a domino has to cover to count as dropped on it. */
const MIN_OVERLAP = 0.15

// TYPES

/** What happens to a dropped domino. */
export type Drop =
  | { kind: "placed"; placements: Placements }
  | { kind: "loose" }
  | { kind: "blocked" }
