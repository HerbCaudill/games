import { useState } from "react"

/**
 * Undo and redo for a value held elsewhere. Make changes through `change` to record them. Each key
 * keeps its own history for as long as the component stays mounted.
 */
export function useUndo<T>(
  /** Which history to use, such as one per board. */
  key: string,
  /** The current value. */
  value: T,
  /** Replace the value. */
  set: (value: T) => void,
) {
  const [histories, setHistories] = useState<Record<string, History<T>>>({})
  const { past, future } = histories[key] ?? { past: [], future: [] }
  const save = (history: History<T>) => setHistories(all => ({ ...all, [key]: history }))

  return {
    /** Replace the value, recording the change so it can be undone. */
    change: (next: T) => {
      save({ past: [...past, value], future: [] })
      set(next)
    },
    /** Go back to the value before the last change. */
    undo: () => {
      if (!past.length) return
      save({ past: past.slice(0, -1), future: [value, ...future] })
      set(past[past.length - 1])
    },
    /** Reapply the last undone change. */
    redo: () => {
      if (!future.length) return
      save({ past: [...past, value], future: future.slice(1) })
      set(future[0])
    },
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  }
}

// TYPES

/** Values before and after the current one, nearest last and first. */
type History<T> = { past: T[]; future: T[] }
