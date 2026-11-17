import { useId } from "react"
import type { Domino } from "@/types"
import { dominoGeometry } from "./dominoGeometry"
import { PipDots } from "./PipDots"
import { regionColors } from "./regionColors"

/**
 * A domino lying flat, first half on the left, filling its box. Its parent turns it. On the board,
 * each half takes the color of the region under it.
 */
export function DominoTile(
  /** The component props. */
  { domino, regions = [undefined, undefined] }: Props,
) {
  const clip = `domino-${useId().replace(/[^\w-]/g, "")}`
  const body = {
    x: INSET,
    y: INSET,
    width: 2 * U - 2 * INSET,
    height: U - 2 * INSET,
    rx: dominoGeometry.radius,
  }
  return (
    <svg viewBox={`0 0 ${2 * U} ${U}`} className="block size-full" aria-hidden="true">
      <clipPath id={clip}>
        <rect {...body} />
      </clipPath>
      <rect {...body} className="fill-card" />
      {regions.map(
        (region, half) =>
          region !== undefined && (
            <rect
              key={half}
              x={half * U}
              width={U}
              height={U}
              clipPath={`url(#${clip})`}
              style={{ fill: regionColors.fill(region) }}
            />
          ),
      )}
      <line
        x1={U}
        x2={U}
        y1="2.5"
        y2={U - 2.5}
        className="stroke-foreground/40"
        strokeWidth="0.4"
      />
      {domino.map((value, half) => (
        <PipDots
          key={half}
          value={value}
          x={half * U}
          y={0}
          size={U}
          color={regions[half] === undefined ? undefined : regionColors.ink(regions[half])}
        />
      ))}
      <rect
        {...body}
        className="stroke-foreground fill-none"
        strokeWidth={dominoGeometry.strokeWidth}
      />
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
  /** The region index under each half, when the domino is on the board. */
  regions?: [number | undefined, number | undefined]
}
