import type { LetterBoxedState } from "./types"
import type { LetterBoxedPuzzle } from "@/types"

/** Submit the current word; the next word starts with its last letter. */
export function submitWord(
  /** Current state. */
  state: LetterBoxedState,
  /** The puzzle. */
  puzzle: LetterBoxedPuzzle,
): { state: LetterBoxedState; error?: string } {
  if (state.current.length < 3) return { state, error: "Too short" }
  if (!puzzle.dictionary.includes(state.current)) return { state, error: "Not a word" }
  return { state: { words: [...state.words, state.current], current: state.current.at(-1)! } }
}
