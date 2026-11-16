import { useEffect } from "react"
import type { GameId } from "@/types"
import { statusKey } from "./statusKey"
import { writeStored } from "./writeStored"

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

// TYPES

/** How far along a puzzle is. */
export type GameStatus = "new" | "started" | "solved" | "failed"
