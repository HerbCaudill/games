import { useEffect, useRef } from "react"
import type { GameId } from "@/types"

/**
 * Play the shared completion celebration when something becomes done during this visit. Loading
 * something already done, or switching to another key that is done, does not celebrate.
 */
export function useCelebration(
  /** The game being played, which colors the celebration. */
  game: GameId,
  /** Identifies what is being finished, such as one puzzle or one board. */
  key: string,
  /** Whether it is done. */
  done: boolean,
) {
  const previous = useRef({ key, done })
  useEffect(() => {
    const before = previous.current
    previous.current = { key, done }
    if (before.key === key && !before.done && done)
      window.dispatchEvent(new CustomEvent<GameId>("game-completed", { detail: game }))
  }, [game, key, done])
}
