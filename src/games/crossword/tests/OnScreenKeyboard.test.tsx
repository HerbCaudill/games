import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { OnScreenKeyboard } from "../OnScreenKeyboard"

afterEach(cleanup)

describe("on-screen keyboard", () => {
  it("pops out the letter being pressed until it is released", () => {
    const onKey = vi.fn()
    render(<OnScreenKeyboard onKey={onKey} rebus={false} />)
    const key = screen.getByRole("button", { name: "C" })
    fireEvent.pointerDown(key)
    expect(onKey).toHaveBeenCalledWith("C")
    expect(screen.getByTestId("key-popout")).toHaveTextContent("C")
    fireEvent.pointerUp(key)
    expect(screen.queryByTestId("key-popout")).toBeNull()
  })

  it("does not pop out the delete key", () => {
    render(<OnScreenKeyboard onKey={() => {}} rebus={false} />)
    fireEvent.pointerDown(screen.getByRole("button", { name: "Delete" }))
    expect(screen.queryByTestId("key-popout")).toBeNull()
  })
})
