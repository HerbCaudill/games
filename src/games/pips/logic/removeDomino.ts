import type { Placements } from "./types"

/** Take a domino off the board. */
export function removeDomino(
  /** Current placements. */
  placements: Placements,
  /** Which domino. */
  index: number,
): Placements {
  return placements.map((cells, i) => (i === index ? null : cells))
}
