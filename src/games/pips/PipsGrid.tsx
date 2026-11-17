import { useId } from "react"
import { cn } from "@/lib/utils"
import type { Cell, PipsBoard, PipsRegion } from "@/types"
import { dominoGeometry } from "./dominoGeometry"
import { boardCells } from "./logic/boardCells"
import { cellKey } from "./logic/cellKey"
import { outline } from "./logic/outline"
import { regionStatus } from "./logic/regionStatus"
import { regionColors } from "./regionColors"
import { type Placements, type Point } from "./logic/types"
import "./pips.css"

/**
 * One layer of the board, drawn to scale over the board's cells. The base has shaded cells
 * and region fills; the overlay has outlines and the keyboard cursor; badges sit above play.
 */
export function PipsGrid(
  /** The component props. */
  { board, placements, layer, size, origin, cursor }: Props,
) {
  const cells = boardCells(board)
  const rows = Math.max(...cells.map(([r]) => r)) + 1
  const cols = Math.max(...cells.map(([, c]) => c)) + 1
  const scale = size / U
  // Outlines trace the domino borders exactly, so on a covered region the dashes lie on the border.
  const regions = board.regions.flatMap((region, i) =>
    region.type === "empty"
      ? []
      : [
          {
            region,
            i,
            shape: roundedPath(
              outline(region.cells, dominoGeometry.inset / U),
              dominoGeometry.radius,
            ),
          },
        ],
  )

  return (
    <svg
      viewBox={`${-PAD} ${-PAD} ${cols * U + 2 * PAD} ${rows * U + 2 * PAD}`}
      className={cn(
        "pointer-events-none absolute select-none",
        layer === "overlay" && "z-20",
        layer === "badges" && "z-40",
      )}
      style={{
        left: origin[0] - PAD * scale,
        top: origin[1] - PAD * scale,
        width: (cols * U + 2 * PAD) * scale,
        height: (rows * U + 2 * PAD) * scale,
      }}
      {...(layer === "overlay" ? { role: "grid", "aria-label": "Board" } : {})}
    >
      {layer === "base" ? (
        <>
          {/* Every board cell shares one shade, so the open spots read as one shape. */}
          <path
            d={roundedPath(outline(cells, 0), 1.6)}
            className="fill-muted stroke-muted"
            strokeWidth="0.8"
          />
          {regions.map(({ i, shape }) => (
            <path key={i} d={shape} style={{ fill: regionColors.fill(i) }} />
          ))}
        </>
      ) : layer === "overlay" ? (
        <>
          {/* Outlines sit above the dominoes so a covered region keeps its shape. */}
          {regions.map(({ i, shape }) => (
            <path
              key={i}
              d={shape}
              className="fill-none"
              style={{ stroke: regionColors.stroke(i) }}
              strokeWidth={REGION_STROKE_WIDTH}
              strokeDasharray="1.4 1"
              strokeLinecap="round"
            />
          ))}
          {cursor && (
            <rect
              x={cursor[1] * U + 0.5}
              y={cursor[0] * U + 0.5}
              width={U - 1}
              height={U - 1}
              rx="1.6"
              className="fill-none stroke-(--game-pips)"
              strokeWidth="0.8"
            />
          )}
          {cells.map(cell => (
            <rect
              key={cellKey(cell)}
              x={cell[1] * U}
              y={cell[0] * U}
              width={U}
              height={U}
              fill="none"
              role="gridcell"
              aria-label={`Row ${cell[0] + 1}, column ${cell[1] + 1}`}
            />
          ))}
        </>
      ) : (
        regions.map(({ region, i, shape }) => (
          <RegionBadge
            key={i}
            region={region}
            shape={shape}
            color={regionColors.stroke(i)}
            broken={regionStatus(region, placements, board) === "broken"}
          />
        ))
      )}
    </svg>
  )
}

/** An SVG path through outline loops given in cell units, with rounded corners. */
function roundedPath(
  /** The loops. */
  loops: Point[][],
  /** Corner radius. */
  radius: number,
) {
  return loops
    .map(
      loop =>
        loop
          .map((p, i) => {
            const prev = loop[(i + loop.length - 1) % loop.length]
            const next = loop[(i + 1) % loop.length]
            const [x, y] = [p[0] * U, p[1] * U]
            const into = toward(p, prev, radius)
            const out = toward(p, next, radius)
            const sweep = into[0] * out[1] - into[1] * out[0] < 0 ? 1 : 0
            return `${i ? "L" : "M"}${x + into[0]},${y + into[1]}A${radius},${radius} 0 0 ${sweep} ${x + out[0]},${y + out[1]}`
          })
          .join("") + "Z",
    )
    .join("")
}

/** A step from one corner toward another, no longer than `radius` or half the way there. */
function toward(
  /** Start corner, in cell units. */
  from: Point,
  /** End corner, in cell units. */
  to: Point,
  /** Longest step. */
  radius: number,
): Point {
  const [dx, dy] = [(to[0] - from[0]) * U, (to[1] - from[1]) * U]
  const length = Math.hypot(dx, dy)
  const step = Math.min(radius, length / 2) / length
  return [dx * step, dy * step]
}

/** The rule label at a region's last cell. */
function RegionBadge(
  /** The component props. */
  { region, shape, color, broken }: RegionBadgeProps,
) {
  const mask = `pips-notch-${useId().replace(/[^\w-]/g, "")}`
  const [r, c] = region.cells.reduce((last, cell) =>
    cell[0] > last[0] || (cell[0] === last[0] && cell[1] > last[1]) ? cell : last,
  )
  const label = {
    sum: String(region.target),
    less: `<${region.target}`,
    greater: `>${region.target}`,
    equals: "=",
    unequal: "≠",
    empty: "",
  }[region.type]
  const x = (c + 1) * U
  const y = (r + 1) * U
  return (
    <g
      role={broken ? "img" : undefined}
      aria-label={broken ? `Broken constraint: ${label}` : undefined}
      aria-hidden={broken ? undefined : true}
      className={cn(broken && "pips-warning")}
    >
      {/* Notch the diamond along the inner edge of its region's outline, so the board shows through. */}
      <mask id={mask} maskUnits="userSpaceOnUse" x={x - 3} y={y - 3} width="6" height="6">
        <rect x={x - 3} y={y - 3} width="6" height="6" fill="white" />
        <path d={shape} fill="black" stroke="white" strokeWidth={REGION_STROKE_WIDTH} />
      </mask>
      <g mask={`url(#${mask})`}>
        <path
          d={BADGE_PATH}
          transform={`translate(${x} ${y})`}
          style={{ fill: broken ? "#ff0000" : color }}
        />
      </g>
      <text
        x={x}
        y={y}
        dy="0.8"
        textAnchor="middle"
        style={{
          fill: "white",
          font: `700 ${label.length > 2 ? 1.8 : 2.4}px var(--font-sans)`,
        }}
      >
        {label}
      </text>
    </g>
  )
}

// CONSTANTS

/** Cell size. */
const U = dominoGeometry.unit

/** Region outline width, in SVG units. */
const REGION_STROKE_WIDTH = 0.45

/** Room around the board for badges that hang off its edge. */
const PAD = 4.5

/** The rounded 4.2-unit diamond. */
const BADGE_PATH =
  "M-0.389,-2.581 A0.55,0.55 0 0 1 0.389,-2.581 " +
  "L2.581,-0.389 A0.55,0.55 0 0 1 2.581,0.389 " +
  "L0.389,2.581 A0.55,0.55 0 0 1 -0.389,2.581 " +
  "L-2.581,0.389 A0.55,0.55 0 0 1 -2.581,-0.389 Z"

// TYPES

type RegionBadgeProps = {
  /** The rule and its cells. */
  region: PipsRegion
  /** The region's outline path, whose inside the diamond leaves uncovered. */
  shape: string
  /** The region's outline color. */
  color: string
  /** Whether to show the active warning. */
  broken: boolean
}

type Props = {
  /** The board. */
  board: PipsBoard
  /** Where each domino sits. */
  placements: Placements
  /** Which layer to draw. */
  layer: "base" | "overlay" | "badges"
  /** Cell size in pixels. */
  size: number
  /** Top-left corner of the board's first cell, in pixels. */
  origin: Point
  /** The keyboard cursor, when the keyboard is in use. */
  cursor?: Cell
}
