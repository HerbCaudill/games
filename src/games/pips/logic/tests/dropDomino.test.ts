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
    expect(dropDomino(empty, 0, [0.6, 1.1], 1, board)).toEqual({
      kind: "placed",
      placements: [
        [
          [0, 0],
          [1, 0],
        ],
        null,
      ],
    })
    // Pointing left (direction 2), so the first half lands on the right-hand cell.
    const left = dropDomino(empty, 0, [1, 1.4], 2, board)
    expect(left.kind === "placed" && left.placements[0]).toEqual([
      [1, 1],
      [1, 0],
    ])
  })

  it("moves a domino dropped partly on the board to the nearest spot that fits", () => {
    // Lying flat with its right half hanging off the board's right edge, a bit below the top row.
    const drop = dropDomino(empty, 0, [1.6, 0.7], 0, board)
    expect(drop.kind === "placed" && drop.placements[0]).toEqual([
      [0, 0],
      [0, 1],
    ])
  })

  it("moves a domino off a taken cell to the nearest free spot", () => {
    const placed: Placements = [
      [
        [0, 0],
        [0, 1],
      ],
      null,
    ]
    const drop = dropDomino(placed, 1, [1, 0.6], 0, board)
    expect(drop.kind === "placed" && drop.placements[1]).toEqual([
      [1, 0],
      [1, 1],
    ])
  })

  it("turns a domino only when no spot fits the way it faces", () => {
    const column: PipsBoard = {
      ...board,
      regions: [
        {
          cells: [
            [0, 0],
            [1, 0],
          ],
          type: "empty",
        },
      ],
    }
    const drop = dropDomino(empty, 0, [0.8, 1], 0, column)
    expect(drop.kind === "placed" && drop.placements[0]).toEqual([
      [0, 0],
      [1, 0],
    ])
  })

  it("leaves a domino dropped off the board where it lies", () => {
    expect(dropDomino(empty, 0, [4, 4], 0, board)).toEqual({ kind: "loose" })
    // Barely grazing the board's corner still counts as off it.
    expect(dropDomino(empty, 0, [2.9, 1.6], 0, board)).toEqual({ kind: "loose" })
  })

  it("says when a domino dropped on the board has nowhere to go", () => {
    const full: Placements = [
      [
        [0, 0],
        [0, 1],
      ],
      [
        [1, 0],
        [1, 1],
      ],
    ]
    const third = { ...board, dominoes: [...board.dominoes, [1, 1] as [number, number]] }
    expect(dropDomino([...full, null], 2, [1, 1], 0, third)).toEqual({ kind: "blocked" })
  })
})
