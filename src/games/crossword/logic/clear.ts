import { scopeCells } from "./scopeCells"
import type { CrosswordState, Scope } from "./types"
import type { CrosswordPuzzle } from "@/types"

/** Empty a square, the current answer, or the whole puzzle, keeping revealed squares. */
export function clear(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** What to clear. */
  scope: Scope,
): CrosswordState {
  const cells = new Set(scopeCells(state, puzzle, scope))
  const keep = (i: number) => !cells.has(i) || state.marks[i] === "revealed"
  return {
    ...state,
    entries: state.entries.map((e, i) => (keep(i) ? e : "")),
    marks: state.marks.map((m, i) => (keep(i) ? m : null)),
  }
}
