import { MAX_MISTAKES } from "./logic/constants"

/** Four bars that take each group's color as it is found, with mistakes as dots underneath. */
export function GroupsProgress(
  /** The component props. */
  { levels, mistakes, failed, className }: Props,
) {
  return (
    <svg viewBox="0 0 88 88" className={className} aria-hidden="true">
      {[0, 1, 2, 3].map(i => (
        <rect
          key={i}
          x="4"
          y={4 + i * 17}
          width="80"
          height="14"
          rx="3"
          fill={
            i < levels.length ? `var(--group-${levels[i]})` : failed ? "rgb(0 0 0 / 0.18)" : WELL
          }
        />
      ))}
      {Array.from({ length: MAX_MISTAKES }, (_, i) => (
        <circle
          key={i}
          cx={44 + (i - (MAX_MISTAKES - 1) / 2) * 10}
          cy="80"
          r="3"
          fill={i < mistakes ? "#000" : "rgb(0 0 0 / 0.18)"}
        />
      ))}
    </svg>
  )
}

// CONSTANTS

/** Fill for a group not yet found. */
const WELL = "rgb(255 255 255 / 0.8)"

// TYPES

type Props = {
  /** Difficulty levels of the groups found, in the order found. */
  levels: number[]
  /** Wrong guesses so far. */
  mistakes: number
  /** Whether the player ran out of guesses. */
  failed: boolean
  /** Size classes. */
  className?: string
}
