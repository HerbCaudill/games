import { cellKey } from "./cellKey"
import { cellValues } from "./cellValues"
import type { Placements, RegionStatus } from "./types"
import type { PipsBoard, PipsRegion } from "@/types"

/** Whether a region's rule is met, broken, or still open. */
export function regionStatus(
  /** The region. */
  region: PipsRegion,
  /** Current placements. */
  placements: Placements,
  /** The board. */
  board: PipsBoard,
): RegionStatus {
  const all = cellValues(placements, board)
  const values = region.cells.map(cellKey).flatMap(key => (all.has(key) ? [all.get(key)!] : []))
  const complete = values.length === region.cells.length
  const sum = values.reduce((a, b) => a + b, 0)
  const target = region.target ?? 0
  // Pips are never negative, so a partial sum that is already too big can't recover.
  const broken = {
    sum: sum > target || (complete && sum !== target),
    less: sum >= target,
    greater: complete && sum <= target,
    equals: new Set(values).size > 1,
    unequal: new Set(values).size < values.length,
    empty: false,
  }[region.type]
  if (broken) return "broken"
  return complete ? "met" : "incomplete"
}
