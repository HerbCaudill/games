import { describe, expect, it } from "vitest"
import type { Cell, Domino, PipsBoard } from "@/types"
import { cellValues } from "../cellValues"
import { placeAt } from "../placeAt"

describe("placeAt", () => {
  it.each([
    [[1, 4], 0],
    [[4, 1], 2],
  ] as [Domino, number][])(
    "puts the half that starts on the left on the cell, for domino %j",
    (domino, direction) => {
      const cells: Cell[] = [
        [0, 0],
        [0, 1],
      ]
      const board: PipsBoard = {
        id: 1,
        constructors: "Someone",
        dominoes: [domino],
        regions: [{ cells, type: "empty" }],
        solution: [],
      }
      const { placements } = placeAt([null], 0, [0, 0], direction, board)!
      expect([...cellValues(placements, board)].sort()).toEqual([
        ["0,0", 1],
        ["0,1", 4],
      ])
    },
  )
})
