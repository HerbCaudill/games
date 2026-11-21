import { gridLine } from "./gridLine"
import { snapToGrid } from "./snapToGrid"
import type { Point, Surface } from "./types"

/** The nearest grid point for a loose domino's center that keeps it on screen. */
export function fitToGrid(
  /** Where its center would go. */
  center: Point,
  /** Quarter turns clockwise. */
  turn: number,
  /** The table. */
  { grid, fit }: Surface,
): Point {
  const snapped = snapToGrid(center, grid)
  const fitted = fit(snapped, turn)
  // Pulled back from the screen's edge, take the next grid line inside it.
  return [0, 1].map(axis =>
    fitted[axis] === snapped[axis]
      ? snapped[axis]
      : gridLine(fitted[axis], grid[axis], fitted[axis] > snapped[axis] ? "up" : "down"),
  ) as Point
}
