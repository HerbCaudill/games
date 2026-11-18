import { act, cleanup, render, screen } from "@testing-library/react"
import { afterEach, expect, it } from "vitest"
import { CompletionCelebration } from "../CompletionCelebration"

afterEach(cleanup)

it("announces a completion", () => {
  render(<CompletionCelebration />)
  act(() => {
    window.dispatchEvent(new CustomEvent("game-completed"))
  })
  expect(screen.getByRole("status")).toHaveTextContent("Puzzle complete!")
})

it("leaves the words to a game that says them itself", () => {
  const { container } = render(<CompletionCelebration />)
  act(() => {
    window.dispatchEvent(new CustomEvent("game-completed", { detail: { message: false } }))
  })
  expect(screen.queryByRole("status")).toBeNull()
  expect(container).not.toBeEmptyDOMElement()
})
