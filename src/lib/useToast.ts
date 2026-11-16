import { useEffect, useRef, useState } from "react"

/** A short message that disappears on its own. */
export function useToast(
  /** How long a message stays, in milliseconds. */
  duration = 1600,
) {
  const [message, setMessage] = useState<{ text: string; id: number }>()
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const show = (text: string) => {
    clearTimeout(timer.current)
    setMessage({ text, id: Date.now() })
    timer.current = setTimeout(() => setMessage(undefined), duration)
  }
  return { message, show }
}
