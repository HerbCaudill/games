import { TRAY_SCALE } from "./constants"
import type { Point, Rect } from "./types"

/** The space a loose domino covers. */
export function footprint(
  /** Its center. */
  [x, y]: Point,
  /** Quarter turns clockwise. */
  turn: number,
): Rect {
  const [hx, hy] =
    Math.abs(turn) % 2 === 1 ? [TRAY_SCALE / 2, TRAY_SCALE] : [TRAY_SCALE, TRAY_SCALE / 2]
  return { left: x - hx, top: y - hy, right: x + hx, bottom: y + hy }
}
