import { useEffect, useRef } from "react"
import type { GameId } from "@/types"
import { statusKey } from "./statusKey"
import { writeStored } from "./writeStored"

/** Save menu progress and announce completions reached during this visit. */
export function useGameStatus(
  /** The game. */
  game: GameId,
  /** Date as YYYY-MM-DD. */
  date: string,
  /** The puzzle's current status. */
  status: GameStatus,
) {
  const previous = useRef({ game, date, status })
  useEffect(() => {
    const before = previous.current
    previous.current = { game, date, status }
    writeStored(statusKey(game, date), status)
    if (
      before.game === game &&
      before.date === date &&
      before.status !== "solved" &&
      status === "solved"
    )
      window.dispatchEvent(new Event("game-completed"))
  }, [game, date, status])
}

// TYPES

/** How far along a puzzle is. */
export type GameStatus = "new" | "started" | "solved" | "failed"
