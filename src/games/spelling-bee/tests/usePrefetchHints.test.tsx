import { act, cleanup, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { usePrefetchHints } from "../usePrefetchHints"

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

/** Answer every hints request with hints for the date asked about. */
function stubHints() {
  const fetch = vi.fn(async (path: string) =>
    Response.json({ date: path.slice(-10), hints: { moat: "Castle ring" } }),
  )
  vi.stubGlobal("fetch", fetch)
  return fetch
}

it("waits for the day's Spelling Bee to come out at 3am New York time, then asks for its hints", async () => {
  // 1am in New York.
  vi.setSystemTime(new Date("2026-11-24T06:00:00Z"))
  const fetch = stubHints()
  renderHook(() => usePrefetchHints("abc123"))
  expect(fetch).not.toHaveBeenCalled()

  await act(() => vi.advanceTimersByTimeAsync(2 * HOUR))
  expect(fetch).toHaveBeenCalledWith("/api/spelling-bee-hints/2026-11-24", expect.anything())
  expect(localStorage.getItem("hints:spelling-bee:2026-11-24")).not.toBeNull()
})

it("asks again a minute after a failure", async () => {
  vi.setSystemTime(new Date("2026-11-24T12:00:00Z"))
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ error: "Not out yet" }, { status: 404 }))
    .mockResolvedValue(Response.json({ date: "2026-11-24", hints: {} }))
  vi.stubGlobal("fetch", fetch)
  renderHook(() => usePrefetchHints("abc123"))
  await act(() => vi.advanceTimersByTimeAsync(0))
  expect(fetch).toHaveBeenCalledTimes(1)

  await act(() => vi.advanceTimersByTimeAsync(MINUTE))
  expect(fetch).toHaveBeenCalledTimes(2)
  expect(localStorage.getItem("hints:spelling-bee:2026-11-24")).not.toBeNull()
})

it("asks for the new day's hints when the app comes back to the foreground", async () => {
  vi.setSystemTime(new Date("2026-11-24T12:00:00Z"))
  const fetch = stubHints()
  renderHook(() => usePrefetchHints("abc123"))
  await act(() => vi.advanceTimersByTimeAsync(0))
  expect(fetch).toHaveBeenCalledTimes(1)

  // The phone sleeps through the night, so no timers run.
  vi.setSystemTime(new Date("2026-11-25T12:00:00Z"))
  await act(async () => document.dispatchEvent(new Event("visibilitychange")))
  expect(fetch).toHaveBeenLastCalledWith("/api/spelling-bee-hints/2026-11-25", expect.anything())
})

it("doesn't ask again for hints it already has", async () => {
  vi.setSystemTime(new Date("2026-11-24T12:00:00Z"))
  localStorage.setItem("hints:spelling-bee:2026-11-24", JSON.stringify({ hints: {} }))
  const fetch = stubHints()
  renderHook(() => usePrefetchHints("abc123"))
  await act(() => vi.advanceTimersByTimeAsync(HOUR))
  expect(fetch).not.toHaveBeenCalled()
})

// CONSTANTS

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
