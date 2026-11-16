import type { CrosswordClue, CrosswordPuzzle, Direction } from "@/types"

/** The clue whose answer covers a square in a direction. */
export function clueAt(
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** Square index. */
  cell: number,
  /** Direction. */
  direction: Direction,
): CrosswordClue | undefined {
  return clueLookup(puzzle)[direction].get(cell)
}

/** Index clues by square and direction, once per puzzle. */
function clueLookup(
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
) {
  let lookup = lookups.get(puzzle)
  if (!lookup) {
    lookup = { across: new Map(), down: new Map() }
    for (const clue of puzzle.clues)
      for (const cell of clue.cells) lookup[clue.direction].set(cell, clue)
    lookups.set(puzzle, lookup)
  }
  return lookup
}

// CONSTANTS

/** Clue lookups, cached per puzzle object. */
const lookups = new WeakMap<CrosswordPuzzle, Record<Direction, Map<number, CrosswordClue>>>()
