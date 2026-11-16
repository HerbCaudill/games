import { clueAt } from "./clueAt"
import { flip } from "./flip"
import type { CrosswordState } from "./types"
import type { CrosswordPuzzle } from "@/types"

/** Move to a square; selecting the current square again turns to the other direction. */
export function selectCell(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** Square index. */
  cell: number,
): CrosswordState {
  if (!puzzle.cells[cell]) return state
  const other = flip(state.direction)
  const turn =
    cell === state.cursor
      ? Boolean(clueAt(puzzle, cell, other))
      : !clueAt(puzzle, cell, state.direction)
  return { ...state, cursor: cell, direction: turn ? other : state.direction }
}
