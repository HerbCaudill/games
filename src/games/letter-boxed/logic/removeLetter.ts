import type { LetterBoxedState } from "./types"

/** Remove the last letter, reopening the previous word when only its carried-over letter is left. */
export function removeLetter(
  /** Current state. */
  state: LetterBoxedState,
): LetterBoxedState {
  if (state.current.length === 1 && state.words.length > 0)
    return { words: state.words.slice(0, -1), current: state.words.at(-1)! }
  return { ...state, current: state.current.slice(0, -1) }
}
