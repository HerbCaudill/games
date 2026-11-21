import { fitToGrid } from "./fitToGrid"
import { footprint } from "./footprint"
import { gridLine } from "./gridLine"
import { overlaps } from "./overlaps"
import type { LooseDomino, Point, Rect, Surface } from "./types"

/**
 * Make room for loose dominoes that were just dropped, turned or brought back by undo. Each loose
 * domino under one moves the shortest way clear, onto the snap grid, and in turn pushes any domino
 * it lands on. A pushed domino avoids the board and the screen's edges when it can. Returns the new
 * center of each domino that moved.
 */
export function makeRoom(
  /** Each loose domino, by domino index; null for dominoes on the board. */
  loose: (LooseDomino | null)[],
  /** The dominoes to make room for, which stay where they are. */
  movers: number[],
  /** The table. */
  surface: Surface,
): Map<number, Point> {
  const centers = loose.map(domino => domino?.center)
  const rectOf = (i: number, center = centers[i]!) => footprint(center, loose[i]!.turn)
  const moved = new Map<number, Point>()
  // Dominoes that have found their place, in the order they push others.
  const settled = [...movers]
  for (let k = 0; k < settled.length; k++) {
    const pusher = rectOf(settled[k])
    loose.forEach((domino, j) => {
      if (!domino || settled.includes(j) || !overlaps(pusher, rectOf(j))) return
      const from = centers[j]!
      const ways = escapes(pusher, from, domino.turn, surface.grid)
        .map(center => fitToGrid(center, domino.turn, surface))
        .filter(center => !overlaps(pusher, rectOf(j, center)))
        .sort((a, b) => distance(a, from) - distance(b, from))
      const open = ways.find(center => {
        const rect = rectOf(j, center)
        return (
          !settled.some(s => overlaps(rectOf(s), rect)) &&
          !surface.walls.some(w => overlaps(w, rect))
        )
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

/** Centers that put a domino just clear of a rectangle on each side, on the snap grid. */
function escapes(
  /** What it has to clear. */
  rect: Rect,
  /** Its center now. */
  [x, y]: Point,
  /** Quarter turns clockwise. */
  turn: number,
  /** A point on the grid. */
  grid: Point,
): Point[] {
  const own = footprint([x, y], turn)
  const [hx, hy] = [(own.right - own.left) / 2, (own.bottom - own.top) / 2]
  return [
    [gridLine(rect.right + hx, grid[0], "up"), y],
    [gridLine(rect.left - hx, grid[0], "down"), y],
    [x, gridLine(rect.bottom + hy, grid[1], "up")],
    [x, gridLine(rect.top - hy, grid[1], "down")],
  ]
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
