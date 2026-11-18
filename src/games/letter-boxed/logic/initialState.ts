import type { LetterBoxedState } from "./types"

/** Start with no words. */
export function initialState(): LetterBoxedState {
  return { words: [], current: "", history: [] }
}
