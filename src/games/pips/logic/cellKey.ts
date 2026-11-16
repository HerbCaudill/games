import type { Cell } from "@/types"

/** A stable string key for a cell. */
export function cellKey(
  /** The cell. */
  [row, col]: Cell,
) {
  return `${row},${col}`
}
