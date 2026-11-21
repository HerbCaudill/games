import { SNAP, TRAY_SCALE } from "./constants"
import type { LooseDomino, Point, Rect } from "./types"

/**
 * Make room for a loose domino that was just dropped or turned. Each loose domino under it moves
 * the shortest way clear, onto the snap grid, and in turn pushes any domino it lands on. A pushed
 * domino avoids the board and the screen's edges when it can. Returns the new center of each
 * domino that moved.
 */
export function makeRoom(
  /** Each loose domino, by domino index; null for dominoes on the board. */
  loose: (LooseDomino | null)[],
  /** The domino that was dropped or turned, which stays where it is. */
  index: number,
  /** Where pushed dominoes shouldn't go, such as the board's cells. */
  walls: Rect[],
  /** Bring a center back inside the screen, given how the domino is turned. */
  fit: (center: Point, turn: number) => Point,
): Map<number, Point> {
  const centers = loose.map(domino => domino?.center)
  const rectOf = (i: number, center = centers[i]!) => footprint(center, loose[i]!.turn)
  const moved = new Map<number, Point>()
  // Dominoes that have found their place, in the order they push others.
  const settled = [index]
  for (let k = 0; k < settled.length; k++) {
    const pusher = rectOf(settled[k])
    loose.forEach((domino, j) => {
      if (!domino || settled.includes(j) || !overlaps(pusher, rectOf(j))) return
      const from = centers[j]!
      const ways = escapes(pusher, from, domino.turn)
        .map(center => fit(center, domino.turn))
        .filter(center => !overlaps(pusher, rectOf(j, center)))
        .sort((a, b) => distance(a, from) - distance(b, from))
      const open = ways.find(center => {
        const rect = rectOf(j, center)
        return !settled.some(s => overlaps(rectOf(s), rect)) && !walls.some(w => overlaps(w, rect))
      })
      const to = open ?? ways[0]
      if (!to) return
      centers[j] = to
      moved.set(j, to)
      settled.push(j)
    })
  }
  return moved
}

/** The space a loose domino covers. */
function footprint(
  /** Its center. */
  [x, y]: Point,
  /** Quarter turns clockwise. */
  turn: number,
): Rect {
  const [hx, hy] = halfSize(turn)
  return { left: x - hx, top: y - hy, right: x + hx, bottom: y + hy }
}

/** Half a loose domino's width and height. */
function halfSize(
  /** Quarter turns clockwise. */
  turn: number,
): Point {
  return Math.abs(turn) % 2 === 1 ? [TRAY_SCALE / 2, TRAY_SCALE] : [TRAY_SCALE, TRAY_SCALE / 2]
}

/** Centers that put a domino just clear of a rectangle on each side, on the snap grid. */
function escapes(
  /** What it has to clear. */
  rect: Rect,
  /** Its center now. */
  [x, y]: Point,
  /** Quarter turns clockwise. */
  turn: number,
): Point[] {
  const [hx, hy] = halfSize(turn)
  return [
    [snapUp(rect.right + hx), y],
    [snapDown(rect.left - hx), y],
    [x, snapUp(rect.bottom + hy)],
    [x, snapDown(rect.top - hy)],
  ]
}

/** Whether two rectangles overlap by more than a rounding error. */
function overlaps(
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

/** The grid line at or after a coordinate. */
function snapUp(
  /** Cell units. */
  n: number,
) {
  return Math.ceil(n / SNAP - EPSILON) * SNAP
}

/** The grid line at or before a coordinate. */
function snapDown(
  /** Cell units. */
  n: number,
) {
  return Math.floor(n / SNAP + EPSILON) * SNAP
}

/** Distance between points. */
function distance(
  /** One. */
  a: Point,
  /** The other. */
  b: Point,
) {
  return Math.hypot(a[0] - b[0], a[1] - b[1])
}

// CONSTANTS

/** Overlap too small to count, in cells. */
const EPSILON = 1e-6
