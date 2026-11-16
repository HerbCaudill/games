import type { ConnectionsState } from "./types"
import type { ConnectionsPuzzle } from "@/types"

/** Start a fresh game with the words in their published order. */
export function initialState(
  /** The puzzle. */
  puzzle: ConnectionsPuzzle,
): ConnectionsState {
  return { order: puzzle.layout, solved: [], mistakes: 0, guesses: [] }
}
