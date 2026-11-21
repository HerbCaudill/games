import type { WordCount } from "./types"

/** Count found and total answers by their first two letters, grouped by first letter. */
export function twoLetterList(
  /** Every answer, lowercase. */
  answers: string[],
  /** Answers found so far. */
  found: string[],
) {
  const have = new Set(found)
  const prefixes = [...new Set(answers.map(w => w.slice(0, 2)))].sort()
  const letters = [...new Set(prefixes.map(p => p[0]))]
  return letters.map(letter => ({
    letter,
    /** Whether every answer starting with the letter is found. */
    complete: answers.filter(w => w[0] === letter).every(w => have.has(w)),
    prefixes: prefixes
      .filter(prefix => prefix[0] === letter)
      .map((prefix): { prefix: string } & WordCount => {
        const words = answers.filter(w => w.startsWith(prefix))
        return { prefix, found: words.filter(w => have.has(w)).length, total: words.length }
      }),
  }))
}
