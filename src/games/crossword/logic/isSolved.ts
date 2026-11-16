import { isCorrect } from "./isCorrect"
import type { CrosswordState } from "./types"
import type { CrosswordPuzzle } from "@/types"

/** Whether every square is correct. */
export function isSolved(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
) {
  return puzzle.cells.every((square, i) => !square || isCorrect(puzzle, i, state.entries[i]))
}
