import { clueAt } from "./clueAt"
import { flip } from "./flip"
import type { CrosswordState } from "./types"
import type { CrosswordPuzzle } from "@/types"

/** Turn to the other direction, if the current square has an answer that way. */
export function toggleDirection(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
): CrosswordState {
  const other = flip(state.direction)
  return clueAt(puzzle, state.cursor, other) ? { ...state, direction: other } : state
}
