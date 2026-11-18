import { act, cleanup, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { useElapsed } from "../useElapsed"

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

it("counts seconds while running and picks up where it left off on the next visit", () => {
  const { result, unmount } = renderHook(() => useElapsed("time:connections:2026-11-16", true))
  act(() => vi.advanceTimersByTime(3000))
  expect(result.current).toBe(3)
  unmount()
  const next = renderHook(() => useElapsed("time:connections:2026-11-16", true))
  expect(next.result.current).toBe(3)
})

it("stops counting once the puzzle is over", () => {
  const { result, rerender } = renderHook(
    ({ running }: { running: boolean }) => useElapsed("time:connections:2026-11-16", running),
    { initialProps: { running: true } },
  )
  act(() => vi.advanceTimersByTime(2000))
  rerender({ running: false })
  act(() => vi.advanceTimersByTime(5000))
  expect(result.current).toBe(2)
})
