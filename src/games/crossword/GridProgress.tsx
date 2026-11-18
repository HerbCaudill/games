/** A white square that fills with light blue squares, in reading order, as the crossword is filled. */
export function GridProgress(
  /** The component props. */
  { width, height, filled, className }: Props,
) {
  const count = Math.round(filled * width * height)
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true">
      <rect width={width} height={height} rx={width / 40} fill="#fff" />
      {Array.from({ length: count }, (_, i) => (
        <rect
          key={i}
          x={(i % width) + HAIRLINE / 2}
          y={Math.floor(i / width) + HAIRLINE / 2}
          width={1 - HAIRLINE}
          height={1 - HAIRLINE}
          fill="var(--crossword-tile-fill)"
        />
      ))}
    </svg>
  )
}

// CONSTANTS

/** White line between squares, in squares. */
const HAIRLINE = 0.1

// TYPES

type Props = {
  /** Squares across. */
  width: number
  /** Squares down. */
  height: number
  /** The share of squares filled, from 0 to 1. */
  filled: number
  /** Size classes. */
  className?: string
}
