import type { CrosswordProgress } from "./types"
import type { CrosswordSync } from "@/types"

/**
 * Fold NYT's progress into this device's. Squares changed here since the last sync stay as they
 * are here. For the rest, the grid that changed most recently wins, except that an empty grid
 * never replaces a filled one; progress saved before syncing has no stamp, so the fuller grid
 * wins. The clock keeps the longer time, and help or a first solve on either side counts.
 */
export function mergeSync(
  /** This device's progress. */
  progress: CrosswordProgress,
  /** NYT's progress. */
  remote: CrosswordSync,
  /** This device's progress as of the last sync; without it, nothing counts as changed here. */
  base: CrosswordProgress = progress,
): CrosswordProgress {
  const filled = (entries: string[]) => entries.filter(Boolean).length
  const takeRemote =
    base.updated === undefined
      ? filled(remote.entries) > filled(base.entries)
      : filled(remote.entries) > 0 && (filled(base.entries) === 0 || remote.updated > base.updated)
  const grid = takeRemote ? remote : base
  const changedHere = (i: number) =>
    progress.entries[i] !== base.entries[i] || progress.marks[i] !== base.marks[i]
  const changed = progress.entries.some((_, i) => changedHere(i))
  const autocheck = progress.autocheck !== base.autocheck ? progress.autocheck : grid.autocheck
  // The combined grid counts as changed no earlier than either side.
  const updated = changed ? Math.max(progress.updated ?? 0, grid.updated ?? 0) : grid.updated
  const firstSolve = remote.firstSolve ?? progress.firstSolve
  return {
    ...progress,
    entries: grid.entries.map((entry, i) => (changedHere(i) ? progress.entries[i] : entry)),
    marks: grid.marks.map((mark, i) => (changedHere(i) ? progress.marks[i] : mark)),
    ...(autocheck !== undefined && { autocheck }),
    ...(updated && { updated }),
    elapsed: Math.max(progress.elapsed, remote.elapsed),
    ...((progress.usedAid || remote.usedAid) && { usedAid: true }),
    ...(firstSolve && { firstSolve }),
  }
}
