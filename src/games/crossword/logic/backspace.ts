import { clueAt } from "./clueAt"
import { replaceAt } from "./replaceAt"
import type { CrosswordState } from "./types"
import type { CrosswordPuzzle } from "@/types"

/**
 * Delete the current letter, or step back and delete the previous one. From the empty first square
 * of an answer, step back to the last square of the previous answer.
 */
export function backspace(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
): CrosswordState {
  const clear = (s: CrosswordState, cell: number): CrosswordState =>
    s.marks[cell] === "revealed" || s.marks[cell] === "correct"
      ? s
      : { ...s, entries: replaceAt(s.entries, cell, ""), marks: replaceAt(s.marks, cell, null) }
  if (state.entries[state.cursor]) return clear(state, state.cursor)
  const clue = clueAt(puzzle, state.cursor, state.direction)
  if (!clue) return state
  const previous = clue.cells[clue.cells.indexOf(state.cursor) - 1]
  if (previous !== undefined) return clear({ ...state, cursor: previous }, previous)
  const { clues } = puzzle
  const previousClue = clues[(clues.indexOf(clue) - 1 + clues.length) % clues.length]
  const last = previousClue.cells.at(-1)!
  return clear({ ...state, cursor: last, direction: previousClue.direction }, last)
}
