import { describe, expect, it } from "vitest"
import { makeRoom } from "../makeRoom"
import { snapToGrid } from "../snapToGrid"
import type { Point } from "../types"

// Loose dominoes are 1.5 cells long and 0.75 wide, and the snap grid is a quarter of their width.

/** Leave every center where it is. */
const anywhere = (center: Point) => center

describe("snapToGrid", () => {
  it("moves a point to the nearest quarter of a loose domino's width", () => {
    expect(snapToGrid([0.1, 0.3])).toEqual([0.1875, 0.375])
    expect(snapToGrid([-0.4, 1.5])).toEqual([-0.375, 1.5])
  })
})

describe("makeRoom", () => {
  it("pushes a domino it lands on the shortest way clear", () => {
    const loose = [
      { center: [0, 0] as Point, turn: 0 },
      { center: [1, 0.1] as Point, turn: 0 },
    ]
    expect(makeRoom(loose, 0, [], anywhere)).toEqual(new Map([[1, [1.5, 0.1]]]))
  })

  it("pushes onto the snap grid", () => {
    const loose = [
      { center: [0.1, 0] as Point, turn: 0 },
      { center: [1, 0] as Point, turn: 0 },
    ]
    expect(makeRoom(loose, 0, [], anywhere)).toEqual(new Map([[1, [1.6875, 0]]]))
  })

  it("leaves dominoes on the board and dominoes it doesn't touch alone", () => {
    const loose = [{ center: [0, 0] as Point, turn: 0 }, null, { center: [0, 2] as Point, turn: 0 }]
    expect(makeRoom(loose, 0, [], anywhere)).toEqual(new Map())
  })

  it("pushes on down a row, each domino moving the next", () => {
    const loose = [
      { center: [0, 0] as Point, turn: 0 },
      { center: [1, 0] as Point, turn: 0 },
      { center: [2.5, 0] as Point, turn: 0 },
    ]
    expect(makeRoom(loose, 0, [], anywhere)).toEqual(
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
    expect(makeRoom(loose, 0, [], anywhere)).toEqual(new Map([[1, [0, -1.125]]]))
  })

  it("pushes another way rather than onto the board", () => {
    const loose = [
      { center: [0, 0] as Point, turn: 0 },
      { center: [1, 0.1] as Point, turn: 0 },
    ]
    const board = [{ left: 2, top: -0.5, right: 3, bottom: 0.5 }]
    expect(makeRoom(loose, 0, board, anywhere)).toEqual(new Map([[1, [1, 0.75]]]))
  })

  it("pushes another way rather than off the screen", () => {
    const loose = [
      { center: [0, 0] as Point, turn: 0 },
      { center: [1, 0.1] as Point, turn: 0 },
    ]
    const screen = ([x, y]: Point): Point => [Math.min(x, 1), y]
    expect(makeRoom(loose, 0, [], screen)).toEqual(new Map([[1, [1, 0.75]]]))
  })
})
