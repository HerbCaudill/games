import { useEffect } from "react"
import type { GameId } from "@/types"
import { statusKey } from "./statusKey"
import { useCelebration } from "./useCelebration"
import { writeStored } from "./writeStored"

/** Save menu progress and celebrate completions reached during this visit. */
export function useGameStatus(
  /** The game. */
  game: GameId,
  /** Date as YYYY-MM-DD. */
  date: string,
  /** The puzzle's current status. */
  status: GameStatus,
) {
  useEffect(() => {
    writeStored(statusKey(game, date), status)
  }, [game, date, status])
  useCelebration(`${game}:${date}`, status === "solved")
}

// TYPES

/** How far along a puzzle is. */
export type GameStatus = "new" | "started" | "solved" | "failed"
