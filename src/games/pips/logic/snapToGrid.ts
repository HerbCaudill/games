import { gridLine } from "./gridLine"
import type { Point } from "./types"

/** The nearest point on the grid loose dominoes snap to. */
export function snapToGrid(
  /** A point in cell units from the board's corner. */
  point: Point,
  /** A point on the grid. */
  grid: Point,
): Point {
  return [gridLine(point[0], grid[0]), gridLine(point[1], grid[1])]
}
