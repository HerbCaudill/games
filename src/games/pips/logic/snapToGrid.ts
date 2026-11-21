import { SNAP } from "./constants"
import type { Point } from "./types"

/** The nearest point on the grid loose dominoes snap to. */
export function snapToGrid(
  /** A point in cell units from the board's corner. */
  point: Point,
): Point {
  return [snap(point[0]), snap(point[1])]
}

/** One coordinate rounded to the grid. */
function snap(
  /** Cell units. */
  n: number,
) {
  return Math.round(n / SNAP) * SNAP
}
