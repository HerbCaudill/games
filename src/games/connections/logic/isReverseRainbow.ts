import type { ConnectionsPuzzle } from "@/types"

/** Whether every group was found from hardest to easiest: purple, blue, green, then yellow. */
export function isReverseRainbow(
  /** Indexes of the groups found, in the order found. */
  solved: number[],
  /** The puzzle. */
  puzzle: ConnectionsPuzzle,
) {
  const levels = solved.map(i => puzzle.groups[i].level)
  return (
    levels.length === puzzle.groups.length &&
    levels.every((level, i) => level === levels.length - 1 - i)
  )
}
