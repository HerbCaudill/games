/** A Letter Boxed game in progress. */
export type LetterBoxedState = {
  /** Submitted words. */
  words: string[]
  /** The word being typed; after the first word it starts with the previous word's last letter. */
  current: string
}
