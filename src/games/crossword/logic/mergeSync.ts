import type { CrosswordProgress } from "./types"
import type { CrosswordSync } from "@/types"

/**
 * Fold NYT's progress into this device's. The grid that changed most recently wins, except that
 * an empty grid never replaces a filled one; progress saved before syncing has no stamp, so the
 * fuller grid wins. The clock keeps the longer time, and help or a first solve on either side
 * counts.
 */
export function mergeSync(
  /** This device's progress. */
  progress: CrosswordProgress,
  /** NYT's progress. */
  remote: CrosswordSync,
): CrosswordProgress {
  const filled = (entries: string[]) => entries.filter(Boolean).length
  const takeRemote =
    progress.updated === undefined
      ? filled(remote.entries) > filled(progress.entries)
      : filled(remote.entries) > 0 &&
        (filled(progress.entries) === 0 || remote.updated > progress.updated)
  const grid = takeRemote
    ? {
        entries: remote.entries,
        marks: remote.marks,
        autocheck: remote.autocheck,
        updated: remote.updated,
      }
    : {}
  const firstSolve = remote.firstSolve ?? progress.firstSolve
  return {
    ...progress,
    ...grid,
    elapsed: Math.max(progress.elapsed, remote.elapsed),
    ...((progress.usedAid || remote.usedAid) && { usedAid: true }),
    ...(firstSolve && { firstSolve }),
  }
}
