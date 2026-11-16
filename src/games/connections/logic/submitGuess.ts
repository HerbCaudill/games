import type { ConnectionsState, GuessOutcome } from "./types"
import type { ConnectionsPuzzle } from "@/types"

/** Check four selected words against the groups. */
export function submitGuess(
  /** Current state. */
  state: ConnectionsState,
  /** The four selected words. */
  selection: string[],
  /** The puzzle. */
  puzzle: ConnectionsPuzzle,
): { state: ConnectionsState; result: GuessOutcome } {
  const key = [...selection].sort().join("|")
  if (state.guesses.some(guess => [...guess].sort().join("|") === key))
    return { state, result: "already-guessed" }
  const guesses = [...state.guesses, selection]
  const overlaps = puzzle.groups.map(group => selection.filter(w => group.words.includes(w)).length)
  const match = overlaps.indexOf(4)
  if (match >= 0)
    return { state: { ...state, guesses, solved: [...state.solved, match] }, result: "correct" }
  const next = { ...state, guesses, mistakes: state.mistakes + 1 }
  return { state: next, result: overlaps.includes(3) ? "one-away" : "wrong" }
}
