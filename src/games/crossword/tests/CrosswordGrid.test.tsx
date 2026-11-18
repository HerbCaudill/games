import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import type { CrosswordPuzzle } from "@/types"
import { CrosswordGrid } from "../CrosswordGrid"
import { initialState } from "../logic/initialState"

afterEach(cleanup)

describe("CrosswordGrid", () => {
  it("tints the squares of clues related to the current one", () => {
    render(
      <CrosswordGrid
        puzzle={puzzle}
        state={initialState(puzzle)}
        onCell={() => {}}
        onRebus={() => {}}
      />,
    )
    const fill = (name: RegExp) =>
      screen.getByRole("gridcell", { name }).querySelector("rect")!.style.fill
    expect(fill(/^Row 3, column 1:/)).toBe("var(--xw-related)")
    expect(fill(/^Row 3, column 3:/)).toBe("var(--xw-related)")
    expect(fill(/^Row 2, column 1:/)).toBe("var(--card)")
  })
})

/*
  A 3x3 grid with one black square in the middle. 1-Across refers to 4-Across.

    C A T
    O # O
    W E T
*/
const puzzle: CrosswordPuzzle = {
  id: 1,
  date: "2026-01-02",
  constructors: [],
  editor: "",
  width: 3,
  height: 3,
  cells: [..."CATO#OWET"].map(answer =>
    answer === "#" ? null : { answer, altAnswers: [], circled: false, shaded: false },
  ),
  clues: [
    {
      id: 0,
      direction: "across",
      label: "1",
      text: "See 4-Across",
      cells: [0, 1, 2],
      related: [1],
    },
    {
      id: 1,
      direction: "across",
      label: "4",
      text: "See 1-Across",
      cells: [6, 7, 8],
      related: [0],
    },
    { id: 2, direction: "down", label: "1", text: "Bovine", cells: [0, 3, 6], related: [] },
    { id: 3, direction: "down", label: "2", text: "Toddler", cells: [2, 5, 8], related: [] },
  ],
}
