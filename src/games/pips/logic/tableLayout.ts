import { SNAP, TRAY_SCALE } from "./constants"
import type { Point } from "./types"

/**
 * Size and place the board and the tray of dominoes in the available space. Tray dominoes are
 * drawn at `TRAY_SCALE` of the board's scale, and the cell size is the largest that fits both.
 * Slots run down columns of nearly equal length, from left to right, far enough apart that any
 * domino can turn without reaching another. Each lies on the grid loose dominoes snap to, so a
 * domino put back lines up with the rest.
 */
export function tableLayout(
  /** The space and what goes in it. */
  { width, height, rows, cols, count }: Options,
): Layout {
  let size = MAX_SIZE
  for (; size > MIN_SIZE; size--) {
    if ((cols + 2 * MARGIN) * size > width) continue
    if (arrange(size).height <= height) break
  }
  return arrange(size)

  /** The layout at one cell size. */
  function arrange(
    /** Cell size in pixels. */
    size: number,
  ): Layout {
    const tray = TRAY_SCALE * size
    const gap = GAP * tray
    const perRow = Math.max(1, Math.floor((width + gap) / (2 * tray + gap)))
    const board: Point = [(width - cols * size) / 2, MARGIN * size]
    const trayTop = board[1] + (rows + MARGIN + TRAY_GAP) * size
    const trayRows = Math.ceil(count / perRow)
    // A domino's length from one row to the next, so even two turned upright only touch.
    const rowStep = 2 * tray
    // The fewest columns that need no more rows, centered in the space.
    const columns = Math.ceil(count / trayRows)
    const left = (width - columns * 2 * tray - (columns - 1) * gap) / 2
    const slots = Array.from({ length: columns }, (_, column) =>
      Array.from({ length: Math.ceil((count - column) / columns) }, (_, row): Point => {
        const x = left + column * (2 * tray + gap) + tray
        const y = trayTop + row * rowStep + tray / 2
        // Slots are kept in cell units from the board's corner, like everything else on the table.
        return [(x - board[0]) / size, (y - board[1]) / size]
      }),
    ).flat()
    const boardHeight = board[1] + (rows + MARGIN) * size
    return {
      size,
      board,
      slots,
      grid: slots[0] ?? [0, 0],
      boardHeight,
      // Down to the foot of a domino turned upright in the last row.
      height: trayTop + (trayRows - 1) * rowStep + tray / 2 + tray,
    }
  }
}

// CONSTANTS

/** Largest cell size, in pixels. */
const MAX_SIZE = 60

/** Smallest cell size, in pixels. */
const MIN_SIZE = 24

/** Room around the board for rule badges, in cells. */
const MARGIN = 0.5

/** Space between the board and the tray, in cells. */
const TRAY_GAP = 0.5

/** Space between tray columns, in tray domino cells: one grid step, so slots fall on the grid. */
const GAP = SNAP / TRAY_SCALE

// TYPES

/** What the layout has to fit. */
type Options = {
  /** Available width in pixels. */
  width: number
  /** Available height in pixels. */
  height: number
  /** Board rows. */
  rows: number
  /** Board columns. */
  cols: number
  /** Number of dominoes in the tray. */
  count: number
}

/** Where things go on the table. */
export type Layout = {
  /** Cell size in pixels. */
  size: number
  /** Top-left corner of the board's first cell, in pixels. */
  board: Point
  /** Centers of the tray slots, down each column in turn, in cell units from the board's corner. */
  slots: Point[]
  /** A point on the grid loose dominoes snap to, in cell units from the board's corner. */
  grid: Point
  /** Height of the board and its margin alone, in pixels. */
  boardHeight: number
  /** Height of the whole table, in pixels. */
  height: number
}
