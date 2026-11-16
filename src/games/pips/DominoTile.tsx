import type { Domino } from "@/types"
import { dominoGeometry } from "./dominoGeometry"
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
        rx={dominoGeometry.radius}
        className="fill-card stroke-foreground"
        strokeWidth={dominoGeometry.strokeWidth}
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
const U = dominoGeometry.unit

/** Gap between the domino's edge and its cells' edges. */
const INSET = dominoGeometry.inset

// TYPES

type Props = {
  /** Pip counts. */
  domino: Domino
}
