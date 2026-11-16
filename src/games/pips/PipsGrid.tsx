import { cn } from "@/lib/utils"
import type { Cell, PipsBoard, PipsRegion } from "@/types"
import { boardCells } from "./logic/boardCells"
import { cellKey } from "./logic/cellKey"
import { outline } from "./logic/outline"
import { regionStatus } from "./logic/regionStatus"
import { type Placements, type Point } from "./logic/types"
import "./pips.css"

/**
 * One layer of the board, drawn to scale over the board's cells. The base layer has the shaded
 * cells, region fills and tucked-under rule badges, including broken-constraint warnings;
 * the overlay has outlines and the keyboard cursor.
 */
export function PipsGrid(
  /** The component props. */
  { board, placements, layer, size, origin, cursor }: Props,
) {
  const cells = boardCells(board)
  const rows = Math.max(...cells.map(([r]) => r)) + 1
  const cols = Math.max(...cells.map(([, c]) => c)) + 1
  const scale = size / U
  const regions = board.regions.flatMap((region, i) =>
    region.type === "empty" ? [] : [{ region, i }],
  )

  return (
    <svg
      viewBox={`${-PAD} ${-PAD} ${cols * U + 2 * PAD} ${rows * U + 2 * PAD}`}
      className={cn("pointer-events-none absolute select-none", layer === "overlay" && "z-20")}
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
          {regions.map(({ region, i }) => (
            <path
              key={i}
              d={roundedPath(outline(region.cells, REGION_INSET), 1.4)}
              style={{ fill: regionFill(i) }}
            />
          ))}
          {regions.map(({ region, i }) => (
            <RegionBadge
              key={i}
              region={region}
              color={regionStroke(i)}
              shade={regionFill(i)}
              broken={regionStatus(region, placements, board) === "broken"}
            />
          ))}
        </>
      ) : (
        <>
          {/* Outlines sit above the dominoes so a covered region keeps its shape. */}
          {regions.map(({ region, i }) => (
            <path
              key={i}
              d={roundedPath(outline(region.cells, REGION_INSET), 1.4)}
              className="fill-none"
              style={{ stroke: regionStroke(i) }}
              strokeWidth="0.45"
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
            return `${i ? "L" : "M"}${x + into[0]},${y + into[1]}Q${x},${y} ${x + out[0]},${y + out[1]}`
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

/** A region's fill. */
function regionFill(
  /** Region index. */
  i: number,
) {
  return `color-mix(in oklch, ${REGION_COLORS[i % REGION_COLORS.length]} 45%, var(--card))`
}

/** A region's outline color. */
function regionStroke(
  /** Region index. */
  i: number,
) {
  return `oklch(from ${REGION_COLORS[i % REGION_COLORS.length]} calc(l - 0.16) calc(c + 0.04) h)`
}

/** The rule label at a region's last cell. */
function RegionBadge(
  /** The component props. */
  { region, color, shade, broken }: RegionBadgeProps,
) {
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
  const x = c * U + U + 0.8
  const y = r * U + U + 0.8
  return (
    <g
      role={broken ? "img" : undefined}
      aria-label={broken ? `Broken constraint: ${label}` : undefined}
      aria-hidden={broken ? undefined : true}
      className={cn(broken && "pips-warning")}
    >
      {/* Extend the lighter region fill into its corner; both shapes stay below dominoes. */}
      <rect x={x - 1.97} y={y - 1.97} width="1.17" height="1.17" style={{ fill: shade }} />
      <path
        d={BADGE_PATH}
        transform={`translate(${x} ${y})`}
        style={{
          fill: broken ? "white" : color,
          stroke: broken ? "#c0392b" : undefined,
        }}
        strokeWidth={broken ? 0.3 : undefined}
      />
      <text
        x={x}
        y={y}
        dy="0.8"
        textAnchor="middle"
        style={{
          fill: broken ? "#c0392b" : "white",
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
const U = 10

/** How far region shapes sit inside their cells' edges, in cells. */
const REGION_INSET = 0.07

/** Room around the board for badges that hang off its edge. */
const PAD = 4.5

/** The rounded 4.2-unit diamond, with its upper-left bite ending at the cell corner. */
const BADGE_PATH =
  "M-0.8,-1.97 L-0.389,-2.581 A0.55,0.55 0 0 1 0.389,-2.581 " +
  "L2.581,-0.389 A0.55,0.55 0 0 1 2.581,0.389 " +
  "L0.389,2.581 A0.55,0.55 0 0 1 -0.389,2.581 " +
  "L-2.581,0.389 A0.55,0.55 0 0 1 -2.581,-0.389 L-1.97,-0.8 H-0.8 Z"

/** Region hues, cycled by region. */
const REGION_COLORS = [
  "#e8956b",
  "#6fb59a",
  "#8ea5dc",
  "#d58fc0",
  "#e2c25c",
  "#7fc3d6",
  "#b39ae0",
  "#a9c46a",
]

// TYPES

type RegionBadgeProps = {
  /** The rule and its cells. */
  region: PipsRegion
  /** The region's outline color. */
  color: string
  /** The lighter region shade visible through the bite. */
  shade: string
  /** Whether to show the active warning. */
  broken: boolean
}

type Props = {
  /** The board. */
  board: PipsBoard
  /** Where each domino sits. */
  placements: Placements
  /** Which layer to draw. */
  layer: "base" | "overlay"
  /** Cell size in pixels. */
  size: number
  /** Top-left corner of the board's first cell, in pixels. */
  origin: Point
  /** The keyboard cursor, when the keyboard is in use. */
  cursor?: Cell
}
