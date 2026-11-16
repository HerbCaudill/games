import type { Direction } from "@/types"

/** A crossword in progress. */
export type CrosswordState = {
  /** What the solver typed in each square, uppercase; empty for none. */
  entries: string[]
  /** Check and reveal marks for each square. */
  marks: (Mark | null)[]
  /** The selected square. */
  cursor: number
  /** The direction being typed. */
  direction: Direction
}

/** A mark left by checking or revealing. */
export type Mark = "wrong" | "revealed"

/** How much to check, reveal or clear. */
export type Scope = "square" | "word" | "puzzle"
