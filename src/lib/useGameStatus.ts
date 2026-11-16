import { useEffect } from "react"
import type { GameId } from "@/types"
import { readStored, writeStored } from "./storage"

/** Record whether a puzzle is started or finished, for the menu to show. */
export function useGameStatus(
  /** The game. */
  game: GameId,
  /** Date as YYYY-MM-DD. */
  date: string,
  /** The puzzle's current status. */
  status: GameStatus,
) {
  useEffect(() => {
    if (status !== "new") writeStored(statusKey(game, date), status)
  }, [game, date, status])
}

/** Read a puzzle's saved status. */
export function readGameStatus(
  /** The game. */
  game: GameId,
  /** Date as YYYY-MM-DD. */
  date: string,
): GameStatus {
  return readStored<GameStatus>(statusKey(game, date)) ?? "new"
}

/** Storage key for a puzzle's status. */
function statusKey(
  /** The game. */
  game: GameId,
  /** Date as YYYY-MM-DD. */
  date: string,
) {
  return `status:${game}:${date}`
}

// TYPES

/** How far along a puzzle is. */
export type GameStatus = "new" | "started" | "solved" | "failed"
