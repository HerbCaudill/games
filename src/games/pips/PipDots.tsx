/** The pips for one domino half, drawn in a square at (x, y). */
export function PipDots({ value, x, y, size }: Props) {
  return (
    <>
      {DOTS[value].map(([dx, dy], i) => (
        <circle
          key={i}
          cx={x + dx * size}
          cy={y + dy * size}
          r={size * 0.085}
          className="fill-foreground"
        />
      ))}
    </>
  )
}

// CONSTANTS

/** Dot positions within a unit square for each count from 0 to 6. */
const DOTS: [number, number][][] = (() => {
  const [lo, mid, hi] = [0.27, 0.5, 0.73]
  return [
    [],
    [[mid, mid]],
    [
      [lo, lo],
      [hi, hi],
    ],
    [
      [lo, lo],
      [mid, mid],
      [hi, hi],
    ],
    [
      [lo, lo],
      [hi, lo],
      [lo, hi],
      [hi, hi],
    ],
    [
      [lo, lo],
      [hi, lo],
      [mid, mid],
      [lo, hi],
      [hi, hi],
    ],
    [
      [lo, lo],
      [hi, lo],
      [lo, mid],
      [hi, mid],
      [lo, hi],
      [hi, hi],
    ],
  ]
})()

// TYPES

type Props = {
  /** Number of pips, 0 to 6. */
  value: number
  /** Left edge of the half. */
  x: number
  /** Top edge of the half. */
  y: number
  /** Side length of the half. */
  size: number
}
