import { cleanup, renderHook } from "@testing-library/react"
import { StrictMode } from "react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { readGameStatus } from "../readGameStatus"
import { useGameStatus, type GameStatus } from "../useGameStatus"

beforeEach(() => localStorage.clear())
afterEach(cleanup)

it("records progress and celebrates a new completion once, including in Strict Mode", () => {
  const celebrate = vi.fn()
  window.addEventListener("game-completed", celebrate)
  try {
    const { rerender, unmount } = renderHook(
      ({ status }: { status: GameStatus }) => useGameStatus("crossword", "2026-11-16", status),
      { initialProps: { status: "started" as GameStatus }, wrapper: StrictMode },
    )
    expect(readGameStatus("crossword", "2026-11-16")).toBe("started")
    rerender({ status: "solved" })
    expect(readGameStatus("crossword", "2026-11-16")).toBe("solved")
    expect(celebrate).toHaveBeenCalledOnce()
    rerender({ status: "solved" })
    unmount()
    renderHook(() => useGameStatus("crossword", "2026-11-16", "solved"), { wrapper: StrictMode })
    expect(celebrate).toHaveBeenCalledOnce()
  } finally {
    window.removeEventListener("game-completed", celebrate)
  }
})

it("does not celebrate restored solutions, a failed game, or a change of puzzle", () => {
  const celebrate = vi.fn()
  window.addEventListener("game-completed", celebrate)
  try {
    const { rerender } = renderHook(
      ({ date, status }: { date: string; status: GameStatus }) =>
        useGameStatus("connections", date, status),
      { initialProps: { date: "2026-11-16", status: "solved" as GameStatus } },
    )
    rerender({ date: "2026-11-17", status: "started" })
    rerender({ date: "2026-11-17", status: "failed" })
    rerender({ date: "2026-11-18", status: "solved" })
    expect(celebrate).not.toHaveBeenCalled()
  } finally {
    window.removeEventListener("game-completed", celebrate)
  }
})

it("clears a stale completion when the puzzle is restarted", () => {
  const { rerender } = renderHook(
    ({ status }: { status: GameStatus }) => useGameStatus("letter-boxed", "2026-11-16", status),
    { initialProps: { status: "solved" as GameStatus } },
  )
  rerender({ status: "new" })
  expect(readGameStatus("letter-boxed", "2026-11-16")).toBe("new")
})
