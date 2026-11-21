import type { Rect } from "./types"

/** Whether two rectangles overlap by more than a rounding error; touching doesn't count. */
export function overlaps(
  /** One. */
  a: Rect,
  /** The other. */
  b: Rect,
) {
  return (
    a.left < b.right - EPSILON &&
    b.left < a.right - EPSILON &&
    a.top < b.bottom - EPSILON &&
    b.top < a.bottom - EPSILON
  )
}

// CONSTANTS

/** Overlap too small to count, in cells. */
const EPSILON = 1e-6
