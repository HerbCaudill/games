import type { Cell, PipsDifficulty } from "@/types"

/** Offsets from a domino's first half to its second: right, down, left, up. */
export const DIRECTIONS: Cell[] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
]

/** How big dominoes off the board are, relative to the board's cells. */
export const TRAY_SCALE = 0.75

/** Difficulty levels in display order. */
export const DIFFICULTIES: PipsDifficulty[] = ["easy", "medium", "hard"]
