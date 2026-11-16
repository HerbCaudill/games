import { cellKey } from "./cellKey"
import type { Point } from "./types"
import type { Cell } from "@/types"

/**
 * The outline of a group of cells as closed loops of [x, y] corners, one cell per unit, traced
 * clockwise and pulled in by `inset` on every side. Cells that touch only at a corner get
 * separate loops.
 */
export function outline(
  /** The cells. */
  cells: Cell[],
  /** How far to pull each edge in toward the cells. */
  inset: number,
): Point[][] {
  const inside = new Set(cells.map(cellKey))
  // Every cell side that faces outward, as a unit step with the cells on its right.
  const edges: Edge[] = cells.flatMap(([r, c]) =>
    SIDES.filter(({ neighbor: [dr, dc] }) => !inside.has(cellKey([r + dr, c + dc]))).map(
      ({ from, step }) => ({ from: [c + from[0], r + from[1]], step }),
    ),
  )
  const unused = new Set(edges)
  const loops: Point[][] = []
  for (const start of edges) {
    if (!unused.has(start)) continue
    const corners: Point[] = []
    let edge = start
    do {
      unused.delete(edge)
      const to: Point = [edge.from[0] + edge.step[0], edge.from[1] + edge.step[1]]
      const next = nextEdge(edge, to, unused, start)
      if (next.step[0] !== edge.step[0] || next.step[1] !== edge.step[1]) {
        // An edge's inward normal is its step turned a quarter clockwise; a corner moves along both.
        const x = to[0] - inset * (edge.step[1] + next.step[1])
        const y = to[1] + inset * (edge.step[0] + next.step[0])
        corners.push([round(x), round(y)])
      }
      edge = next
    } while (edge !== start)
    loops.push(fromTopLeft(corners))
  }
  return loops
}

/** The edge that continues the outline from a point, turning right where two edges start there. */
function nextEdge(
  /** The edge just walked. */
  edge: Edge,
  /** Where it ends. */
  to: Point,
  /** Edges not yet walked. */
  unused: Set<Edge>,
  /** The loop's first edge, which closes it. */
  start: Edge,
): Edge {
  const candidates = [...unused, start].filter(e => e.from[0] === to[0] && e.from[1] === to[1])
  // At a point shared by two diagonal cells, turning right keeps each cell's loop separate.
  const right: Point = [-edge.step[1], edge.step[0]]
  return candidates.find(e => e.step[0] === right[0] && e.step[1] === right[1]) ?? candidates[0]
}

/** A loop rotated to start at its top-left corner, so results are stable. */
function fromTopLeft(
  /** The loop. */
  corners: Point[],
) {
  const first = corners.reduce((best, [x, y], i) => {
    const [bx, by] = corners[best]
    return y < by || (y === by && x < bx) ? i : best
  }, 0)
  return [...corners.slice(first), ...corners.slice(0, first)]
}

/** Round away floating-point noise. */
function round(
  /** The number. */
  n: number,
) {
  return Math.round(n * 1e6) / 1e6
}

// CONSTANTS

/** A cell's sides walked clockwise: start corner and step in [x, y], and the neighbor across in [row, col]. */
const SIDES: { from: Point; step: Point; neighbor: Cell }[] = [
  { from: [0, 0], step: [1, 0], neighbor: [-1, 0] },
  { from: [1, 0], step: [0, 1], neighbor: [0, 1] },
  { from: [1, 1], step: [-1, 0], neighbor: [1, 0] },
  { from: [0, 1], step: [0, -1], neighbor: [0, -1] },
]

// TYPES

/** One unit step along an outline. */
type Edge = {
  /** Where the step starts. */
  from: Point
  /** The step. */
  step: Point
}
