import { clueAt } from "./clueAt"
import type { CrosswordState } from "./types"
import type { CrosswordPuzzle } from "@/types"

/** Go to the next or previous answer with an empty square, landing on its first empty square. */
export function nextClue(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** 1 for the next answer, -1 for the previous one. */
  step: 1 | -1,
): CrosswordState {
  const { clues } = puzzle
  const current = clueAt(puzzle, state.cursor, state.direction)
  const start = current ? clues.indexOf(current) : 0
  const ordered = clues.map(
    (_, i) => clues[(start + step * (i + 1) + clues.length * 2) % clues.length],
  )
  const target = ordered.find(c => c.cells.some(cell => !state.entries[cell])) ?? ordered[0]
  const cursor = target.cells.find(cell => !state.entries[cell]) ?? target.cells[0]
  return { ...state, cursor, direction: target.direction }
}
