import { describe, expect, it } from "vitest"
import type { PipsBoard } from "@/types"
import { dropDomino } from "../dropDomino"
import { type Placements } from "../types"

// A 2x2 board with no rules to speak of.
const board: PipsBoard = {
  id: 1,
  constructors: "Someone",
  dominoes: [
    [2, 1],
    [3, 1],
  ],
  regions: [
    {
      cells: [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ],
      type: "empty",
    },
  ],
  solution: [],
}

const empty: Placements = [null, null]

describe("dropDomino", () => {
  it("places a domino on the cells under its halves", () => {
    // Pointing down (direction 1), centered on the line between the two left cells.
    expect(dropDomino(empty, 0, [0.6, 1.1], 1, board)?.[0]).toEqual([
      [0, 0],
      [1, 0],
    ])
    // Pointing left (direction 2), so the first half lands on the right-hand cell.
    expect(dropDomino(empty, 0, [1, 1.4], 2, board)?.[0]).toEqual([
      [1, 1],
      [1, 0],
    ])
  })

  it("does not place a domino with a half off the board", () => {
    expect(dropDomino(empty, 0, [2, 0.5], 0, board)).toBeUndefined()
  })

  it("does not place a domino on a taken cell", () => {
    const placed: Placements = [
      [
        [0, 0],
        [0, 1],
      ],
      null,
    ]
    expect(dropDomino(placed, 1, [1, 0.5], 0, board)).toBeUndefined()
  })
})
