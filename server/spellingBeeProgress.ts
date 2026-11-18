import { z } from "zod"
import type { ProgressFormat } from "./types.ts"

/** Spelling Bee progress in NYT's state API: the words found and the rank they reach. */
export const spellingBeeProgress: ProgressFormat<"spelling-bee"> = {
  nytGame: "spelling_bee",
  schema: z.object({ words: z.array(z.string()), rank: z.string() }),
  fromNyt: ({ game_data }) => {
    const data = game_data as Partial<SpellingBeeData>
    return { words: data.answers ?? [], rank: data.rank ?? "Beginner" }
  },
  toNyt: ({ words, rank }, _puzzle, previous) => ({
    isRevealed: false,
    ...previous,
    answers: words,
    rank,
  }),
}

// TYPES

/** NYT's Spelling Bee record. */
type SpellingBeeData = {
  /** Words found, lowercase. */
  answers: string[]
  /** Whether the player gave up and saw the answers. */
  isRevealed: boolean
  /** The rank reached, such as "Genius". */
  rank: string
}
