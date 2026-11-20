import { PICTURE_STROKE } from "@/constants"

/** A white square with a black border that fills with light blue squares, in reading order, as the crossword is filled. */
export function GridProgress(
  /** The component props. */
  { filled, className }: Props,
) {
  // Any progress shows at least one square, and the last square waits for the last letter.
  const count = filled > 0 ? Math.max(1, Math.floor(filled * SQUARES)) : 0
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={className} aria-hidden="true">
      <rect width={SIZE} height={SIZE} fill="#fff" />
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
      <rect
        x={STROKE / 2}
        y={STROKE / 2}
        width={SIZE - STROKE}
        height={SIZE - STROKE}
        fill="none"
        stroke="#000"
        strokeWidth={STROKE}
      />
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

/** Border width, in squares. */
const STROKE = PICTURE_STROKE * SIZE

// TYPES

type Props = {
  /** The share of the crossword's squares filled, from 0 to 1. */
  filled: number
  /** Size classes. */
  className?: string
}
