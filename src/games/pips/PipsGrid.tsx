import type { Cell, PipsBoard, PipsRegion } from "@/types"
import { PipDots } from "./PipDots"
import { boardCells, cellKey, regionStatus, type Placements } from "./pipsRules"

/** The board: colored regions with their rules, and the dominoes placed so far. */
export function PipsGrid({ board, placements, cursor, onCell }: Props) {
  const cells = boardCells(board)
  const rows = Math.max(...cells.map(([r]) => r)) + 1
  const cols = Math.max(...cells.map(([, c]) => c)) + 1
  const regionOf = new Map<string, number>()
  board.regions.forEach((region, i) => region.cells.forEach(cell => regionOf.set(cellKey(cell), i)))
  const fill = (i: number) =>
    board.regions[i].type === "empty" ? "var(--muted)" : REGION_COLORS[i % REGION_COLORS.length]

  return (
    <svg
      viewBox={`${-PAD} ${-PAD} ${cols * U + 2 * PAD} ${rows * U + 2 * PAD}`}
      className="w-full select-none"
      style={{ maxWidth: `${cols * 5.5}rem`, maxHeight: "58vh" }}
      role="grid"
      aria-label="Board"
    >
      {/* Region tiles, with bridges between neighbors so each region reads as one shape. */}
      {cells.map(cell => {
        const [r, c] = cell
        const region = regionOf.get(cellKey(cell))!
        const right = regionOf.get(cellKey([r, c + 1])) === region
        const below = regionOf.get(cellKey([r + 1, c])) === region
        return (
          <g key={cellKey(cell)} style={{ fill: fill(region) }}>
            <rect
              x={c * U + GAP}
              y={r * U + GAP}
              width={U - 2 * GAP}
              height={U - 2 * GAP}
              rx="1.4"
            />
            {right && (
              <rect
                x={c * U + U - GAP - 1}
                y={r * U + GAP}
                width={2 * GAP + 2}
                height={U - 2 * GAP}
              />
            )}
            {below && (
              <rect
                x={c * U + GAP}
                y={r * U + U - GAP - 1}
                width={U - 2 * GAP}
                height={2 * GAP + 2}
              />
            )}
          </g>
        )
      })}

      {placements.map(
        (pair, i) => pair && <PlacedDomino key={i} pair={pair} values={board.dominoes[i]} />,
      )}

      {board.regions.map(
        (region, i) =>
          region.type !== "empty" && (
            <RegionBadge
              key={i}
              region={region}
              color={fill(i)}
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
        strokeWidth="0.7"
        strokeDasharray="2 1.2"
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

/** Gap between region tiles. */
const GAP = 0.35

/** Room around the board for badges that hang off its edge. */
const PAD = 3

/** Region tints, cycled by region. */
const REGION_COLORS = [
  "color-mix(in oklch, #e8956b 55%, var(--card))",
  "color-mix(in oklch, #6fb59a 55%, var(--card))",
  "color-mix(in oklch, #8ea5dc 55%, var(--card))",
  "color-mix(in oklch, #d58fc0 55%, var(--card))",
  "color-mix(in oklch, #e2c25c 55%, var(--card))",
  "color-mix(in oklch, #7fc3d6 55%, var(--card))",
  "color-mix(in oklch, #b39ae0 55%, var(--card))",
  "color-mix(in oklch, #a9c46a 55%, var(--card))",
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
