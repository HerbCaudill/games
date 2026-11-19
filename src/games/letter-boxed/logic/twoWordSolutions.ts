import type { LetterBoxedPuzzle } from "@/types"

/** Every pair of dictionary words that chains together and uses all the letters, shortest first. */
export function twoWordSolutions(
  /** The puzzle. */
  puzzle: LetterBoxedPuzzle,
) {
  const letters = puzzle.sides.join("")
  const all = (1 << letters.length) - 1
  const mask = (word: string) => [...word].reduce((m, l) => m | (1 << letters.indexOf(l)), 0)
  const masks = new Map(puzzle.dictionary.map(word => [word, mask(word)]))
  const byFirstLetter = new Map<string, string[]>()
  for (const word of puzzle.dictionary)
    byFirstLetter.set(word[0], [...(byFirstLetter.get(word[0]) ?? []), word])

  return puzzle.dictionary
    .flatMap(first =>
      (byFirstLetter.get(first.at(-1)!) ?? [])
        .filter(second => (masks.get(first)! | masks.get(second)!) === all)
        .map(second => [first, second]),
    )
    .sort((a, b) => a.join("").length - b.join("").length || a.join(" ").localeCompare(b.join(" ")))
}
