/** A Letter Boxed game in progress. */
export type LetterBoxedState = {
  /** Submitted words in the current chain. */
  words: string[]
  /** The word being typed; after the first word it starts with the previous word's last letter. Empty once the chain uses every letter. */
  current: string
  /** Every chain tried so far, oldest first, leaving out chains that a later one continues. */
  history: string[][]
}
