import type { ConnectionsState } from "./types"
import type { ConnectionsSync } from "@/types"

/** The progress to save to NYT: every guess, or nothing before the first one. */
export function toSync(
  /** Current state. */
  state: ConnectionsState,
): ConnectionsSync | undefined {
  return state.guesses.length ? { guesses: state.guesses } : undefined
}
