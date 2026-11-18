import { useEffect, useRef, useState } from "react"

/** A short message that disappears on its own, marked as leaving just before it goes so it can animate out. */
export function useToast(
  /** How long a message stays, in milliseconds, including its exit. */
  duration = 1600,
) {
  const [message, setMessage] = useState<ToastMessage>()
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const clear = () => timers.current.forEach(clearTimeout)
  useEffect(() => clear, [])
  const show = (text: string) => {
    clear()
    setMessage({ text, id: Date.now(), leaving: false })
    timers.current = [
      setTimeout(() => setMessage(m => m && { ...m, leaving: true }), duration - EXIT_MS),
      setTimeout(() => setMessage(undefined), duration),
    ]
  }
  return { message, show }
}

// CONSTANTS

/** How long a message takes to animate out, in milliseconds. */
const EXIT_MS = 200

// TYPES

/** A message being shown. */
export type ToastMessage = {
  /** What it says. */
  text: string
  /** Distinguishes repeats of the same text, so each one replays its entrance. */
  id: number
  /** Whether it is on its way out. */
  leaving: boolean
}
