import type { Direction } from "@/types"

/** The other direction. */
export function flip(
  /** A direction. */
  direction: Direction,
): Direction {
  return direction === "across" ? "down" : "across"
}
