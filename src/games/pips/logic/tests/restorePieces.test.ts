import { describe, expect, it } from "vitest"
import { restorePieces } from "../restorePieces"
import type { Pieces } from "../types"

describe("restorePieces", () => {
  it("keeps how dominoes off the board in both versions lie now", () => {
    const saved: Pieces = { placements: [null, null], turns: [0, 0], spots: [null, [5, 5]] }
    const current: Pieces = { placements: [null, null], turns: [3, 1], spots: [[9, 2], null] }
    expect(restorePieces(current, saved, [0, 2])).toEqual(current)
  })

  it("puts back the board, and returns a domino taken off it to where it lay before, facing its starting way", () => {
    const saved: Pieces = {
      placements: [
        null,
        [
          [0, 0],
          [0, 1],
        ],
      ],
      turns: [1, 0],
      spots: [[7, 1], null],
    }
    const current: Pieces = {
      placements: [
        [
          [1, 0],
          [2, 0],
        ],
        null,
      ],
      turns: [5, 1],
      spots: [null, [8, 4]],
    }
    expect(restorePieces(current, saved, [2, 0])).toEqual({
      placements: saved.placements,
      // Domino 0 lay turned a quarter before it went on the board; it comes back flat, the short way round from 5.
      turns: [6, 0],
      spots: [[7, 1], null],
    })
  })
})
