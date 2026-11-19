import { useLayoutEffect, useRef } from "react"

/**
 * Handle key presses anywhere on the page, ignoring typing in form fields and keys pressed in a
 * dialog. Shortcuts with Cmd, Ctrl or Alt are ignored too, unless the handler asks for them.
 */
export function useKeydown(
  /** Called with each key event; call preventDefault to claim the key. */
  handler: (event: KeyboardEvent) => void,
  /** Whether to pass on keys pressed with Cmd, Ctrl or Alt; the handler must then sort them out. */
  { withModifiers = false }: { withModifiers?: boolean } = {},
) {
  const latest = useRef(handler)
  latest.current = handler
  // A layout effect listens from the moment the game is on screen; a passive effect can run after
  // the first frame, dropping a key pressed right away.
  useLayoutEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (!withModifiers && (event.metaKey || event.ctrlKey || event.altKey)) return
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable='true'], dialog")) return
      latest.current(event)
    }
    window.addEventListener("keydown", listener)
    return () => window.removeEventListener("keydown", listener)
  }, [withModifiers])
}
