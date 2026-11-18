import { useEffect, useRef } from "react"
import { NYT_TOKEN_HEADER } from "../../server/constants.ts"
import type { SyncedGame, SyncedProgressFor } from "@/types"
import { isEqual } from "./isEqual"

/**
 * Keep a puzzle's progress in step with the NYT account. On open it adds what NYT has; after
 * that it saves changes once play pauses, and right away when the game closes or the page is
 * hidden. Syncing is best effort: when NYT can't be reached, play carries on locally.
 */
export function useNytSync<G extends SyncedGame, P>(
  /** The game. */
  game: G,
  /** Puzzle date as YYYY-MM-DD. */
  date: string,
  /** The NYT-S cookie value saved on this device, if any. */
  token: string,
  /** The progress on this device. */
  progress: P,
  /** Updates the progress on this device. */
  setProgress: (update: (progress: P) => P) => void,
  /** How the game's progress converts to and from what NYT keeps. */
  adapter: SyncAdapter<P, SyncedProgressFor[G]>,
) {
  const { toSync, changeKey = p => JSON.stringify(toSync(p) ?? null) } = adapter
  const key = changeKey(progress)
  const sync = useRef<SyncState>({ started: false, running: Promise.resolve() })
  // The latest values for a sync that a timer starts after this render.
  const latest = useRef({ progress, token, adapter, setProgress })
  useEffect(() => {
    latest.current = { progress, token, adapter, setProgress }
  })

  useEffect(() => {
    const state = sync.current
    /** Run a sync now, after any already running. */
    const flush = () => {
      clearTimeout(state.timer)
      state.timer = undefined
      state.running = state.running.then(() => syncOnce(game, date, latest.current)).catch(() => {})
    }
    state.flush = flush
    if (state.timer === undefined) state.timer = setTimeout(flush, state.started ? DELAY_MS : 0)
    state.started = true
  }, [game, date, key])

  useEffect(() => {
    const state = sync.current
    const onHide = () => {
      if (document.visibilityState === "hidden" && state.timer !== undefined) state.flush?.()
    }
    document.addEventListener("visibilitychange", onHide)
    return () => {
      document.removeEventListener("visibilitychange", onHide)
      if (state.timer !== undefined) state.flush?.()
    }
  }, [])
}

/** Read NYT's progress, fold it into this device's, and save the result if NYT lacks any of it. */
async function syncOnce<G extends SyncedGame, P>(
  /** The game. */
  game: G,
  /** Puzzle date as YYYY-MM-DD. */
  date: string,
  /** The latest values from the hook. */
  latest: Latest<P, SyncedProgressFor[G]>,
) {
  const { token, adapter, setProgress } = latest
  const path = `/api/${game}-progress/${date}`
  const headers: Record<string, string> = token ? { [NYT_TOKEN_HEADER]: token } : {}
  const response = await fetch(path, { headers })
  if (!response.ok) return
  const { progress: remote } = (await response.json()) as {
    progress: SyncedProgressFor[G] | null
  }
  let progress = latest.progress
  if (remote) {
    const merged = adapter.merge(progress, remote)
    if (!isEqual(merged, progress)) {
      progress = merged
      latest.progress = merged
      setProgress(p => adapter.merge(p, remote))
    }
  }
  const local = adapter.toSync(progress)
  if (!local || isEqual(local, remote)) return
  await fetch(path, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(local),
    // Lets a save started as the page closes finish anyway.
    keepalive: true,
  })
}

// CONSTANTS

/** How long play must pause before changes are saved to NYT. */
const DELAY_MS = 2000

// TYPES

/** How a game's progress converts to and from what NYT keeps. */
export type SyncAdapter<P, S> = {
  /** The progress to save to NYT, or nothing when there's no progress worth saving. */
  toSync: (progress: P) => S | undefined
  /** Fold NYT's progress into this device's. */
  merge: (progress: P, remote: S) => P
  /** A key that changes whenever there's something new to save; the saved progress by default. */
  changeKey?: (progress: P) => string
}

/** The hook's latest values, read when a sync runs. */
type Latest<P, S> = {
  /** The progress on this device. */
  progress: P
  /** The NYT-S cookie value. */
  token: string
  /** How the progress converts. */
  adapter: SyncAdapter<P, S>
  /** Updates the progress on this device. */
  setProgress: (update: (progress: P) => P) => void
}

/** Where syncing stands. */
type SyncState = {
  /** Whether the first sync has been scheduled. */
  started: boolean
  /** A sync waiting for play to pause. */
  timer?: ReturnType<typeof setTimeout>
  /** The sync in progress, if any; syncs run one at a time. */
  running: Promise<void>
  /** Runs the waiting sync now. */
  flush?: () => void
}
