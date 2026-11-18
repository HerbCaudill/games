import { useId } from "react"
import type { Domino } from "@/types"
import { dominoGeometry } from "./dominoGeometry"
import { PipDots } from "./PipDots"
import { regionColors } from "./regionColors"

/**
 * A domino lying flat, first half on the left, filling its box. Its parent turns it by `turn`
 * quarter turns. The face sits raised above a gray edge that stays at the bottom of the screen
 * however the domino is turned. On the board, each half takes the color of the region under it.
 */
export function DominoTile(
  /** The component props. */
  { domino, turn = 0, regions = [undefined, undefined] }: Props,
) {
  const clip = `domino-${useId().replace(/[^\w-]/g, "")}`
  const body = {
    x: INSET,
    y: INSET,
    width: 2 * U - 2 * INSET,
    height: U - 2 * INSET,
    rx: dominoGeometry.radius,
  }
  // The tile's own direction that points down the screen once it is turned.
  const [downX, downY] = DOWN[((turn % 4) + 4) % 4]
  const face = {
    ...body,
    x: body.x + Math.max(0, -downX) * DEPTH,
    y: body.y + Math.max(0, -downY) * DEPTH,
    width: body.width - Math.abs(downX) * DEPTH,
    height: body.height - Math.abs(downY) * DEPTH,
  }
  return (
    <svg viewBox={`0 0 ${2 * U} ${U}`} className="block size-full" aria-hidden="true">
      <clipPath id={clip}>
        <rect {...face} />
      </clipPath>
      <rect {...body} style={{ fill: EDGE }} />
      <rect {...face} className="fill-card" />
      <g clipPath={`url(#${clip})`}>
        <g transform={`translate(${(-downX * DEPTH) / 2} ${(-downY * DEPTH) / 2})`}>
          {regions.map(
            (region, half) =>
              region !== undefined && (
                // Reach past the outer edges, not into the other half, so the face stays covered once shifted.
                <rect
                  key={half}
                  x={half === 0 ? -DEPTH : U}
                  y={-DEPTH}
                  width={U + DEPTH}
                  height={U + 2 * DEPTH}
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
        </g>
      </g>
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

/** Thickness of the edge under the face. */
const DEPTH = 0.7

/** The edge under the face: an opaque gray between the outline and the face. */
const EDGE = "color-mix(in oklab, var(--foreground) 40%, var(--card))"

/** For each quarter turn clockwise, the tile's own direction that ends up pointing down the screen. */
const DOWN: [number, number][] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
]

// TYPES

type Props = {
  /** Pip counts. */
  domino: Domino
  /** Quarter turns clockwise the parent applies. */
  turn?: number
  /** The region index under each half, when the domino is on the board. */
  regions?: [number | undefined, number | undefined]
}
