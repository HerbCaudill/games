import { cleanup, render } from "@testing-library/react"
import { useLayoutEffect } from "react"
import { afterEach, expect, it, vi } from "vitest"
import { useKeydown } from "../useKeydown"

afterEach(cleanup)

it("handles a key pressed as soon as the game is on screen", () => {
  const handler = vi.fn()
  render(
    <>
      <Game onKey={handler} />
      <PressOnMount letter="c" />
    </>,
  )
  expect(handler).toHaveBeenCalledWith(expect.objectContaining({ key: "c" }))
})

/** A component that listens for keys. */
function Game({ onKey }: { onKey: (event: KeyboardEvent) => void }) {
  useKeydown(onKey)
  return <div>Game</div>
}

/** Presses a key as soon as it's in the DOM, before React runs passive effects, as a fast player or test can. */
function PressOnMount({ letter }: { letter: string }) {
  useLayoutEffect(() => {
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: letter, bubbles: true }))
  }, [letter])
  return null
}
