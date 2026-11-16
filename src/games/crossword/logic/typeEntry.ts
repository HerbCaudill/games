import { clueAt } from "./clueAt"
import { isCorrect } from "./isCorrect"
import { nextClue } from "./nextClue"
import { replaceAt } from "./replaceAt"
import type { CrosswordState } from "./types"
import type { CrosswordPuzzle } from "@/types"

/** Type into the current square, then move on the way a solver expects. */
export function typeEntry(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** A letter, or several letters for a rebus square. */
  text: string,
): CrosswordState {
  const { cursor } = state
  const clue = clueAt(puzzle, cursor, state.direction)
  const wasFull = clue ? clue.cells.every(c => state.entries[c]) : true
  const locked = state.marks[cursor] === "revealed" || state.marks[cursor] === "correct"
  const entries = locked ? state.entries : replaceAt(state.entries, cursor, text.toUpperCase())
  const mark = state.autocheck
    ? isCorrect(puzzle, cursor, entries[cursor])
      ? "correct"
      : "wrong"
    : null
  const marks = locked ? state.marks : replaceAt(state.marks, cursor, mark)
  const typed = { ...state, entries, marks }
  if (!clue) return typed

  const position = clue.cells.indexOf(cursor)
  // Correcting a finished answer: step through it rather than jumping away.
  if (wasFull) return { ...typed, cursor: clue.cells[position + 1] ?? cursor }
  const after = clue.cells.slice(position + 1).find(c => !entries[c])
  const before = clue.cells.slice(0, position).find(c => !entries[c])
  if (after !== undefined || before !== undefined) return { ...typed, cursor: after ?? before! }
  return nextClue(typed, puzzle, 1)
}
