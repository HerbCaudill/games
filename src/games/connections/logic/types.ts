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
