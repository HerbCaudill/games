import type { WordCount } from "./types"

/** Count found and total answers by first letter (rows) and length (columns), as in the NYT hint grid. */
export function wordGrid(
  /** Every answer, lowercase. */
  answers: string[],
  /** Answers found so far. */
  found: string[],
): WordGrid {
  const have = new Set(found)
  const lengths = [...new Set(answers.map(w => w.length))].sort((a, b) => a - b)
  const letters = [...new Set(answers.map(w => w[0]))].sort()
  const allFound = (words: string[]) => words.every(w => have.has(w))
  return {
    lengths,
    completeLengths: lengths.map(length => allFound(answers.filter(w => w.length === length))),
    rows: letters.map(letter => ({
      letter,
      complete: allFound(answers.filter(w => w[0] === letter)),
      cells: lengths.map(length => {
        const words = answers.filter(w => w[0] === letter && w.length === length)
        if (!words.length) return undefined
        return { found: words.filter(w => have.has(w)).length, total: words.length }
      }),
    })),
  }
}

// TYPES

/** Answer counts by first letter and length. */
export type WordGrid = {
  /** The answer lengths, shortest first: one column each. */
  lengths: number[]
  /** Whether every answer of each length is found, by column. */
  completeLengths: boolean[]
  /** One row per first letter, with a cell per length; empty where no answer fits. */
  rows: {
    letter: string
    /** Whether every answer starting with the letter is found. */
    complete: boolean
    cells: (WordCount | undefined)[]
  }[]
}
