import { usePersistentState } from "./usePersistentState"
import { useTimer } from "./useTimer"

/** Seconds spent on a puzzle, saved under a key and counted while it is in play and on screen. */
export function useElapsed(
  /** Storage key, such as `time:connections:2026-11-16`. */
  key: string,
  /** Whether the clock should run. */
  running: boolean,
) {
  const [elapsed, setElapsed] = usePersistentState(key, () => 0)
  useTimer(running, () => setElapsed(s => s + 1))
  return elapsed
}
