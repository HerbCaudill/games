import type { GameId } from "./types"

/** The games, in menu order, with their display details. */
export const GAMES: GameInfo[] = [
  {
    id: "crossword",
    name: "Crossword",
    blurb: "The daily crossword",
    color: "var(--game-crossword)",
  },
  {
    id: "pips",
    name: "Pips",
    blurb: "Place dominoes to meet every rule",
    color: "var(--game-pips)",
  },
  {
    id: "spelling-bee",
    name: "Spelling Bee",
    blurb: "Make words from seven letters",
    color: "var(--game-spelling-bee)",
  },
  {
    id: "connections",
    name: "Connections",
    blurb: "Sort sixteen words into four groups",
    color: "var(--game-connections)",
  },
  {
    id: "letter-boxed",
    name: "Letter Boxed",
    blurb: "Chain words around the square",
    color: "var(--game-letter-boxed)",
  },
]

// TYPES

/** Display details for a game. */
export type GameInfo = {
  /** Route and API name. */
  id: GameId
  /** Display name. */
  name: string
  /** One-line description for the menu. */
  blurb: string
  /** Accent color, as a CSS value. */
  color: string
}
