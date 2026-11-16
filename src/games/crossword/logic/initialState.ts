import type { CrosswordState } from "./types"
import type { CrosswordPuzzle } from "@/types"

/** Start with an empty grid, at the first square, going across. */
export function initialState(
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
): CrosswordState {
  return {
    entries: puzzle.cells.map(() => ""),
    marks: puzzle.cells.map(() => null),
    cursor: puzzle.cells.findIndex(Boolean),
    direction: "across",
  }
}
