import { DIRECTIONS } from "./constants"
import type { Cell } from "@/types"

/** Which way a placed domino points, from its first half to its second, as an index into DIRECTIONS. */
export function directionOf(
  /** The domino's cells, first half first. */
  [a, b]: [Cell, Cell],
) {
  return DIRECTIONS.findIndex(([dr, dc]) => b[0] - a[0] === dr && b[1] - a[1] === dc)
}
