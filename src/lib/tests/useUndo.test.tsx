import { act, renderHook } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it } from "vitest"
import { useUndo } from "../useUndo"

/** A counter with undo, keyed so each key keeps its own history. */
function useCounter(initialKey = "a") {
  const [key, setKey] = useState(initialKey)
  const [value, setValue] = useState(0)
  return { key, setKey, value, ...useUndo(key, value, setValue) }
}

describe("useUndo", () => {
  it("steps back and forward through changes", () => {
    const { result } = renderHook(() => useCounter())
    act(() => result.current.change(1))
    act(() => result.current.change(2))
    expect(result.current).toMatchObject({ value: 2, canUndo: true, canRedo: false })
    act(() => result.current.undo())
    act(() => result.current.undo())
    expect(result.current).toMatchObject({ value: 0, canUndo: false, canRedo: true })
    act(() => result.current.redo())
    expect(result.current).toMatchObject({ value: 1, canUndo: true, canRedo: true })
  })

  it("forgets undone changes once a new change is made", () => {
    const { result } = renderHook(() => useCounter())
    act(() => result.current.change(1))
    act(() => result.current.undo())
    act(() => result.current.change(5))
    expect(result.current.canRedo).toBe(false)
  })

  it("keeps a separate history for each key", () => {
    const { result } = renderHook(() => useCounter())
    act(() => result.current.change(1))
    act(() => result.current.setKey("b"))
    expect(result.current.canUndo).toBe(false)
    act(() => result.current.setKey("a"))
    expect(result.current.canUndo).toBe(true)
  })

  it("sets a change as given, and restores only for undo and redo", () => {
    const { result } = renderHook(() => {
      const [value, setValue] = useState(0)
      // A restore that can be told apart from a plain set.
      return { value, ...useUndo("a", value, setValue, saved => setValue(saved + 100)) }
    })
    act(() => result.current.change(1))
    expect(result.current.value).toBe(1)
    act(() => result.current.undo())
    expect(result.current.value).toBe(100)
    act(() => result.current.redo())
    expect(result.current.value).toBe(101)
  })
})
