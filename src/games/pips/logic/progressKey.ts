import type { PipsDifficulty } from "@/types"

/** Storage key for one board's progress. */
export function progressKey(
  /** Puzzle date. */
  date: string,
  /** Difficulty. */
  difficulty: PipsDifficulty,
) {
  return `progress:pips:${date}:${difficulty}`
}
