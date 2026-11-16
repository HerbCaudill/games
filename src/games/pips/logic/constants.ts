import type { Cell } from "@/types"

/** Offsets from a domino's first half to its second: right, down, left, up. */
export const DIRECTIONS: Cell[] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
]
