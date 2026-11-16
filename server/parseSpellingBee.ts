import type { SpellingBeePuzzle } from "../src/types.ts"

/** Pick the puzzle for a date out of the NYT list of recent Spelling Bees. */
export function parseSpellingBee(
  /** The parsed `active.json` response. */
  raw: RawActiveSpellingBees,
  /** Print date as YYYY-MM-DD. */
  date: string,
): SpellingBeePuzzle | undefined {
  const puzzle = raw.puzzles.find(p => p.print_date === date)
  if (!puzzle) return undefined
  return {
    id: puzzle.id,
    date: puzzle.print_date,
    editor: puzzle.editor ?? "",
    center: puzzle.center_letter,
    outer: puzzle.outer_letters.split(""),
    // This feed can leave pangrams out of the answer list.
    answers: [...new Set([...puzzle.answers, ...puzzle.pangrams])],
    pangrams: puzzle.pangrams,
  }
}

// TYPES

/** The parts of the NYT `active.json` feed this app reads. */
export type RawActiveSpellingBees = {
  puzzles: {
    id: number
    center_letter: string
    outer_letters: string
    pangrams: string[]
    answers: string[]
    print_date: string
    editor?: string
  }[]
}
