import { clueAt } from "./clueAt"
import type { CrosswordState, Scope } from "./types"
import type { CrosswordPuzzle } from "@/types"

/** Squares covered by a check, reveal or clear. */
export function scopeCells(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** The scope. */
  scope: Scope,
): number[] {
  if (scope === "square") return [state.cursor]
  if (scope === "word") return clueAt(puzzle, state.cursor, state.direction)?.cells ?? []
  return puzzle.cells.flatMap((square, i) => (square ? [i] : []))
}
