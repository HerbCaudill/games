import { expect, it } from "vitest"
import type { PipsBoard } from "@/types"
import { halfRegions } from "../halfRegions"

// A 1x3 strip: a sum region on the left two cells and an empty region on the right.
const board: PipsBoard = {
  id: 1,
  constructors: "Someone",
  dominoes: [[1, 2]],
  regions: [
    {
      cells: [
        [0, 0],
        [0, 1],
      ],
      type: "sum",
      target: 3,
    },
    { cells: [[0, 2]], type: "empty" },
  ],
  solution: [],
}

it("names the region under each half of a placed domino, in domino order", () => {
  expect(
    halfRegions(board, [
      [0, 1],
      [0, 0],
    ]),
  ).toEqual([0, 0])
})

it("leaves a half in an empty region uncolored", () => {
  expect(
    halfRegions(board, [
      [0, 2],
      [0, 1],
    ]),
  ).toEqual([undefined, 0])
})
