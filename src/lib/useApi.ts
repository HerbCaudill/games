import { useEffect, useState } from "react"
import { NYT_TOKEN_HEADER } from "../../server/constants.ts"
import { readStored } from "./readStored"
import { writeStored } from "./writeStored"

/**
 * Load something from the app's API with the NYT token. Without a path it waits. With a storage
 * key it keeps a local copy and uses that instead of asking again.
 */
export function useApi<T>(
  /** API path, such as `/api/pips/2026-11-16`, or nothing to wait. */
  path: string | undefined,
  /** The NYT-S cookie value saved on this device, if any. */
  token: string,
  /** How to keep the result. */
  { storageKey }: { storageKey?: string } = {},
): ApiLoad<T> & { retry: () => void } {
  const [attempt, setAttempt] = useState(0)
  // A new token or a retry asks again after a failure.
  const request = `${path} ${storageKey} ${token} ${attempt}`
  const [load, setLoad] = useState(() => ({ request, ...initialLoad<T>(path, storageKey) }))
  if (load.request !== request) setLoad({ request, ...initialLoad<T>(path, storageKey) })

  useEffect(() => {
    if (!path || (storageKey && readStored(storageKey))) return
    let cancelled = false
    fetch(path, { headers: token ? { [NYT_TOKEN_HEADER]: token } : {} })
      .then(async response => {
        const body = await response.json()
        if (response.status === 401) throw new NeedsToken(body.error)
        if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`)
        return body as T
      })
      .then(data => {
        if (storageKey) writeStored(storageKey, data)
        if (!cancelled) setLoad({ request, status: "ready", data })
      })
      .catch((error: Error) => {
        if (cancelled) return
        const status = error instanceof NeedsToken ? "needs-token" : "error"
        setLoad({ request, status, message: error.message })
      })
    return () => {
      cancelled = true
    }
  }, [path, storageKey, token, request])

  const { request: _, ...rest } = load
  return { ...rest, retry: () => setAttempt(a => a + 1) }
}

/** Start from the local copy when there is one. */
function initialLoad<T>(
  /** API path, or nothing while waiting. */
  path: string | undefined,
  /** Where the local copy is kept, if anywhere. */
  storageKey: string | undefined,
): ApiLoad<T> {
  const data = storageKey ? readStored<T>(storageKey) : undefined
  if (data) return { status: "ready", data }
  return path ? { status: "loading" } : { status: "idle" }
}

/** The API needs a valid NYT token. */
class NeedsToken extends Error {}

// TYPES

/** The state of an API request. */
export type ApiLoad<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error" | "needs-token"; message: string }
