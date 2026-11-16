import type { LetterBoxedPuzzle } from "@/types"

/** Find which side a letter is on, or -1. */
export function sideOf(
  /** An uppercase letter. */
  letter: string,
  /** The puzzle. */
  puzzle: LetterBoxedPuzzle,
) {
  return puzzle.sides.findIndex(side => side.includes(letter))
}
