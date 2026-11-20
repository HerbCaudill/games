import { PICTURE_STROKE } from "@/constants"

/** A gold square with a white star and a black border, shown in place of the grid once the crossword is solved. */
export function StarBadge(
  /** The component props. */
  { className }: Props,
) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <rect
        x={STROKE / 2}
        y={STROKE / 2}
        width={100 - STROKE}
        height={100 - STROKE}
        rx={18 - STROKE / 2}
        fill="var(--crossword-star)"
        stroke="#000"
        strokeWidth={STROKE}
      />
      <rect x={18} y={18} width={64} height={64} fill="var(--crossword-star-inner)" />
      <polygon
        points="50,26.5 56.2,43 73.8,43.8 60,54.7 64.7,71.7 50,62 35.3,71.7 40,54.7 26.2,43.8 43.8,43"
        fill="#fff"
        stroke="#fff"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  )
}

// CONSTANTS

/** Border width, in the badge's 100-unit drawing. */
const STROKE = PICTURE_STROKE * 100

// TYPES

type Props = {
  /** Size classes. */
  className?: string
}
