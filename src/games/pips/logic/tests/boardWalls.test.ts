import { describe, expect, it } from "vitest"
import type { PipsBoard } from "@/types"
import { boardWalls } from "../boardWalls"

describe("boardWalls", () => {
  it("covers each board cell and each rule badge hanging off the board", () => {
    const board: PipsBoard = {
      id: 1,
      constructors: "Someone",
      dominoes: [[1, 1]],
      regions: [
        {
          cells: [
            [0, 0],
            [0, 1],
          ],
          type: "equals",
        },
        { cells: [[1, 0]], type: "empty" },
      ],
      solution: [],
    }
    expect(boardWalls(board)).toEqual([
      { left: 0, top: 0, right: 1, bottom: 1 },
      { left: 1, top: 0, right: 2, bottom: 1 },
      { left: 0, top: 1, right: 1, bottom: 2 },
      // The equals badge on the bottom-right corner of its last cell; empty regions have none.
      { left: 1.7, top: 0.7, right: 2.3, bottom: 1.3 },
    ])
  })
})
