import type { Cell, PipsBoard, PipsRegion } from "@/types"

/** Every cell on the board, which is every cell in a region. */
export function boardCells(
  /** The board. */
  board: PipsBoard,
): Cell[] {
  const seen = new Map<string, Cell>()
  for (const region of board.regions) for (const cell of region.cells) seen.set(cellKey(cell), cell)
  return [...seen.values()]
}

/** A stable string key for a cell. */
export function cellKey(
  /** The cell. */
  [row, col]: Cell,
) {
  return `${row},${col}`
}

/** Put a domino on two cells, first half on `a`; undefined if the move is not allowed. */
export function place(
  /** Current placements. */
  placements: Placements,
  /** Which domino. */
  index: number,
  /** Cell for the domino's first half. */
  a: Cell,
  /** Cell for the domino's second half. */
  b: Cell,
  /** The board. */
  board: PipsBoard,
): Placements | undefined {
  const onBoard = new Set(boardCells(board).map(cellKey))
  if (!onBoard.has(cellKey(a)) || !onBoard.has(cellKey(b))) return undefined
  if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) !== 1) return undefined
  const taken = new Set(
    placements.flatMap((cells, i) => (cells && i !== index ? cells.map(cellKey) : [])),
  )
  if (taken.has(cellKey(a)) || taken.has(cellKey(b))) return undefined
  return placements.map((cells, i) => (i === index ? [a, b] : cells))
}

/** Put a domino's first half on a cell, trying the preferred direction first and then turning clockwise. */
export function placeAt(
  /** Current placements. */
  placements: Placements,
  /** Which domino. */
  index: number,
  /** Cell for the domino's first half. */
  cell: Cell,
  /** Preferred direction from the first half to the second, as an index into DIRECTIONS. */
  direction: number,
  /** The board. */
  board: PipsBoard,
): { placements: Placements; direction: number } | undefined {
  for (let turn = 0; turn < DIRECTIONS.length; turn++) {
    const d = (direction + turn) % DIRECTIONS.length
    const [dr, dc] = DIRECTIONS[d]
    const result = place(placements, index, cell, [cell[0] + dr, cell[1] + dc], board)
    if (result) return { placements: result, direction: d }
  }
  return undefined
}

/** Take a domino off the board. */
export function removeDomino(
  /** Current placements. */
  placements: Placements,
  /** Which domino. */
  index: number,
): Placements {
  return placements.map((cells, i) => (i === index ? null : cells))
}

/** Pip counts on occupied cells. */
export function cellValues(
  /** Current placements. */
  placements: Placements,
  /** The board. */
  board: PipsBoard,
) {
  const values = new Map<string, number>()
  placements.forEach((cells, i) => {
    if (!cells) return
    values.set(cellKey(cells[0]), board.dominoes[i][0])
    values.set(cellKey(cells[1]), board.dominoes[i][1])
  })
  return values
}

/** Whether a region's rule is met, broken, or still open. */
export function regionStatus(
  /** The region. */
  region: PipsRegion,
  /** Current placements. */
  placements: Placements,
  /** The board. */
  board: PipsBoard,
): RegionStatus {
  const all = cellValues(placements, board)
  const values = region.cells.map(cellKey).flatMap(key => (all.has(key) ? [all.get(key)!] : []))
  const complete = values.length === region.cells.length
  const sum = values.reduce((a, b) => a + b, 0)
  const target = region.target ?? 0
  // Pips are never negative, so a partial sum that is already too big can't recover.
  const broken = {
    sum: sum > target || (complete && sum !== target),
    less: sum >= target,
    greater: complete && sum <= target,
    equals: new Set(values).size > 1,
    unequal: new Set(values).size < values.length,
    empty: false,
  }[region.type]
  if (broken) return "broken"
  return complete ? "met" : "incomplete"
}

/** Whether every domino is placed and every rule is met. */
export function isSolved(
  /** Current placements. */
  placements: Placements,
  /** The board. */
  board: PipsBoard,
) {
  return (
    placements.every(Boolean) &&
    board.regions.every(region => regionStatus(region, placements, board) === "met")
  )
}

// CONSTANTS

/** Offsets from a domino's first half to its second: right, down, left, up. */
export const DIRECTIONS: Cell[] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
]

// TYPES

/** Where each domino sits, by domino index; null when it is still in the tray. */
export type Placements = ([Cell, Cell] | null)[]

/** How a region stands. */
export type RegionStatus = "met" | "broken" | "incomplete"
