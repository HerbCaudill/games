import type { Domino } from "@/types"
import { DIRECTIONS } from "./logic/constants"
import { PipDots } from "./PipDots"

/** A domino for the tray, turned to face a direction. */
export function DominoTile(
  /** The component props. */
  { domino, direction }: Props,
) {
  const [dr, dc] = DIRECTIONS[direction]
  const vertical = dr !== 0
  // Place the first half so the second sits in the given direction from it.
  const first = { x: dc < 0 ? U : 0, y: dr < 0 ? U : 0 }
  const second = { x: first.x + dc * U, y: first.y + dr * U }
  const width = vertical ? U : 2 * U
  const height = vertical ? 2 * U : U
  return (
    <svg
      viewBox={`-1 -1 ${width + 2} ${height + 2}`}
      className={vertical ? "h-14 w-7.5" : "h-7.5 w-14"}
      aria-hidden="true"
    >
      <rect
        width={width}
        height={height}
        rx="2"
        className="fill-card stroke-foreground"
        strokeWidth="0.6"
      />
      {vertical ? (
        <line
          x1="1.5"
          x2={U - 1.5}
          y1={U}
          y2={U}
          className="stroke-foreground/40"
          strokeWidth="0.5"
        />
      ) : (
        <line
          y1="1.5"
          y2={U - 1.5}
          x1={U}
          x2={U}
          className="stroke-foreground/40"
          strokeWidth="0.5"
        />
      )}
      <PipDots value={domino[0]} x={first.x} y={first.y} size={U} />
      <PipDots value={domino[1]} x={second.x} y={second.y} size={U} />
    </svg>
  )
}

// CONSTANTS

/** Size of one half. */
const U = 10

// TYPES

type Props = {
  /** Pip counts. */
  domino: Domino
  /** Direction from the first half to the second, as an index into DIRECTIONS. */
  direction: number
}
