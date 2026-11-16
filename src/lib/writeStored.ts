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
