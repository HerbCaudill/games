import { describe, expect, it } from "vitest"
import { makeRoom } from "../makeRoom"
import { restingSpot } from "../restingSpot"
import { snapToGrid } from "../snapToGrid"
import type { Point, Rect, Surface } from "../types"

// Loose dominoes are 1.5 cells long and 0.75 wide, and the snap grid is a quarter of their width.

/** An open table with some walls. */
function walled(
  /** The walls. */
  ...walls: Rect[]
): Surface {
  return { ...open, walls }
}

/** An open table with the grid at the board's corner. */
const open: Surface = { walls: [], grid: [0, 0], fit: center => center }

describe("snapToGrid", () => {
  it("moves a point to the nearest quarter of a loose domino's width", () => {
    expect(snapToGrid([0.1, 0.3], [0, 0])).toEqual([0.1875, 0.375])
    expect(snapToGrid([-0.4, 1.5], [0, 0])).toEqual([-0.375, 1.5])
  })

  it("lines the grid up with its origin", () => {
    expect(snapToGrid([0.1, 0.3], [0.25, 0.5])).toEqual([0.0625, 0.3125])
  })
})

describe("makeRoom", () => {
  it("pushes a domino it lands on the shortest way clear", () => {
    const loose = [
      { center: [0, 0] as Point, turn: 0 },
      { center: [1, 0.1] as Point, turn: 0 },
    ]
    expect(makeRoom(loose, [0], open)).toEqual(new Map([[1, [1.5, 0.1875]]]))
  })

  it("pushes onto the snap grid", () => {
    const loose = [
      { center: [0, 0] as Point, turn: 0 },
      { center: [1, 0] as Point, turn: 0 },
    ]
    expect(makeRoom(loose, [0], { ...open, grid: [0.25, 0] })).toEqual(new Map([[1, [1.5625, 0]]]))
  })

  it("keeps several dominoes put, pushing others clear of all of them", () => {
    const loose = [
      { center: [0, 0] as Point, turn: 0 },
      { center: [2.8125, 0] as Point, turn: 0 },
      { center: [1.3125, 0.1875] as Point, turn: 0 },
    ]
    // Too little room between the two that stay put, so the third goes below.
    expect(makeRoom(loose, [0, 1], open)).toEqual(new Map([[2, [1.3125, 0.75]]]))
  })

  it("leaves dominoes on the board and dominoes it doesn't touch alone", () => {
    const loose = [{ center: [0, 0] as Point, turn: 0 }, null, { center: [0, 2] as Point, turn: 0 }]
    expect(makeRoom(loose, [0], open)).toEqual(new Map())
  })

  it("pushes on down a row, each domino moving the next", () => {
    const loose = [
      { center: [0, 0] as Point, turn: 0 },
      { center: [1, 0] as Point, turn: 0 },
      { center: [2.5, 0] as Point, turn: 0 },
    ]
    expect(makeRoom(loose, [0], open)).toEqual(
      new Map([
        [1, [1.5, 0]],
        [2, [3, 0]],
      ]),
    )
  })

  it("makes room for a domino turned upright", () => {
    const loose = [
      { center: [0, 0] as Point, turn: 1 },
      { center: [0, -0.9] as Point, turn: 0 },
    ]
    expect(makeRoom(loose, [0], open)).toEqual(new Map([[1, [0, -1.125]]]))
  })

  it("pushes another way rather than onto the board", () => {
    const loose = [
      { center: [0, 0] as Point, turn: 0 },
      { center: [1, 0.1] as Point, turn: 0 },
    ]
    const board = [{ left: 2, top: -0.5, right: 3, bottom: 0.5 }]
    expect(makeRoom(loose, [0], walled(...board))).toEqual(new Map([[1, [0.9375, 0.75]]]))
  })

  it("pushes another way rather than off the screen", () => {
    const loose = [
      { center: [0, 0] as Point, turn: 0 },
      { center: [1, 0.1] as Point, turn: 0 },
    ]
    const screen = ([x, y]: Point): Point => [Math.min(x, 1), y]
    expect(makeRoom(loose, [0], { ...open, fit: screen })).toEqual(new Map([[1, [0.9375, 0.75]]]))
  })
})

describe("restingSpot", () => {
  it("snaps a dropped domino to the grid", () => {
    expect(restingSpot([3.1, 2.3], 0, open)).toEqual([3.1875, 2.25])
  })

  it("snaps inward at the screen's edge", () => {
    const screen = ([x, y]: Point): Point => [Math.min(x, 3.1), y]
    expect(restingSpot([3.1, 2.3], 0, { ...open, fit: screen })).toEqual([3, 2.25])
  })

  it("moves a domino dropped on the edge of the board the shortest way clear of it", () => {
    const cell = { left: 0, top: 0, right: 1, bottom: 1 }
    expect(restingSpot([1.6, 0.5], 0, walled(cell))).toEqual([1.875, 0.5625])
  })

  it("keeps going past board cells it would land on", () => {
    const walls = [
      { left: 0, top: 0, right: 1, bottom: 1 },
      { left: 2, top: 0, right: 3, bottom: 1 },
      // Walls that block every other way out.
      { left: -5, top: -5, right: 10, bottom: 0 },
      { left: -5, top: 1, right: 10, bottom: 5 },
      { left: -5, top: 0, right: 0, bottom: 1 },
    ]
    expect(restingSpot([0.6, 0.5], 0, walled(...walls))).toEqual([3.75, 0.5625])
  })
})
