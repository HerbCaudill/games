import type { Point } from "./types"

/** An SVG path through outline loops given in cell units, with rounded corners. */
export function roundedPath(
  /** The loops, traced clockwise. */
  loops: Point[][],
  /** Size of one cell in SVG units. */
  unit: number,
  /** Radius of an outer corner, which turns toward the cells. */
  radius: number,
  /** Radius of an inner corner, which turns away from them. */
  innerRadius = radius,
) {
  return loops
    .map(
      loop =>
        loop
          .map((p, i) => {
            const prev = loop[(i + loop.length - 1) % loop.length]
            const next = loop[(i + 1) % loop.length]
            const [x, y] = [p[0] * unit, p[1] * unit]
            // A clockwise loop turns right at an outer corner and left at an inner one.
            const turnsRight =
              (p[0] - prev[0]) * (next[1] - p[1]) - (p[1] - prev[1]) * (next[0] - p[0]) > 0
            const r = turnsRight ? radius : innerRadius
            const into = toward(p, prev, unit, r)
            const out = toward(p, next, unit, r)
            return `${i ? "L" : "M"}${x + into[0]},${y + into[1]}A${r},${r} 0 0 ${turnsRight ? 1 : 0} ${x + out[0]},${y + out[1]}`
          })
          .join("") + "Z",
    )
    .join("")
}

/** A step from one corner toward another, no longer than `radius` or half the way there. */
function toward(
  /** Start corner, in cell units. */
  from: Point,
  /** End corner, in cell units. */
  to: Point,
  /** Size of one cell in SVG units. */
  unit: number,
  /** Longest step. */
  radius: number,
): Point {
  const [dx, dy] = [(to[0] - from[0]) * unit, (to[1] - from[1]) * unit]
  const length = Math.hypot(dx, dy)
  const step = Math.min(radius, length / 2) / length
  return [dx * step, dy * step]
}
