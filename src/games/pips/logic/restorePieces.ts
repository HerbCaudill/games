import type { Pieces } from "./types"

/**
 * Go back to a saved version of the board for undo or redo. Only the board is restored: a domino
 * that is off the board both now and in the saved version stays where it lies and faces the way it
 * does now, since rearranging dominoes off the board is not a move.
 */
export function restorePieces(
  /** How the pieces are now. */
  current: Pieces,
  /** The version to go back to. */
  saved: Pieces,
): Pieces {
  const offBoth = (i: number) => !saved.placements[i] && !current.placements[i]
  return {
    placements: saved.placements,
    turns: saved.placements.map((_, i) => (offBoth(i) ? current.turns[i] : saved.turns[i]) ?? 0),
    spots: saved.placements.map((_, i) => (offBoth(i) ? current.spots[i] : saved.spots[i]) ?? null),
  }
}
