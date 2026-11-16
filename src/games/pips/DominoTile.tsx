import type { Domino } from "@/types"
import { PipDots } from "./PipDots"

/** A domino lying flat, first half on the left, filling its box. Its parent turns it. */
export function DominoTile(
  /** The component props. */
  { domino }: Props,
) {
  return (
    <svg viewBox={`0 0 ${2 * U} ${U}`} className="block size-full" aria-hidden="true">
      <rect
        x={INSET}
        y={INSET}
        width={2 * U - 2 * INSET}
        height={U - 2 * INSET}
        rx="1.8"
        className="fill-card stroke-foreground"
        strokeWidth="0.35"
      />
      <line
        x1={U}
        x2={U}
        y1="2.5"
        y2={U - 2.5}
        className="stroke-foreground/40"
        strokeWidth="0.4"
      />
      <PipDots value={domino[0]} x={0} y={0} size={U} />
      <PipDots value={domino[1]} x={U} y={0} size={U} />
    </svg>
  )
}

// CONSTANTS

/** Size of one half. */
const U = 10

/** Gap between the domino's edge and its cells' edges. */
const INSET = 0.9

// TYPES

type Props = {
  /** Pip counts. */
  domino: Domino
}
