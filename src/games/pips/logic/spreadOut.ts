import { SNAP } from "./constants"
import { fitToGrid } from "./fitToGrid"
import { footprint } from "./footprint"
import { overlaps } from "./overlaps"
import type { LooseDomino, Point, Surface } from "./types"

/**
 * Untangle loose dominoes left on top of each other, as when a smaller screen pulls them in from
 * its edges. Dominoes that weren't pulled in keep their places, then the rest keep theirs in turn
 * where they can; any domino on top of one already kept moves to the nearest free spot on the
 * grid that is on screen and off the board. Returns the new center of each domino that moved.
 */
export function spreadOut(
  /** Each loose domino, by domino index; null for dominoes on the board. */
  loose: (LooseDomino | null)[],
  /** The dominoes that were pulled in, which give way to the others. */
  pulled: number[],
  /** The table. */
  surface: Surface,
): Map<number, Point> {
  const indexes = loose.flatMap((domino, i) => (domino ? [i] : []))
  const order = [
    ...indexes.filter(i => !pulled.includes(i)),
    ...indexes.filter(i => pulled.includes(i)),
  ]
  const centers = loose.map(domino => domino?.center)
  const rectOf = (i: number, center = centers[i]!) => footprint(center, loose[i]!.turn)
  const moved = new Map<number, Point>()
  const kept: number[] = []
  for (const i of order) {
    const { turn } = loose[i]!
    const blocked = (center: Point) => kept.some(k => overlaps(rectOf(k), rectOf(i, center)))
    if (blocked(centers[i]!)) {
      const [x, y] = fitToGrid(centers[i]!, turn, surface)
      const to = OFFSETS.map(([dx, dy]): Point => [x + dx * SNAP, y + dy * SNAP]).find(center => {
        const [fx, fy] = surface.fit(center, turn)
        const onScreen = Math.abs(fx - center[0]) < EPSILON && Math.abs(fy - center[1]) < EPSILON
        const rect = rectOf(i, center)
        return onScreen && !blocked(center) && !surface.walls.some(w => overlaps(w, rect))
      })
      if (to) {
        centers[i] = to
        moved.set(i, to)
      }
    }
    kept.push(i)
  }
  return moved
}

// CONSTANTS

/** How far to look for a free spot, in grid steps each way. */
const REACH = 40

/** Grid steps from a domino's spot, nearest first; of equally near ones, down before up and right before left, away from the board. */
const OFFSETS: Point[] = Array.from({ length: (2 * REACH + 1) ** 2 }, (_, n): Point => [
  (n % (2 * REACH + 1)) - REACH,
  Math.floor(n / (2 * REACH + 1)) - REACH,
]).sort((a, b) => Math.hypot(...a) - Math.hypot(...b) || b[1] - a[1] || b[0] - a[0])

/** Distance too small to count, in cells. */
const EPSILON = 1e-6
