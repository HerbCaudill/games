/** The outcome of a guess. */
export type GuessResult =
  | { ok: true; word: string; score: number; pangram: boolean }
  | { ok: false; message: string }

/** A player's standing. */
export type Rank = {
  /** Current rank name. */
  name: string
  /** The next rank and the score it needs. */
  next?: { name: string; score: number }
  /** Every rank with its score threshold. */
  ranks: { name: string; score: number }[]
  /** The maximum possible score. */
  max: number
}
