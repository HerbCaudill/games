import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { Home } from "../Home"

beforeEach(() => {
  localStorage.clear()
  history.replaceState(null, "", "/")
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

it("locks Spelling Bee and Letter Boxed until 3am in New York, counting down", () => {
  // 1:06am in New York, which is on daylight saving time until November.
  vi.setSystemTime(new Date("2026-07-14T05:06:00Z"))
  render(<Home date="2026-07-14" isToday />)

  const bee = screen.getByRole("link", { name: /Spelling Bee/ })
  expect(bee).toHaveAttribute("aria-disabled", "true")
  expect(bee).toHaveTextContent("Available in 1 hour 54 minutes")
  expect(screen.getByRole("link", { name: /Letter Boxed/ })).toHaveTextContent(
    "Available in 1 hour 54 minutes",
  )
  expect(screen.getByRole("link", { name: /Connections/ })).not.toHaveAttribute("aria-disabled")

  fireEvent.click(bee)
  expect(location.pathname).toBe("/")
  fireEvent.keyDown(document.body, { key: "3" })
  expect(location.pathname).toBe("/")

  act(() => vi.advanceTimersByTime(60 * 60_000))
  expect(bee).toHaveTextContent("Available in 54 minutes")

  act(() => vi.advanceTimersByTime(54 * 60_000))
  expect(bee).not.toHaveAttribute("aria-disabled")
  expect(bee).not.toHaveTextContent("Available")
  fireEvent.click(bee)
  expect(location.pathname).toBe("/spelling-bee")
})

it("counts down to 3am New York time in winter too", () => {
  // 2:59am in New York on standard time.
  vi.setSystemTime(new Date("2026-11-23T07:59:30Z"))
  render(<Home date="2026-11-23" isToday />)

  expect(screen.getByRole("link", { name: /Spelling Bee/ })).toHaveTextContent(
    "Available in 1 minute",
  )
})

it("leaves earlier days' puzzles open", () => {
  vi.setSystemTime(new Date("2026-11-23T06:00:00Z"))
  render(<Home date="2026-11-22" isToday={false} />)

  expect(screen.getByRole("link", { name: /Spelling Bee/ })).not.toHaveAttribute("aria-disabled")
})
