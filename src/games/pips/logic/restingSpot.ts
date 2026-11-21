import { fitToGrid } from "./fitToGrid"
import { footprint } from "./footprint"
import { gridLine } from "./gridLine"
import { overlaps } from "./overlaps"
import type { Point, Rect, Surface } from "./types"

/**
 * Where a domino dropped off the board comes to rest: on the snap grid, on screen, and clear of the
 * board. One dropped on the board's edge moves the shortest way off it.
 */
export function restingSpot(
  /** Where its center was dropped. */
  center: Point,
  /** Quarter turns clockwise. */
  turn: number,
  /** The table. */
  surface: Surface,
): Point {
  const at = fitToGrid(center, turn, surface)
  const blocked = (point: Point) => surface.walls.some(w => overlaps(w, footprint(point, turn)))
  if (!blocked(at)) return at
  const ways = SIDES.map(side => {
    let point = at
    // Step past whatever is in the way until nothing is, or there's nowhere further to go.
    for (let step = 0; step < MAX_STEPS && blocked(point); step++) {
      const next = fitToGrid(beyond(point, turn, side, surface), turn, surface)
      if (next[0] === point[0] && next[1] === point[1]) break
      point = next
    }
    return point
  })
    .filter(point => !blocked(point))
    .sort((a, b) => distance(a, at) - distance(b, at))
  return ways[0] ?? at
}

/** The center that takes a domino just past every wall it overlaps, on one side. */
function beyond(
  /** Its center. */
  center: Point,
  /** Quarter turns clockwise. */
  turn: number,
  /** Which way to go. */
  side: Side,
  /** The table. */
  { walls, grid }: Surface,
): Point {
  const rect = footprint(center, turn)
  const [hx, hy] = [(rect.right - rect.left) / 2, (rect.bottom - rect.top) / 2]
  const hit = walls.filter(w => overlaps(w, rect))
  const edge = (pick: (w: Rect) => number, most: (...n: number[]) => number) =>
    most(...hit.map(pick))
  switch (side) {
    case "right":
      return [gridLine(edge(w => w.right, Math.max) + hx, grid[0], "up"), center[1]]
    case "left":
      return [gridLine(edge(w => w.left, Math.min) - hx, grid[0], "down"), center[1]]
    case "down":
      return [center[0], gridLine(edge(w => w.bottom, Math.max) + hy, grid[1], "up")]
    case "up":
      return [center[0], gridLine(edge(w => w.top, Math.min) - hy, grid[1], "down")]
  }
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

/** The ways a domino can move off the board. */
const SIDES = ["right", "left", "down", "up"] as const

/** How many walls in a row a domino will step past before giving up on a side. */
const MAX_STEPS = 50

// TYPES

type Side = (typeof SIDES)[number]
