/** Copy an array with one item replaced. */
export function replaceAt<T>(
  /** The array. */
  items: T[],
  /** Index to replace. */
  index: number,
  /** New value. */
  value: T,
): T[] {
  return items.map((item, i) => (i === index ? value : item))
}
