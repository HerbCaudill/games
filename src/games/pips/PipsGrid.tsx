import type { Cell, PipsBoard, PipsRegion } from "@/types"
import { PipDots } from "./PipDots"
import { boardCells } from "./logic/boardCells"
import { cellKey } from "./logic/cellKey"
import { outline } from "./logic/outline"
import { regionStatus } from "./logic/regionStatus"
import { type Placements, type Point } from "./logic/types"

/** The board: colored regions with their rules, and the dominoes placed so far. */
export function PipsGrid(
  /** The component props. */
  { board, placements, cursor, onCell }: Props,
) {
  const cells = boardCells(board)
  const rows = Math.max(...cells.map(([r]) => r)) + 1
  const cols = Math.max(...cells.map(([, c]) => c)) + 1

  return (
    <svg
      viewBox={`${-PAD} ${-PAD} ${cols * U + 2 * PAD} ${rows * U + 2 * PAD}`}
      className="w-full select-none"
      style={{ maxWidth: `${cols * 5.5}rem`, maxHeight: "58vh" }}
      role="grid"
      aria-label="Board"
    >
      {/* Every board cell shares one shade, so the open spots read as one shape. */}
      <path
        d={roundedPath(outline(cells, 0), 1.6)}
        className="fill-muted stroke-muted"
        strokeWidth="0.8"
      />

      {board.regions.map(
        (region, i) =>
          region.type !== "empty" && (
            <path
              key={i}
              d={roundedPath(outline(region.cells, REGION_INSET), 1.4)}
              style={{ fill: regionFill(i) }}
            />
          ),
      )}
      {placements.map(
        (pair, i) => pair && <PlacedDomino key={i} pair={pair} values={board.dominoes[i]} />,
      )}

      {/* Outlines sit above the dominoes so a covered region keeps its shape. */}
      {board.regions.map(
        (region, i) =>
          region.type !== "empty" && (
            <path
              key={i}
              d={roundedPath(outline(region.cells, REGION_INSET), 1.4)}
              className="fill-none"
              style={{ stroke: regionStroke(i) }}
              strokeWidth="0.45"
              strokeDasharray="1.4 1"
              strokeLinecap="round"
            />
          ),
      )}

      {board.regions.map(
        (region, i) =>
          region.type !== "empty" && (
            <RegionBadge
              key={i}
              region={region}
              color={regionFill(i)}
              broken={regionStatus(region, placements, board) === "broken"}
            />
          ),
      )}

      <rect
        x={cursor[1] * U + 0.5}
        y={cursor[0] * U + 0.5}
        width={U - 1}
        height={U - 1}
        rx="1.6"
        className="fill-none stroke-(--game-pips) pointer-coarse:hidden"
        strokeWidth="0.8"
      />

      {/* Hit areas on top, so taps land on the cell whether or not a domino covers it. */}
      {cells.map(cell => (
        <rect
          key={cellKey(cell)}
          x={cell[1] * U}
          y={cell[0] * U}
          width={U}
          height={U}
          fill="transparent"
          className="cursor-pointer"
          role="gridcell"
          aria-label={`Row ${cell[0] + 1}, column ${cell[1] + 1}`}
          onClick={() => onCell(cell)}
        />
      ))}
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

/** A domino lying on two cells. */
function PlacedDomino({ pair: [a, b], values }: { pair: [Cell, Cell]; values: [number, number] }) {
  const top = Math.min(a[0], b[0])
  const left = Math.min(a[1], b[1])
  const vertical = a[1] === b[1]
  return (
    <g className="pointer-events-none">
      <rect
        x={left * U + 0.9}
        y={top * U + 0.9}
        width={(vertical ? U : 2 * U) - 1.8}
        height={(vertical ? 2 * U : U) - 1.8}
        rx="1.8"
        className="fill-card stroke-foreground"
        strokeWidth="0.5"
      />
      {vertical ? (
        <line
          x1={left * U + 2.5}
          x2={left * U + U - 2.5}
          y1={(top + 1) * U}
          y2={(top + 1) * U}
          className="stroke-foreground/40"
          strokeWidth="0.4"
        />
      ) : (
        <line
          y1={top * U + 2.5}
          y2={top * U + U - 2.5}
          x1={(left + 1) * U}
          x2={(left + 1) * U}
          className="stroke-foreground/40"
          strokeWidth="0.4"
        />
      )}
      <PipDots value={values[0]} x={a[1] * U} y={a[0] * U} size={U} />
      <PipDots value={values[1]} x={b[1] * U} y={b[0] * U} size={U} />
    </g>
  )
}

/** The rule label at a region's last cell. */
function RegionBadge({
  region,
  color,
  broken,
}: {
  region: PipsRegion
  color: string
  broken: boolean
}) {
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
  const x = c * U + U - 1.2
  const y = r * U + U - 1.2
  return (
    <g className="pointer-events-none">
      <rect
        x={x - 3.2}
        y={y - 3.2}
        width="6.4"
        height="6.4"
        rx="1"
        transform={`rotate(45 ${x} ${y})`}
        style={{ fill: broken ? "var(--destructive)" : color }}
        className="stroke-foreground"
        strokeWidth="0.45"
      />
      <text
        x={x}
        y={y}
        dy="1.15"
        textAnchor="middle"
        className={broken ? "fill-white" : "fill-foreground"}
        style={{ font: `700 ${label.length > 2 ? 2.6 : 3.3}px var(--font-sans)` }}
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

type Props = {
  /** The board. */
  board: PipsBoard
  /** Where each domino sits. */
  placements: Placements
  /** The keyboard cursor. */
  cursor: Cell
  /** The domino in hand, if any. */
  selected?: number
  /** Its direction. */
  direction: number
  /** Called when a cell is tapped. */
  onCell: (cell: Cell) => void
}
