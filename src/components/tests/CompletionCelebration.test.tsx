import { act, cleanup, render } from "@testing-library/react"
import { afterEach, expect, it } from "vitest"
import { CompletionCelebration } from "../CompletionCelebration"

afterEach(cleanup)

it("throws confetti when a game is completed, leaving the words to the game", () => {
  const { container } = render(<CompletionCelebration />)
  expect(container).toBeEmptyDOMElement()
  act(() => {
    window.dispatchEvent(new Event("game-completed"))
  })
  expect(container).not.toBeEmptyDOMElement()
})
