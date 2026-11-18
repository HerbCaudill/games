import type { SpellingBeePuzzle, SpellingBeeSync } from "@/types"

/** Add the words found on NYT to the ones found here. */
export function mergeSync(
  /** Words found here, in the order found. */
  found: string[],
  /** NYT's progress. */
  remote: SpellingBeeSync,
  /** The puzzle. */
  puzzle: SpellingBeePuzzle,
) {
  const added = remote.words.filter(word => !found.includes(word) && puzzle.answers.includes(word))
  return added.length ? [...found, ...added] : found
}
