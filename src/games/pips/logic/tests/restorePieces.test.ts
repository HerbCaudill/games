import { describe, expect, it } from "vitest"
import { restorePieces } from "../restorePieces"
import type { Pieces } from "../types"

describe("restorePieces", () => {
  it("keeps how dominoes off the board in both versions lie now", () => {
    const saved: Pieces = { placements: [null, null], turns: [0, 0], spots: [null, [5, 5]] }
    const current: Pieces = { placements: [null, null], turns: [3, 1], spots: [[9, 2], null] }
    expect(restorePieces(current, saved)).toEqual(current)
  })

  it("puts back the board, and returns a domino taken off it to where it lay before", () => {
    const saved: Pieces = {
      placements: [
        null,
        [
          [0, 0],
          [0, 1],
        ],
      ],
      turns: [2, 0],
      spots: [[7, 1], null],
    }
    const current: Pieces = {
      placements: [
        [
          [1, 0],
          [1, 1],
        ],
        null,
      ],
      turns: [0, 1],
      spots: [null, [8, 4]],
    }
    expect(restorePieces(current, saved)).toEqual(saved)
  })
})
