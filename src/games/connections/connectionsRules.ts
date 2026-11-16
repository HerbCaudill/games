import type { ConnectionsPuzzle } from "@/types"

/** Start a fresh game with the words in their published order. */
export function initialState(
  /** The puzzle. */
  puzzle: ConnectionsPuzzle,
): ConnectionsState {
  return { order: puzzle.layout, solved: [], mistakes: 0, guesses: [] }
}

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

/** Whether the game has ended, by winning or by running out of mistakes. */
export function isOver(
  /** Current state. */
  state: ConnectionsState,
  /** The puzzle. */
  puzzle: ConnectionsPuzzle,
) {
  return state.solved.length === puzzle.groups.length || state.mistakes >= MAX_MISTAKES
}

// CONSTANTS

/** Mistakes allowed before the game ends. */
export const MAX_MISTAKES = 4

// TYPES

/** A Connections game in progress. */
export type ConnectionsState = {
  /** All words in their current display order. */
  order: string[]
  /** Indexes of solved groups, in the order they were solved. */
  solved: number[]
  /** Wrong guesses so far. */
  mistakes: number
  /** Every guess so far, to catch repeats. */
  guesses: string[][]
}

/** What happened when the player submitted. */
export type GuessOutcome = "correct" | "one-away" | "wrong" | "already-guessed"
