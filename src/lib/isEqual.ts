/** Whether two JSON values hold the same data, ignoring the order of object keys. */
export function isEqual(
  /** One value. */
  a: unknown,
  /** The other. */
  b: unknown,
): boolean {
  if (a === b) return true
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const aKeys = Object.keys(a).filter(k => (a as Record<string, unknown>)[k] !== undefined)
  const bKeys = Object.keys(b).filter(k => (b as Record<string, unknown>)[k] !== undefined)
  return (
    aKeys.length === bKeys.length &&
    aKeys.every(k => isEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
  )
}
