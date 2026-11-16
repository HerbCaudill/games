import type { ConnectionsState } from "./types"
import type { ConnectionsPuzzle } from "@/types"

/** Words not yet in a solved group, in their current order. */
export function remainingWords(
  /** Current state. */
  state: ConnectionsState,
  /** The puzzle. */
  puzzle: ConnectionsPuzzle,
) {
  const solvedWords = new Set(state.solved.flatMap(i => puzzle.groups[i].words))
  return state.order.filter(word => !solvedWords.has(word))
}
