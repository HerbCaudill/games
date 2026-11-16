import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, expect, it } from "vitest"
import type { PipsBoard } from "@/types"
import type { Placements } from "../logic/types"
import { PipsGrid } from "../PipsGrid"

afterEach(cleanup)

it("identifies broken constraints and clears them when removed", () => {
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
      layer="badges"
      size={60}
      origin={[0, 0]}
    />,
  )
  expect(screen.getByRole("img", { name: "Broken constraint: 5" })).toBeVisible()
  rerender(<PipsGrid board={board} placements={[null]} layer="badges" size={60} origin={[0, 0]} />)
  expect(screen.queryByRole("img", { name: "Broken constraint: 5" })).not.toBeInTheDocument()
})

it("shows the domino face through a badge's notch when a domino covers its cell", () => {
  const board: PipsBoard = {
    id: 1,
    constructors: "Test",
    dominoes: [[2, 3]],
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
  const notchFill = (placements: Placements) => {
    const { container } = render(
      <PipsGrid board={board} placements={placements} layer="badges" size={60} origin={[0, 0]} />,
    )
    const fill = container.querySelector("[data-notch]")!.getAttribute("class")
    cleanup()
    return fill
  }
  expect(notchFill([null])).not.toContain("fill-card")
  expect(
    notchFill([
      [
        [0, 0],
        [0, 1],
      ],
    ]),
  ).toContain("fill-card")
})
