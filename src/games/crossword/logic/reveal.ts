import { isCorrect } from "./isCorrect"
import { scopeCells } from "./scopeCells"
import type { CrosswordState, Scope } from "./types"
import type { CrosswordPuzzle } from "@/types"

/** Fill in the answers in a square, the current answer, or the whole puzzle. */
export function reveal(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** What to reveal. */
  scope: Scope,
): CrosswordState {
  const entries = [...state.entries]
  const marks = [...state.marks]
  for (const cell of scopeCells(state, puzzle, scope)) {
    if (isCorrect(puzzle, cell, entries[cell])) continue
    entries[cell] = puzzle.cells[cell]!.answer
    marks[cell] = "revealed"
  }
  return { ...state, entries, marks }
}
