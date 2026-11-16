import { MAX_MISTAKES } from "./constants"
import type { ConnectionsState } from "./types"
import type { ConnectionsPuzzle } from "@/types"

/** Whether the game has ended, by winning or by running out of mistakes. */
export function isOver(
  /** Current state. */
  state: ConnectionsState,
  /** The puzzle. */
  puzzle: ConnectionsPuzzle,
) {
  return state.solved.length === puzzle.groups.length || state.mistakes >= MAX_MISTAKES
}
