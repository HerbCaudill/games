import { isCorrect } from "./isCorrect"
import { scopeCells } from "./scopeCells"
import type { CrosswordState, Scope } from "./types"
import type { CrosswordPuzzle } from "@/types"

/** Mark wrong letters in a square, the current answer, or the whole puzzle. */
export function check(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** What to check. */
  scope: Scope,
): CrosswordState {
  const marks = [...state.marks]
  for (const cell of scopeCells(state, puzzle, scope)) {
    const entry = state.entries[cell]
    if (entry && !isCorrect(puzzle, cell, entry)) marks[cell] = "wrong"
  }
  return { ...state, marks }
}
