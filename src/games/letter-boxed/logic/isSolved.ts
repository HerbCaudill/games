import { isSolution } from "./isSolution"
import type { LetterBoxedState } from "./types"
import type { LetterBoxedPuzzle } from "@/types"

/** Whether any chain so far has used every letter in exactly two words. */
export function isSolved(
  /** Current state. */
  state: LetterBoxedState,
  /** The puzzle. */
  puzzle: LetterBoxedPuzzle,
) {
  return state.history.some(words => words.length === 2 && isSolution(words, puzzle))
}
