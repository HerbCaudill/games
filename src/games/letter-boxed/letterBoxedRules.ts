import type { LetterBoxedPuzzle } from "@/types"

/** Start with no words. */
export function initialState(): LetterBoxedState {
  return { words: [], current: "" }
}

/** Find which side a letter is on, or -1. */
export function sideOf(
  /** An uppercase letter. */
  letter: string,
  /** The puzzle. */
  puzzle: LetterBoxedPuzzle,
) {
  return puzzle.sides.findIndex(side => side.includes(letter))
}

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

/** Remove the last letter, reopening the previous word when only its carried-over letter is left. */
export function removeLetter(
  /** Current state. */
  state: LetterBoxedState,
): LetterBoxedState {
  if (state.current.length === 1 && state.words.length > 0)
    return { words: state.words.slice(0, -1), current: state.words.at(-1)! }
  return { ...state, current: state.current.slice(0, -1) }
}

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

/** Letters used so far, in submitted words and the word being typed. */
export function usedLetters(
  /** Current state. */
  state: LetterBoxedState,
) {
  return new Set([...state.words.join(""), ...state.current])
}

/** Whether the submitted words use every letter on the board. */
export function isSolved(
  /** Current state. */
  state: LetterBoxedState,
  /** The puzzle. */
  puzzle: LetterBoxedPuzzle,
) {
  const used = new Set(state.words.join(""))
  return [...puzzle.sides.join("")].every(letter => used.has(letter))
}

// TYPES

/** A Letter Boxed game in progress. */
export type LetterBoxedState = {
  /** Submitted words. */
  words: string[]
  /** The word being typed; after the first word it starts with the previous word's last letter. */
  current: string
}
