import type { SpellingBeePuzzle, SpellingBeeSync } from "@/types"
import { rankFor } from "./rankFor"
import { totalScore } from "./totalScore"

/** The progress to save to NYT: the words found and their rank, or nothing before the first word. */
export function toSync(
  /** Words found, in the order found. */
  found: string[],
  /** The puzzle. */
  puzzle: SpellingBeePuzzle,
): SpellingBeeSync | undefined {
  if (!found.length) return undefined
  return { words: found, rank: rankFor(totalScore(found, puzzle), puzzle).name }
}
