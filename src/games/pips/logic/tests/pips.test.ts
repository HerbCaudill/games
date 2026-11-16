import { describe, expect, it } from "vitest"
import type { PipsBoard } from "@/types"
import { boardCells } from "../boardCells"
import { isSolved } from "../isSolved"
import { place } from "../place"
import { regionStatus } from "../regionStatus"
import { type Placements } from "../types"

// A 2x2 board: the top row must sum to 5; the bottom row's halves must be equal.
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
      ],
      type: "sum",
      target: 5,
    },
    {
      cells: [
        [1, 0],
        [1, 1],
      ],
      type: "equals",
    },
  ],
  solution: [
    [
      [0, 0],
      [1, 0],
    ],
    [
      [0, 1],
      [1, 1],
    ],
  ],
}

const empty: Placements = [null, null]

describe("place", () => {
  it("places a domino on two free, adjacent board cells", () => {
    const placements = place(empty, 0, [0, 0], [1, 0], board)
    expect(placements?.[0]).toEqual([
      [0, 0],
      [1, 0],
    ])
  })

  it("refuses cells that are off the board, taken, or not adjacent", () => {
    expect(place(empty, 0, [0, 1], [0, 2], board)).toBeUndefined()
    expect(place(empty, 0, [0, 0], [1, 1], board)).toBeUndefined()
    const placed = place(empty, 0, [0, 0], [1, 0], board)!
    expect(place(placed, 1, [0, 0], [0, 1], board)).toBeUndefined()
  })

  it("moves a domino that is already on the board", () => {
    const placed = place(empty, 0, [0, 0], [1, 0], board)!
    const moved = place(placed, 0, [0, 0], [0, 1], board)
    expect(moved?.[0]).toEqual([
      [0, 0],
      [0, 1],
    ])
  })
})

describe("regionStatus", () => {
  it("is incomplete until every cell is filled", () => {
    const placements = place(empty, 0, [0, 0], [1, 0], board)!
    expect(regionStatus(board.regions[0], placements, board)).toBe("incomplete")
  })

  it("reports a broken rule as soon as it cannot be met", () => {
    // 3 + 3 already exceeds the sum of 5.
    const placements = place(empty, 1, [0, 0], [0, 1], {
      ...board,
      dominoes: [board.dominoes[0], [3, 3]],
    })!
    expect(
      regionStatus(board.regions[0], placements, {
        ...board,
        dominoes: [board.dominoes[0], [3, 3]],
      }),
    ).toBe("broken")
  })

  it("is met when the filled cells follow the rule", () => {
    const placements = place(place(empty, 0, [0, 0], [1, 0], board)!, 1, [0, 1], [1, 1], board)!
    expect(regionStatus(board.regions[0], placements, board)).toBe("met")
    expect(regionStatus(board.regions[1], placements, board)).toBe("met")
  })
})

describe("isSolved", () => {
  it("is solved when every domino is placed and every rule is met, in any valid arrangement", () => {
    const placements = place(place(empty, 0, [0, 0], [1, 0], board)!, 1, [0, 1], [1, 1], board)!
    expect(isSolved(placements, board)).toBe(true)
  })

  it("is not solved while a rule is broken", () => {
    const placements = place(place(empty, 0, [1, 0], [0, 0], board)!, 1, [0, 1], [1, 1], board)!
    expect(isSolved(placements, board)).toBe(false)
  })
})

describe("boardCells", () => {
  it("lists every cell covered by a region", () => {
    expect(boardCells(board)).toHaveLength(4)
  })
})
