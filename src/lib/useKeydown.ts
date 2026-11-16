import { useEffect, useRef } from "react"

/** Handle key presses anywhere on the page, ignoring shortcuts with Cmd, Ctrl or Alt and typing in form fields. */
export function useKeydown(
  /** Called with each key event; call preventDefault to claim the key. */
  handler: (event: KeyboardEvent) => void,
) {
  const latest = useRef(handler)
  latest.current = handler
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return
      latest.current(event)
    }
    window.addEventListener("keydown", listener)
    return () => window.removeEventListener("keydown", listener)
  }, [])
}
