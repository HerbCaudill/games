import { useEffect, useState } from "react"
import { readStored } from "./readStored"
import { writeStored } from "./writeStored"

/** State that is saved to localStorage under a key and restored on the next visit. */
export function usePersistentState<T>(
  /** Storage key; changing it loads that key's saved value. */
  key: string,
  /** Value to use when nothing is saved yet. */
  initial: () => T,
) {
  const [state, setState] = useState(() => ({ key, value: readStored<T>(key) ?? initial() }))
  // Reload when the key changes, such as when switching puzzles.
  const current = state.key === key ? state.value : (readStored<T>(key) ?? initial())
  if (state.key !== key) setState({ key, value: current })

  useEffect(() => {
    writeStored(state.key, state.value)
  }, [state])

  const set = (update: T | ((previous: T) => T)) =>
    setState(s => ({
      key: s.key,
      value: typeof update === "function" ? (update as (previous: T) => T)(s.value) : update,
    }))
  return [current, set] as const
}
