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

/** Write a JSON value to localStorage, ignoring storage that is full or blocked. */
export function writeStored(
  /** Storage key. */
  key: string,
  /** Value to store. */
  value: unknown,
) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Progress still works for this visit; it just won't survive a reload.
  }
}
