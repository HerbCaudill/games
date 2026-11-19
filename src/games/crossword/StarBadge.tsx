/** A gold square with a white star, shown in place of the grid once the crossword is solved. */
export function StarBadge(
  /** The component props. */
  { className }: Props,
) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <rect width={100} height={100} rx={18} fill="var(--crossword-star)" />
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

// TYPES

type Props = {
  /** Size classes. */
  className?: string
}
