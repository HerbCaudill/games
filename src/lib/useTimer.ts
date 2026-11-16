import { useEffect } from "react"

/** Count seconds while a game is in progress and the page is visible. */
export function useTimer(
  /** Whether the clock should run. */
  running: boolean,
  /** Called once a second with the number of seconds to add. */
  tick: () => void,
) {
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      if (document.visibilityState === "visible") tick()
    }, 1000)
    return () => clearInterval(id)
    // `tick` is a fresh closure each render; restarting the interval for it would drift the clock, so callers use functional updates.
  }, [running])
}
