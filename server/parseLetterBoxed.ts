import type { LetterBoxedPuzzle } from "../src/types.ts"

/** Read today's Letter Boxed puzzle from the `window.gameData` script in the NYT game page. */
export function parseLetterBoxed(
  /** The game page HTML. */
  html: string,
): LetterBoxedPuzzle | undefined {
  const match = html.match(/window\.gameData\s*=\s*(\{.*?\})\s*<\/script>/s)
  if (!match) return undefined
  const data = JSON.parse(match[1]) as RawLetterBoxed
  return {
    id: data.id,
    date: data.printDate,
    editor: data.editor ?? "",
    sides: data.sides,
    par: data.par,
    solution: data.ourSolution,
    dictionary: data.dictionary,
  }
}

// TYPES

/** The parts of the embedded Letter Boxed game data this app reads. */
type RawLetterBoxed = {
  id: number
  printDate: string
  editor?: string
  sides: string[]
  par: number
  ourSolution: string[]
  dictionary: string[]
}
