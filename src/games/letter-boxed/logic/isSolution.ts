import type { LetterBoxedPuzzle } from "@/types"

/** Whether a chain of words uses every letter on the board, in any number of words. */
export function isSolution(
  /** The chain. */
  words: string[],
  /** The puzzle. */
  puzzle: LetterBoxedPuzzle,
) {
  const used = new Set(words.join(""))
  return [...puzzle.sides.join("")].every(letter => used.has(letter))
}
