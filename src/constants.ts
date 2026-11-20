import type { GameId } from "./types"

/** The games, in menu order, with their display details. */
export const GAMES: GameInfo[] = [
  {
    id: "crossword",
    name: "Crossword",
    color: "var(--crossword-tile)",
  },
  {
    id: "pips",
    name: "Pips",
    color: "var(--game-pips)",
  },
  {
    id: "spelling-bee",
    name: "Spelling Bee",
    color: "var(--game-spelling-bee)",
  },
  {
    id: "connections",
    name: "Connections",
    color: "var(--game-connections)",
  },
  {
    id: "letter-boxed",
    name: "Letter Boxed",
    color: "var(--game-letter-boxed)",
  },
]

/** Width of the black strokes in the home menu's pictures, as a share of the picture's width, so every picture draws them alike. */
export const PICTURE_STROKE = 0.0375

// TYPES

/** Display details for a game. */
export type GameInfo = {
  /** Route and API name. */
  id: GameId
  /** Display name. */
  name: string
  /** Tile color on the home menu, as a CSS value. */
  color: string
}
