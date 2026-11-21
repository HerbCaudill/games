import type { PipsBoard } from "@/types"
import { badgeCorner } from "./badgeCorner"
import { boardCells } from "./boardCells"
import { BADGE_REACH } from "./constants"
import type { Rect } from "./types"

/** Where loose dominoes shouldn't lie: the board's cells and the rule badges hanging off them. */
export function boardWalls(
  /** The board. */
  board: PipsBoard,
): Rect[] {
  const cells = boardCells(board).map(([r, c]) => ({
    left: c,
    top: r,
    right: c + 1,
    bottom: r + 1,
  }))
  const badges = board.regions
    .filter(region => region.type !== "empty")
    .map(region => {
      const [x, y] = badgeCorner(region)
      return {
        left: x - BADGE_REACH,
        top: y - BADGE_REACH,
        right: x + BADGE_REACH,
        bottom: y + BADGE_REACH,
      }
    })
  return [...cells, ...badges]
}
