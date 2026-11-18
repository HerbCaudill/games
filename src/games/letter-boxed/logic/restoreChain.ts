import { isSolution } from "./isSolution"
import type { LetterBoxedState } from "./types"
import type { LetterBoxedPuzzle } from "@/types"

/** Bring back a chain from the history, as it stood just after its last word was submitted. */
export function restoreChain(
  /** Current state. */
  state: LetterBoxedState,
  /** The chain. */
  words: string[],
  /** The puzzle. */
  puzzle: LetterBoxedPuzzle,
): LetterBoxedState {
  return { ...state, words, current: isSolution(words, puzzle) ? "" : words.at(-1)!.at(-1)! }
}
