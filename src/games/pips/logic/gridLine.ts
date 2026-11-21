import { SNAP } from "./constants"

/** The snap grid line nearest a coordinate, or the nearest at or after it, or at or before it. */
export function gridLine(
  /** A coordinate in cell units. */
  n: number,
  /** Where a grid line falls on the same axis. */
  origin: number,
  /** Which line: nearest, at or after, or at or before. */
  toward: "nearest" | "up" | "down" = "nearest",
) {
  const steps = (n - origin) / SNAP
  const whole =
    toward === "up"
      ? Math.ceil(steps - EPSILON)
      : toward === "down"
        ? Math.floor(steps + EPSILON)
        : Math.round(steps)
  return origin + whole * SNAP
}

// CONSTANTS

/** Fraction of a step too small to count, so rounding errors don't skip a line. */
const EPSILON = 1e-6
