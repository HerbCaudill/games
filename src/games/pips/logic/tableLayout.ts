import type { Point } from "./types"

/**
 * Size and place the board and the tray of dominoes in the available space. Tray dominoes are
 * drawn at the board's scale, so the cell size is the largest that fits both.
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
    const gap = GAP * size
    const perRow = Math.max(1, Math.floor((width + gap) / (2 * size + gap)))
    const board: Point = [(width - cols * size) / 2, MARGIN * size]
    const trayTop = board[1] + (rows + MARGIN + TRAY_GAP) * size
    const slots = Array.from({ length: count }, (_, i): Point => {
      const row = Math.floor(i / perRow)
      const inRow = Math.min(perRow, count - row * perRow)
      const rowWidth = inRow * 2 * size + (inRow - 1) * gap
      const x = (width - rowWidth) / 2 + (i % perRow) * (2 * size + gap) + size
      const y = trayTop + row * (size + gap) + size / 2
      // Slots are kept in cell units from the board's corner, like everything else on the table.
      return [(x - board[0]) / size, (y - board[1]) / size]
    })
    const trayRows = Math.ceil(count / perRow)
    const boardHeight = board[1] + (rows + MARGIN) * size
    return {
      size,
      board,
      slots,
      boardHeight,
      height: trayTop + trayRows * size + (trayRows - 1) * gap + MARGIN * size,
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

/** Space between tray slots, in cells. */
const GAP = 0.3

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
  /** Centers of the tray slots, in cell units from the board's corner. */
  slots: Point[]
  /** Height of the board and its margin alone, in pixels. */
  boardHeight: number
  /** Height of the whole table, in pixels. */
  height: number
}
