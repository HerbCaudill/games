/** A white square that fills with light blue squares, in reading order, as the crossword is filled. */
export function GridProgress(
  /** The component props. */
  { filled, className }: Props,
) {
  // Any progress shows at least one square, and the last square waits for the last letter.
  const count = filled > 0 ? Math.max(1, Math.floor(filled * SQUARES)) : 0
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={className} aria-hidden="true">
      <rect width={SIZE} height={SIZE} rx={0.1} fill="#fff" />
      {Array.from({ length: count }, (_, i) => (
        <rect
          key={i}
          x={(i % SIZE) + HAIRLINE / 2}
          y={Math.floor(i / SIZE) + HAIRLINE / 2}
          width={1 - HAIRLINE}
          height={1 - HAIRLINE}
          fill="var(--crossword-tile-fill)"
        />
      ))}
    </svg>
  )
}

// CONSTANTS

/** Squares across and down. */
const SIZE = 4

/** Squares in all. */
const SQUARES = SIZE * SIZE

/** White line between squares, in squares. */
const HAIRLINE = 0.04

// TYPES

type Props = {
  /** The share of the crossword's squares filled, from 0 to 1. */
  filled: number
  /** Size classes. */
  className?: string
}
