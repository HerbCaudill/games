import type { z } from "zod"
import type { PuzzleFor, SyncedGame, SyncedProgressFor } from "../src/types.ts"

/** How one game's progress converts between the app's shape and NYT's game state. */
export type ProgressFormat<G extends SyncedGame> = {
  /** NYT's name for the game in its state API, such as `spelling_bee`. */
  nytGame: string
  /** Checks progress the app sends. */
  schema: z.ZodType<SyncedProgressFor[G]>
  /** Read NYT's saved state as the app's progress. */
  fromNyt: (state: NytGameState, puzzle: PuzzleFor[G]) => SyncedProgressFor[G]
  /** Write the app's progress as NYT game data, keeping fields from NYT's last save that the app doesn't track. */
  toNyt: (
    progress: SyncedProgressFor[G],
    puzzle: PuzzleFor[G],
    previous?: NytGameData,
  ) => NytGameData
  /** When the progress last changed, in Unix seconds, for games that track it. */
  updated?: (progress: SyncedProgressFor[G]) => number
}

/** One saved game in NYT's state API. */
export type NytGameState = {
  /** The game's own record, which differs by game. */
  game_data: NytGameData
  /** NYT puzzle ID, as a string. */
  puzzle_id: string
  /** Print date as YYYY-MM-DD. */
  print_date: string
  /** When it was saved, in Unix seconds. */
  timestamp: number
}

/** A game's record in NYT's state API. */
export type NytGameData = Record<string, unknown>
