import { PICTURE_STROKE } from "@/constants"
import { MAX_MISTAKES } from "./logic/constants"

/** A four-by-four grid whose rows take each group's color as it is found, with mistakes as dots underneath. */
export function GroupsProgress(
  /** The component props. */
  { levels, mistakes, failed, className }: Props,
) {
  const cell = GRID / 4
  const lines = [1, 2, 3].map(i => i * cell)
  return (
    <svg viewBox="0 0 88 88" className={className} aria-hidden="true">
      <g transform={`translate(${LEFT} ${TOP})`}>
        {[0, 1, 2, 3].map(i => (
          <rect
            key={i}
            y={i * cell}
            width={GRID}
            height={cell}
            fill={
              i < levels.length ? `var(--group-${levels[i]})` : failed ? "rgb(0 0 0 / 0.18)" : WELL
            }
          />
        ))}
        <path
          d={[...lines.map(at => `M0 ${at}H${GRID}`), ...lines.map(at => `M${at} 0V${GRID}`)].join(
            "",
          )}
          stroke="#000"
          strokeWidth={STROKE}
        />
        <rect width={GRID} height={GRID} fill="none" stroke="#000" strokeWidth={STROKE} />
      </g>
      {Array.from({ length: MAX_MISTAKES }, (_, i) => (
        <circle
          key={i}
          cx={44 + (i - (MAX_MISTAKES - 1) / 2) * 10}
          cy="81"
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

/** Black line width, in the picture's 88-unit drawing. */
const STROKE = PICTURE_STROKE * 88

/** The grid's size, leaving room for the mistake dots below it. */
const GRID = 68

/** The grid's top left corner, centered across, with room for half the border above. */
const LEFT = (88 - GRID) / 2
const TOP = STROKE / 2

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
