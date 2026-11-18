import type { LetterBoxedPuzzle } from "@/types"

/** The board letters a chain has not used yet, in board order. */
export function remainingLetters(
  /** The chain. */
  words: string[],
  /** The puzzle. */
  puzzle: LetterBoxedPuzzle,
) {
  const used = new Set(words.join(""))
  return [...puzzle.sides.join("")].filter(letter => !used.has(letter)).join("")
}
