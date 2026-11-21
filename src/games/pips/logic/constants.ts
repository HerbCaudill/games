import type { Cell } from "@/types"

/** Offsets from a domino's first half to its second: right, down, left, up. */
export const DIRECTIONS: Cell[] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
]

/** How big dominoes off the board are, relative to the board's cells. */
export const TRAY_SCALE = 0.75

/** Spacing of the grid loose dominoes snap to, in cells: a quarter of a loose domino's width. */
export const SNAP = TRAY_SCALE / 4
