import type { ConnectionsPuzzle } from "../src/types.ts"

/** Convert the NYT Connections v2 feed into a puzzle. */
export function parseConnections(
  /** The parsed JSON response. */
  raw: RawConnections,
): ConnectionsPuzzle {
  const cards = raw.categories.flatMap(category => category.cards)
  return {
    id: raw.id,
    date: raw.print_date,
    editor: raw.editor ?? "",
    // NYT lists categories from easiest to hardest.
    groups: raw.categories.map((category, level) => ({
      title: category.title,
      words: category.cards.map(card => card.content),
      level,
    })),
    layout: [...cards].sort((a, b) => a.position - b.position).map(card => card.content),
  }
}

// TYPES

/** The parts of the NYT Connections feed this app reads. */
export type RawConnections = {
  id: number
  print_date: string
  editor?: string
  categories: { title: string; cards: { content: string; position: number }[] }[]
}
