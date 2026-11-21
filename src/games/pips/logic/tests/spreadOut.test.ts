import { describe, expect, it } from "vitest"
import { spreadOut } from "../spreadOut"
import type { Point, Surface } from "../types"

// Loose dominoes are 1.5 cells long and 0.75 wide, and the snap grid is a quarter of their width.

/** An open table with the grid at the board's corner. */
const open: Surface = { walls: [], grid: [0, 0], fit: center => center }

describe("spreadOut", () => {
  it("leaves dominoes that don't overlap alone", () => {
    const loose = [{ center: [0, 0] as Point, turn: 0 }, null, { center: [0, 1] as Point, turn: 0 }]
    expect(spreadOut(loose, [0, 2], open)).toEqual(new Map())
  })

  it("moves a domino that was pulled in to the nearest free spot on the grid", () => {
    const loose = [
      { center: [0, 0] as Point, turn: 0 },
      { center: [1, 0] as Point, turn: 0 },
    ]
    expect(spreadOut(loose, [1], open)).toEqual(new Map([[1, [1.5, 0]]]))
  })

  it("keeps dominoes that weren't pulled in where they are", () => {
    const loose = [
      { center: [0, 0] as Point, turn: 0 },
      { center: [1, 0] as Point, turn: 0 },
    ]
    expect(spreadOut(loose, [0], open)).toEqual(new Map([[0, [-0.5625, 0]]]))
  })

  it("spreads out dominoes that were all pulled in, keeping the first in place", () => {
    const loose = [
      { center: [0, 0] as Point, turn: 0 },
      { center: [0.5, 0] as Point, turn: 0 },
    ]
    expect(spreadOut(loose, [0, 1], open)).toEqual(new Map([[1, [0.5625, 0.75]]]))
  })

  it("finds a spot that's on screen and off the board", () => {
    const loose = [
      { center: [0, 0] as Point, turn: 0 },
      { center: [1, 0] as Point, turn: 0 },
    ]
    const surface: Surface = {
      walls: [{ left: 1, top: -1, right: 3, bottom: 1 }],
      grid: [0, 0],
      fit: ([x, y]) => [x, Math.max(y, -0.375)],
    }
    // Not right onto the board, nor up off the screen, so down.
    expect(spreadOut(loose, [1], surface)).toEqual(new Map([[1, [0.1875, 0.75]]]))
  })
})
