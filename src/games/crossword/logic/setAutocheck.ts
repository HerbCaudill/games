import type { CrosswordPuzzle } from "@/types"
import { isCorrect } from "./isCorrect"
import type { CrosswordState } from "./types"

/** Turn automatic checking on or off for the current puzzle. */
export function setAutocheck(
  /** Current progress. */
  state: CrosswordState,
  /** The puzzle being checked. */
  puzzle: CrosswordPuzzle,
  /** Whether to check new and existing entries. */
  enabled: boolean,
): CrosswordState {
  const marks = enabled
    ? state.entries.map((entry, i) =>
        state.marks[i] === "revealed"
          ? "revealed"
          : entry
            ? isCorrect(puzzle, i, entry)
              ? "correct"
              : "wrong"
            : null,
      )
    : state.marks
  return { ...state, autocheck: enabled, marks, usedAid: state.usedAid || enabled }
}
