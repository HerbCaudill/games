import type { CrosswordProgress } from "./types"
import type { CrosswordSync } from "@/types"

/** The progress to save to NYT, or nothing until a square is filled. */
export function toSync(
  /** Saved progress. */
  progress: CrosswordProgress,
  /** The moment to stamp progress saved before syncing, which has no stamp of its own. */
  now = new Date(),
): CrosswordSync | undefined {
  if (!progress.entries.some(Boolean)) return undefined
  return {
    entries: progress.entries,
    marks: progress.marks,
    elapsed: progress.elapsed,
    autocheck: progress.autocheck ?? false,
    usedAid: progress.usedAid ?? false,
    ...(progress.firstSolve && { firstSolve: progress.firstSolve }),
    updated: progress.updated ?? Math.floor(now.getTime() / 1000),
  }
}
