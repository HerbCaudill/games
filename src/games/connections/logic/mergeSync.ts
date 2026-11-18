import { initialState } from "./initialState"
import { submitGuess } from "./submitGuess"
import type { ConnectionsState } from "./types"
import type { ConnectionsPuzzle, ConnectionsSync } from "@/types"

/** Take NYT's game when it has more guesses than this device's, replaying them in order. */
export function mergeSync(
  /** This device's state. */
  state: ConnectionsState,
  /** NYT's progress. */
  remote: ConnectionsSync,
  /** The puzzle. */
  puzzle: ConnectionsPuzzle,
) {
  if (remote.guesses.length <= state.guesses.length) return state
  return remote.guesses.reduce(
    (s, guess) => submitGuess(s, guess, puzzle).state,
    initialState(puzzle),
  )
}
