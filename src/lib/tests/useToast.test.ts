import { act, renderHook } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { useToast } from "../useToast"

afterEach(() => vi.useRealTimers())

it("marks a message as leaving before removing it, so it can animate out", () => {
  vi.useFakeTimers()
  const { result } = renderHook(() => useToast(1000))
  act(() => result.current.show("Nice!"))
  expect(result.current.message).toMatchObject({ text: "Nice!", leaving: false })
  act(() => vi.advanceTimersByTime(800))
  expect(result.current.message).toMatchObject({ text: "Nice!", leaving: true })
  act(() => vi.advanceTimersByTime(200))
  expect(result.current.message).toBeUndefined()
})
