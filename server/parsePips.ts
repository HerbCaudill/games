import type { Cell, Domino, PipsBoard, PipsPuzzle, PipsRegionType } from "../src/types.ts"

/** Convert the NYT Pips feed into a puzzle. */
export function parsePips(
  /** The parsed JSON response. */
  raw: RawPips,
): PipsPuzzle {
  return {
    date: raw.printDate,
    editor: raw.editor ?? "",
    boards: {
      easy: parseBoard(raw.easy),
      medium: parseBoard(raw.medium),
      hard: parseBoard(raw.hard),
    },
  }
}

/** Convert one difficulty's board. */
function parseBoard(
  /** The raw board. */
  board: RawBoard,
): PipsBoard {
  return {
    id: board.id,
    constructors: board.constructors ?? "",
    dominoes: board.dominoes,
    regions: board.regions.map(region => ({
      cells: region.indices,
      type: region.type,
      ...(region.target === undefined ? {} : { target: region.target }),
    })),
    solution: board.solution,
  }
}

// TYPES

/** The parts of the NYT Pips feed this app reads. */
export type RawPips = {
  printDate: string
  editor?: string
  easy: RawBoard
  medium: RawBoard
  hard: RawBoard
}

/** A raw Pips board. */
type RawBoard = {
  id: number
  constructors?: string
  dominoes: Domino[]
  regions: { indices: Cell[]; type: PipsRegionType; target?: number }[]
  solution: [Cell, Cell][]
}
