import type { LetterBoxedState } from "./types"

/** Letters used so far, in submitted words and the word being typed. */
export function usedLetters(
  /** Current state. */
  state: LetterBoxedState,
) {
  return new Set([...state.words.join(""), ...state.current])
}
