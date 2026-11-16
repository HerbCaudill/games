import type { CrosswordPuzzle } from "@/types"

/** Whether an entry counts as correct for a square. */
export function isCorrect(
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** Square index. */
  cell: number,
  /** What the solver entered. */
  entry: string,
) {
  const square = puzzle.cells[cell]
  if (!square || !entry) return false
  return entry === square.answer || square.altAnswers.includes(entry)
}
