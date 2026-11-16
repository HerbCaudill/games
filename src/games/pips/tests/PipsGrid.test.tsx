import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, expect, it } from "vitest"
import type { PipsBoard } from "@/types"
import { PipsGrid } from "../PipsGrid"

afterEach(cleanup)

it("identifies broken constraints beneath the dominoes and clears them when removed", () => {
  const board: PipsBoard = {
    id: 1,
    constructors: "Test",
    dominoes: [[2, 1]],
    regions: [
      {
        cells: [
          [0, 0],
          [0, 1],
        ],
        type: "sum",
        target: 5,
      },
    ],
    solution: [],
  }
  const { rerender } = render(
    <PipsGrid
      board={board}
      placements={[
        [
          [0, 0],
          [0, 1],
        ],
      ]}
      layer="base"
      size={60}
      origin={[0, 0]}
    />,
  )
  expect(screen.getByRole("img", { name: "Broken constraint: 5" })).toBeVisible()
  rerender(<PipsGrid board={board} placements={[null]} layer="base" size={60} origin={[0, 0]} />)
  expect(screen.queryByRole("img", { name: "Broken constraint: 5" })).not.toBeInTheDocument()
})
