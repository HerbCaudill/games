import { clueAt } from "./clueAt"
import type { CrosswordState } from "./types"
import type { CrosswordPuzzle, Direction } from "@/types"

/** Handle an arrow key: turn to its direction first, then move, skipping black squares. */
export function arrow(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** Row step. */
  dr: number,
  /** Column step. */
  dc: number,
): CrosswordState {
  const direction: Direction = dr === 0 ? "across" : "down"
  if (direction !== state.direction && clueAt(puzzle, state.cursor, direction))
    return { ...state, direction }
  let row = Math.floor(state.cursor / puzzle.width) + dr
  let col = (state.cursor % puzzle.width) + dc
  while (row >= 0 && row < puzzle.height && col >= 0 && col < puzzle.width) {
    const cell = row * puzzle.width + col
    if (puzzle.cells[cell]) return { ...state, cursor: cell, direction }
    row += dr
    col += dc
  }
  return state
}
