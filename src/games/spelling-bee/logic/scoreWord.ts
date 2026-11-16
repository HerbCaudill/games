import type { SpellingBeePuzzle } from "@/types"

/** Score one word: one point at four letters, otherwise one per letter, plus seven for a pangram. */
export function scoreWord(
  /** The word, lowercase. */
  word: string,
  /** The puzzle. */
  puzzle: SpellingBeePuzzle,
) {
  const base = word.length === 4 ? 1 : word.length
  return puzzle.pangrams.includes(word) ? base + 7 : base
}
