import { useEffect } from "react"
import { GAMES } from "@/constants"
import { newYorkTime } from "@/lib/newYorkTime"
import { nytToday } from "@/lib/nytToday"
import { readStored } from "@/lib/readStored"
import { requestApi } from "@/lib/requestApi"
import { hintsRequest } from "./hintsRequest"

/**
 * Have Claude write each day's Spelling Bee hints in the background, so they're ready when the hints
 * panel opens. It asks as soon as the app opens, when the day's puzzle comes out, when the app comes
 * back to the foreground, and a minute after a failure.
 */
export function usePrefetchHints(
  /** The NYT-S cookie value saved on this device, if any. */
  token: string,
) {
  useEffect(() => {
    if (!token) return
    let timer: ReturnType<typeof setTimeout> | undefined
    let stopped = false
    let failures = 0

    /** Run the next check after a wait, replacing any check already waiting. */
    const schedule = (wait: number) => {
      clearTimeout(timer)
      timer = setTimeout(check, wait)
    }

    /** Ask for today's hints if the puzzle is out and they aren't here yet; otherwise wait for the next puzzle. */
    const check = () => {
      const now = Date.now()
      const today = nytToday(new Date(now))
      const release = newYorkTime(today, RELEASE_HOUR)
      if (now < release) return schedule(release - now)
      schedule(newYorkTime(nytToday(new Date(now + DAY)), RELEASE_HOUR) - now)

      const { path, storageKey } = hintsRequest(today)
      if (readStored(storageKey)) return
      requestApi(path, token, storageKey)
        .then(() => (failures = 0))
        .catch(() => {
          // NYT can post the puzzle a little late, and Claude can fail; the hints panel shows the error if this gives up.
          if (stopped || ++failures >= MAX_FAILURES) return
          schedule(RETRY_WAIT)
        })
    }

    /** Check again when the app comes back to the foreground, since a sleeping phone runs no timers. */
    const onVisible = () => {
      if (document.visibilityState !== "visible") return
      failures = 0
      check()
    }

    check()
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      stopped = true
      clearTimeout(timer)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [token])
}

// CONSTANTS

/** Hour in New York when each day's Spelling Bee comes out. */
const RELEASE_HOUR = GAMES.find(game => game.id === "spelling-bee")?.releaseHour ?? 0

/** How long to wait before asking again after a failure. */
const RETRY_WAIT = 60 * 1000

/** How many failures in a row to give up after, until the app next comes to the foreground. */
const MAX_FAILURES = 10

const DAY = 24 * 60 * 60 * 1000
