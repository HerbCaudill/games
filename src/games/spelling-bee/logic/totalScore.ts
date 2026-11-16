import { scoreWord } from "./scoreWord"
import type { SpellingBeePuzzle } from "@/types"

/** Add up the score for a list of words. */
export function totalScore(
  /** Words found so far. */
  words: string[],
  /** The puzzle. */
  puzzle: SpellingBeePuzzle,
) {
  return words.reduce((sum, word) => sum + scoreWord(word, puzzle), 0)
}
