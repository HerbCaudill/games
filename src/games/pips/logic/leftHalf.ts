import type { Domino } from "@/types"

/** Which half of a domino starts on the left in the tray: the smaller number. */
export function leftHalf(
  /** The domino's pip counts. */
  [first, second]: Domino,
) {
  return second < first ? 1 : 0
}
