import type { ConnectionsState } from "@/games/connections/logic/types"
import type { CrosswordProgress } from "@/games/crossword/logic/types"
import { DIFFICULTIES } from "@/games/pips/logic/constants"
import { progressKey } from "@/games/pips/logic/progressKey"
import { rankFor } from "@/games/spelling-bee/logic/rankFor"
import { totalScore } from "@/games/spelling-bee/logic/totalScore"
import { puzzleKey } from "@/lib/puzzleKey"
import { readGameStatus } from "@/lib/readGameStatus"
import { readStored } from "@/lib/readStored"
import type { GameStatus } from "@/lib/useGameStatus"
import type { GameId, PuzzleFor } from "@/types"

/** Read what the home menu shows about a puzzle: its status, the time spent and, for games that have one, a picture of progress. */
export function readHomeTile(
  /** The game. */
  game: GameId,
  /** Date as YYYY-MM-DD. */
  date: string,
): HomeTile {
  const status = readGameStatus(game, date)
  const elapsed = readElapsed(game, date)
  const progress = status === "new" ? undefined : readProgress(game, date)
  return {
    status,
    ...(elapsed === undefined ? {} : { elapsed }),
    ...(progress ? { progress } : {}),
  }
}

/** Seconds spent, from wherever the game keeps its clock, or undefined when it has none saved. */
function readElapsed(
  /** The game. */
  game: GameId,
  /** Date as YYYY-MM-DD. */
  date: string,
) {
  if (game === "crossword")
    return readStored<CrosswordProgress>(`progress:crossword:${date}`)?.elapsed
  if (game === "pips") {
    const boards = DIFFICULTIES.map(d => readStored<{ elapsed: number }>(progressKey(date, d)))
    const times = boards.flatMap(board => (board ? [board.elapsed] : []))
    return times.length ? times.reduce((sum, t) => sum + t, 0) : undefined
  }
  return readStored<number>(`time:${game}:${date}`)
}

/** A summary of progress, when the game has one and its puzzle is saved on this device. */
function readProgress(
  /** The game. */
  game: GameId,
  /** Date as YYYY-MM-DD. */
  date: string,
): HomeProgress | undefined {
  const progress = readStored<unknown>(`progress:${game}:${date}`)
  if (!progress) return undefined
  switch (game) {
    case "crossword": {
      const puzzle = readPuzzle("crossword", date)
      if (!puzzle) return undefined
      const { entries } = progress as CrosswordProgress
      const open = puzzle.cells.filter(Boolean).length
      const filled = puzzle.cells.filter((cell, i) => cell && entries[i]).length
      return { game, filled: open ? filled / open : 0 }
    }
    case "spelling-bee": {
      const puzzle = readPuzzle("spelling-bee", date)
      if (!puzzle) return undefined
      const { name, ranks } = rankFor(totalScore(progress as string[], puzzle), puzzle)
      return { game, rank: ranks.findIndex(r => r.name === name), name }
    }
    case "connections": {
      const puzzle = readPuzzle("connections", date)
      if (!puzzle) return undefined
      const { solved, mistakes } = progress as ConnectionsState
      return { game, levels: solved.map(i => puzzle.groups[i].level), mistakes }
    }
    default:
      return undefined
  }
}

/** The local copy of a puzzle, if this device has one. */
function readPuzzle<G extends GameId>(
  /** The game. */
  game: G,
  /** Date as YYYY-MM-DD. */
  date: string,
) {
  return readStored<PuzzleFor[G]>(puzzleKey(game, date))
}

// TYPES

/** What the home menu shows about a puzzle. */
export type HomeTile = {
  /** How far along it is. */
  status: GameStatus
  /** Seconds spent; absent when the game has no time saved. */
  elapsed?: number
  /** A picture of progress, for games that have one. */
  progress?: HomeProgress
}

/** Progress worth drawing on the home menu. */
export type HomeProgress =
  | {
      /** The game. */
      game: "crossword"
      /** The share of open squares filled, from 0 to 1. */
      filled: number
    }
  | {
      /** The game. */
      game: "spelling-bee"
      /** Index of the rank reached, from 0 (Beginner) to 9 (Queen Bee). */
      rank: number
      /** The rank's name. */
      name: string
    }
  | {
      /** The game. */
      game: "connections"
      /** Difficulty levels of the groups found, in the order found. */
      levels: number[]
      /** Wrong guesses so far. */
      mistakes: number
    }
