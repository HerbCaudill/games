import { act, cleanup, render } from "@testing-library/react"
import { afterEach, expect, it } from "vitest"
import { CompletionCelebration } from "../CompletionCelebration"

afterEach(cleanup)

it("celebrates when a game is completed, leaving the words to the game", () => {
  const { container } = render(<CompletionCelebration />)
  expect(container).toBeEmptyDOMElement()
  act(() => {
    window.dispatchEvent(new CustomEvent("game-completed", { detail: "crossword" }))
  })
  expect(container).not.toBeEmptyDOMElement()
})
