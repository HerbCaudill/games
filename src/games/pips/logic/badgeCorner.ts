import type { PipsRegion } from "@/types"
import type { Point } from "./types"

/** Where a region's rule badge sits: the bottom-right corner of its last cell, in cell units from the board's corner. */
export function badgeCorner(
  /** The region. */
  region: PipsRegion,
): Point {
  const [r, c] = region.cells.reduce((last, cell) =>
    cell[0] > last[0] || (cell[0] === last[0] && cell[1] > last[1]) ? cell : last,
  )
  return [c + 1, r + 1]
}
