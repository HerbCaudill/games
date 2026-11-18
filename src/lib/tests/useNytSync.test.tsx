import { act, renderHook } from "@testing-library/react"
import { useState } from "react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import type { SpellingBeeSync } from "@/types"
import { useNytSync } from "../useNytSync"

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it("adds NYT's progress on open, then saves the combined progress back", async () => {
  const api = fakeApi({ words: ["moat"], rank: "Good" })
  const { result } = renderSync(["torah"])
  await act(() => vi.advanceTimersByTimeAsync(0))
  expect(result.current.words).toEqual(["torah", "moat"])
  expect(api.saved).toEqual([{ words: ["torah", "moat"], rank: "2 words" }])
})

it("leaves NYT alone when it already has everything", async () => {
  const api = fakeApi({ words: ["moat"], rank: "1 words" })
  renderSync(["moat"])
  await act(() => vi.advanceTimersByTimeAsync(0))
  expect(api.saved).toEqual([])
})

it("doesn't save a puzzle that hasn't been played", async () => {
  const api = fakeApi(null)
  renderSync([])
  await act(() => vi.advanceTimersByTimeAsync(0))
  expect(api.reads).toBe(1)
  expect(api.saved).toEqual([])
})

it("saves new progress once play pauses for a moment, not on every move", async () => {
  const api = fakeApi(null)
  const { result } = renderSync(["moat"])
  await act(() => vi.advanceTimersByTimeAsync(0))
  act(() => result.current.add("torah"))
  act(() => result.current.add("bath"))
  await act(() => vi.advanceTimersByTimeAsync(1000))
  expect(api.saved).toHaveLength(1)
  await act(() => vi.advanceTimersByTimeAsync(5000))
  expect(api.saved.at(-1)).toEqual({ words: ["moat", "torah", "bath"], rank: "3 words" })
  expect(api.saved).toHaveLength(2)
})

it("saves pending progress right away when the game closes", async () => {
  const api = fakeApi(null)
  const { result, unmount } = renderSync(["moat"])
  await act(() => vi.advanceTimersByTimeAsync(0))
  act(() => result.current.add("torah"))
  unmount()
  await act(() => vi.advanceTimersByTimeAsync(0))
  expect(api.saved.at(-1)).toEqual({ words: ["moat", "torah"], rank: "2 words" })
})

/** Render the hook over a word list, the way Spelling Bee uses it. */
function renderSync(
  /** Words already found on this device. */
  initial: string[],
) {
  return renderHook(() => {
    const [words, setWords] = useState(initial)
    useNytSync("spelling-bee", "2026-01-05", "token", words, setWords, {
      toSync: w => (w.length ? { words: w, rank: `${w.length} words` } : undefined),
      merge: (w, remote) => [...w, ...remote.words.filter(word => !w.includes(word))],
    })
    return { words, add: (word: string) => setWords(w => [...w, word]) }
  })
}

/** Stand in for the API's progress route, holding one saved record. */
function fakeApi(
  /** What NYT has to begin with. */
  initial: SpellingBeeSync | null,
) {
  const api = { stored: initial, saved: [] as SpellingBeeSync[], reads: 0 }
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string, init?: RequestInit) => {
      expect(path).toBe("/api/spelling-bee-progress/2026-01-05")
      if (init?.method === "PUT") {
        api.stored = JSON.parse(String(init.body))
        api.saved.push(api.stored!)
        return Response.json({ saved: true })
      }
      api.reads++
      return Response.json({ progress: api.stored })
    }),
  )
  return api
}
