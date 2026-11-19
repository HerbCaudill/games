/** Where a day's Spelling Bee hints come from, and where this device keeps them. */
export function hintsRequest(
  /** Puzzle date as YYYY-MM-DD. */
  date: string,
) {
  return { path: `/api/spelling-bee-hints/${date}`, storageKey: `hints:spelling-bee:${date}` }
}
