import { localIsoString } from "@/lib/localIsoString"
import { isSolved } from "./isSolved"
import type { CrosswordProgress, CrosswordState } from "./types"
import type { CrosswordPuzzle } from "@/types"

/**
 * Apply a new state to saved progress, keeping the clock, stamping when the grid last changed,
 * and recording the first solve, which NYT uses for stars and streaks.
 */
export function recordChange(
  /** The progress before the change. */
  previous: CrosswordProgress,
  /** The new state. */
  next: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** The moment of the change. */
  now: Date,
): CrosswordProgress {
  const changed =
    next.entries !== previous.entries ||
    next.marks !== previous.marks ||
    next.autocheck !== previous.autocheck
  const firstSolve =
    previous.firstSolve ??
    (changed && isSolved(next, puzzle)
      ? { seconds: previous.elapsed, date: localIsoString(now) }
      : undefined)
  return {
    ...next,
    elapsed: previous.elapsed,
    updated: changed ? Math.floor(now.getTime() / 1000) : previous.updated,
    ...(firstSolve && { firstSolve }),
  }
}
