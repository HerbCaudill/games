import { useEffect, useState } from "react"

/** Render again every second while running, so a countdown stays current. */
export function useEverySecond(
  /** Whether to keep rendering. */
  running: boolean,
) {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setTick(tick => tick + 1), 1000)
    return () => clearInterval(id)
  }, [running])
}
