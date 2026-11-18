import { describe, expect, it } from "vitest"
import { TRAY_SCALE } from "../constants"
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

  it("keeps slots from overlapping", () => {
    const { slots } = tableLayout({ width: 360, height: 700, rows: 6, cols: 7, count: 12 })
    for (const [i, a] of slots.entries())
      for (const b of slots.slice(i + 1))
        expect(Math.abs(a[0] - b[0]) >= 2 * TRAY_SCALE || Math.abs(a[1] - b[1]) >= TRAY_SCALE).toBe(
          true,
        )
  })
})
