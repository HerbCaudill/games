import { describe, expect, it } from "vitest"
import { BADGE_REACH, SNAP, TRAY_SCALE } from "../constants"
import { footprint } from "../footprint"
import { overlaps } from "../overlaps"
import { tableLayout } from "../tableLayout"

describe("tableLayout", () => {
  it("fits the board and a tray of dominoes in the space", () => {
    const layout = tableLayout({ width: 700, height: 800, rows: 8, cols: 10, count: 15 })
    expect(layout.height).toBeLessThanOrEqual(800)
    expect(layout.slots).toHaveLength(15)
    for (const [x, y] of layout.slots) {
      // Slots hold smaller dominoes lying flat, in cell units from the board's corner.
      const left = layout.board[0] + (x - TRAY_SCALE) * layout.size
      const right = layout.board[0] + (x + TRAY_SCALE) * layout.size
      expect(left).toBeGreaterThanOrEqual(0)
      expect(right).toBeLessThanOrEqual(700)
      expect(y).toBeGreaterThan(8)
    }
  })

  it("shrinks cells when the space is short", () => {
    const tall = tableLayout({ width: 700, height: 2000, rows: 8, cols: 10, count: 15 })
    const short = tableLayout({ width: 700, height: 600, rows: 8, cols: 10, count: 15 })
    expect(short.size).toBeLessThan(tall.size)
    expect(short.height).toBeLessThanOrEqual(600)
  })

  it("leaves room to turn any domino without reaching another, the board or past the bottom", () => {
    for (const count of [2, 7, 12, 14, 16]) {
      const rows = 6
      const { slots, size, board, height } = tableLayout({
        width: 360,
        height: 600,
        rows,
        cols: 7,
        count,
      })
      for (const [i, slot] of slots.entries())
        for (const turn of [0, 1]) {
          const turned = footprint(slot, turn)
          expect(turned.top).toBeGreaterThanOrEqual(rows + BADGE_REACH)
          expect(board[1] + turned.bottom * size).toBeLessThanOrEqual(height + 1e-6)
          for (const other of slots.slice(i + 1))
            for (const otherTurn of [0, 1])
              expect(overlaps(turned, footprint(other, otherTurn))).toBe(false)
        }
    }
  })

  it("fills the tray down each column in turn, with no column more than one longer than another", () => {
    for (const count of [5, 7, 13, 14, 16]) {
      const { slots } = tableLayout({ width: 360, height: 700, rows: 6, cols: 7, count })
      const inReadingDownOrder = [...slots].sort((a, b) => a[0] - b[0] || a[1] - b[1])
      expect(slots).toEqual(inReadingDownOrder)
      const columns = [...new Set(slots.map(([x]) => x))]
      const lengths = columns.map(x => slots.filter(slot => slot[0] === x).length)
      expect(Math.max(...lengths) - Math.min(...lengths)).toBeLessThanOrEqual(1)
      for (const x of columns) expect(slots.find(slot => slot[0] === x)![1]).toBe(slots[0][1])
    }
  })

  it("puts every slot on the grid loose dominoes snap to", () => {
    for (const count of [7, 12, 15]) {
      const { slots, grid } = tableLayout({ width: 360, height: 700, rows: 6, cols: 7, count })
      for (const slot of slots)
        for (const axis of [0, 1]) {
          const steps = (slot[axis] - grid[axis]) / SNAP
          expect(steps).toBeCloseTo(Math.round(steps), 6)
        }
    }
  })
})
