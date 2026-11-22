import type { Domino } from "@/types"

/**
 * The order dominoes line up in the tray: by smaller number, then larger. It lists indexes rather
 * than reordering the puzzle's dominoes, because saved progress refers to dominoes by index.
 */
export function trayOrder(
  /** The puzzle's dominoes. */
  dominoes: Domino[],
) {
  return dominoes
    .map((domino, index) => ({ index, low: Math.min(...domino), high: Math.max(...domino) }))
    .sort((a, b) => a.low - b.low || a.high - b.high)
    .map(({ index }) => index)
}
