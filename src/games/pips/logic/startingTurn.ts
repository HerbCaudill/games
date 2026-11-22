import { leftHalf } from "./leftHalf"
import type { Domino } from "@/types"

/** The quarter turns a domino starts with, so that it lies flat with its smaller number on the left. */
export function startingTurn(
  /** The domino's pip counts. */
  domino: Domino,
) {
  return leftHalf(domino) === 1 ? 2 : 0
}
