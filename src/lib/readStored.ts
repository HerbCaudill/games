/** Read a JSON value from localStorage, or undefined if it is missing or storage is unavailable. */
export function readStored<T>(
  /** Storage key. */
  key: string,
): T | undefined {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? undefined : (JSON.parse(raw) as T)
  } catch {
    return undefined
  }
}
