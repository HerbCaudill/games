import { addToHistory } from "./addToHistory"
import { isSolution } from "./isSolution"
import type { LetterBoxedState } from "./types"
import type { LetterBoxedPuzzle } from "@/types"

/**
 * Submit the current word and record the chain in the history. The next word starts with its last
 * letter, unless the chain now uses every letter and is finished.
 */
export function submitWord(
  /** Current state. */
  state: LetterBoxedState,
  /** The puzzle. */
  puzzle: LetterBoxedPuzzle,
): { state: LetterBoxedState; error?: string; solution?: boolean } {
  if (state.current.length < 3) return { state, error: "Too short" }
  if (!puzzle.dictionary.includes(state.current)) return { state, error: "Not a word" }
  const words = [...state.words, state.current]
  const solution = isSolution(words, puzzle)
  return {
    state: {
      words,
      current: solution ? "" : state.current.at(-1)!,
      history: addToHistory(state.history, words),
    },
    solution,
  }
}
