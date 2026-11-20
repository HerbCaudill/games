import { act, cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { Hive } from "../Hive"

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

it("fades the outer letters out before showing them shuffled, then fades them back in", () => {
  const props = { center: "t", onLetter: () => {} }
  const { rerender } = render(<Hive {...props} outer={["a", "r", "i", "f", "d", "c"]} />)
  const top = () => screen.getAllByRole("button")[1]
  expect(top()).toHaveAccessibleName("A")
  expect(opacityOf(top())).toBe("1")

  rerender(<Hive {...props} outer={["c", "a", "r", "i", "f", "d"]} />)
  expect(top()).toHaveAccessibleName("A")
  expect(opacityOf(top())).toBe("0")
  expect(opacityOf(screen.getByRole("button", { name: "T" }))).toBe("1")

  act(() => vi.runAllTimers())
  expect(top()).toHaveAccessibleName("C")
  expect(opacityOf(top())).toBe("1")
})

/** The opacity of a letter cell's text. */
function opacityOf(
  /** The cell. */
  cell: HTMLElement,
) {
  return cell.querySelector("text")!.style.opacity
}
