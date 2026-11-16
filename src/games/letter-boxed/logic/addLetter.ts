import { sideOf } from "./sideOf"
import type { LetterBoxedState } from "./types"
import type { LetterBoxedPuzzle } from "@/types"

/** Add a letter if the rules allow it: on the board, and not on the same side as the previous letter. */
export function addLetter(
  /** Current state. */
  state: LetterBoxedState,
  /** The letter. */
  letter: string,
  /** The puzzle. */
  puzzle: LetterBoxedPuzzle,
): LetterBoxedState {
  const upper = letter.toUpperCase()
  const side = sideOf(upper, puzzle)
  if (side < 0) return state
  const previous = state.current.at(-1)
  if (previous && sideOf(previous, puzzle) === side) return state
  return { ...state, current: state.current + upper }
}
