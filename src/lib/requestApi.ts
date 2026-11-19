import { NYT_TOKEN_HEADER } from "../../server/constants.ts"
import { NeedsToken } from "./NeedsToken"
import { writeStored } from "./writeStored"

/**
 * Ask the app's API for something with the NYT token, keeping a local copy under the storage key
 * if one is given. Everything asking for the same thing at once shares one request.
 */
export function requestApi<T>(
  /** API path, such as `/api/pips/2026-11-16`. */
  path: string,
  /** The NYT-S cookie value saved on this device, if any. */
  token: string,
  /** Where to keep the result, if anywhere. */
  storageKey?: string,
): Promise<T> {
  const key = `${path} ${storageKey} ${token}`
  const pending = inFlight.get(key)
  if (pending) return pending as Promise<T>
  const request = fetch(path, { headers: token ? { [NYT_TOKEN_HEADER]: token } : {} })
    .then(async response => {
      const body = await response.json()
      if (response.status === 401) throw new NeedsToken(body.error)
      if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`)
      if (storageKey) writeStored(storageKey, body)
      return body as T
    })
    .finally(() => inFlight.delete(key))
  inFlight.set(key, request)
  return request
}

// STATE

/** Requests on their way, by path, storage key and token. */
const inFlight = new Map<string, Promise<unknown>>()
