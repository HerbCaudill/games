import type { LetterBoxedState } from "./types"
import type { LetterBoxedPuzzle } from "@/types"

/** Whether exactly two submitted words use every letter on the board. */
export function isSolved(
  /** Current state. */
  state: LetterBoxedState,
  /** The puzzle. */
  puzzle: LetterBoxedPuzzle,
) {
  if (state.words.length !== 2) return false
  const used = new Set(state.words.join(""))
  return [...puzzle.sides.join("")].every(letter => used.has(letter))
}
