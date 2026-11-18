import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, expect, it } from "vitest"
import { SolvedMessage } from "../SolvedMessage"

afterEach(cleanup)

it("says how long the puzzle took, with an optional detail", () => {
  render(<SolvedMessage seconds={225} detail="Perfect" />)
  expect(screen.getByRole("status")).toHaveTextContent("Solved in 3:45 · Perfect")
})
