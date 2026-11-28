import { turnTo } from "./turnTo"
import type { Pieces } from "./types"

/**
 * Go back to a saved version of the board for undo or redo. Only the board is restored: a domino
 * that is off the board both now and in the saved version stays where it lies and faces the way it
 * does now, since rearranging dominoes off the board is not a move. A domino that comes off the
 * board goes back to where it lay, but faces its starting way, as if it had never been picked up.
 */
export function restorePieces(
  /** How the pieces are now. */
  current: Pieces,
  /** The version to go back to. */
  saved: Pieces,
  /** The way each domino faces at the start, in quarter turns clockwise. */
  startingTurns: number[],
): Pieces {
  const offBoth = (i: number) => !saved.placements[i] && !current.placements[i]
  const comesOff = (i: number) => !saved.placements[i] && current.placements[i]
  return {
    placements: saved.placements,
    turns: saved.placements.map(
      (_, i) =>
        (offBoth(i)
          ? current.turns[i]
          : comesOff(i)
            ? // The nearest count that faces the starting way, so it doesn't spin the long way back.
              turnTo(current.turns[i], startingTurns[i])
            : saved.turns[i]) ?? 0,
    ),
    spots: saved.placements.map((_, i) => (offBoth(i) ? current.spots[i] : saved.spots[i]) ?? null),
  }
}
