/* Puzzle shapes shared by the API server and the client. The server turns each NYT feed into one of these. */

/** The games this client plays, in menu order. */
export type GameId = "crossword" | "pips" | "spelling-bee" | "connections" | "letter-boxed"

/** A daily crossword. */
export type CrosswordPuzzle = {
  /** NYT puzzle ID. */
  id: number
  /** Print date as YYYY-MM-DD. */
  date: string
  /** Optional puzzle title, mostly on Sundays. */
  title?: string
  /** Constructor names. */
  constructors: string[]
  /** Editor name. */
  editor: string
  /** Grid width in cells. */
  width: number
  /** Grid height in cells. */
  height: number
  /** Cells in row-major order; `null` is a black square. */
  cells: (CrosswordCell | null)[]
  /** Clues, across first, then down, each in grid order. */
  clues: CrosswordClue[]
}

/** A playable crossword square. */
export type CrosswordCell = {
  /** The expected answer; more than one letter for a rebus. */
  answer: string
  /** Other answers that count as correct. */
  altAnswers: string[]
  /** The number printed in the corner, if any. */
  label?: string
  /** Whether the square has a circle. */
  circled: boolean
  /** Whether the square is shaded. */
  shaded: boolean
}

/** A crossword clue. */
export type CrosswordClue = {
  /** Index into the puzzle's clue list. */
  id: number
  /** Which way the answer runs. */
  direction: Direction
  /** The clue number. */
  label: string
  /** Plain clue text. */
  text: string
  /** Clue text with inline formatting such as italics, when present. */
  html?: string
  /** Cell indexes covered by the answer, in reading order. */
  cells: number[]
  /** IDs of clues this one refers to or is referred to by, such as the theme answers a revealer names. */
  related: number[]
}

/** A crossword direction. */
export type Direction = "across" | "down"

/** The three daily Pips boards. */
export type PipsPuzzle = {
  /** Print date as YYYY-MM-DD. */
  date: string
  /** Editor name. */
  editor: string
  /** One board per difficulty. */
  boards: Record<PipsDifficulty, PipsBoard>
}

/** A Pips difficulty level. */
export type PipsDifficulty = "easy" | "medium" | "hard"

/** One Pips board. */
export type PipsBoard = {
  /** NYT puzzle ID. */
  id: number
  /** Constructor name. */
  constructors: string
  /** The dominoes to place, as pip counts for each half. */
  dominoes: Domino[]
  /** Constraint regions; together they cover every board cell. */
  regions: PipsRegion[]
  /** The published placement, one cell pair per domino in domino order. */
  solution: [Cell, Cell][]
}

/** A domino's two pip counts. */
export type Domino = [number, number]

/** A grid position as [row, column]. */
export type Cell = [number, number]

/** A group of cells and the rule its pips must meet. */
export type PipsRegion = {
  /** Cells in the region. */
  cells: Cell[]
  /** The rule. */
  type: PipsRegionType
  /** The number the rule compares against, for sum, less and greater. */
  target?: number
}

/** A Pips region rule. */
export type PipsRegionType = "sum" | "equals" | "unequal" | "less" | "greater" | "empty"

/** A daily Spelling Bee. */
export type SpellingBeePuzzle = {
  /** NYT puzzle ID. */
  id: number
  /** Print date as YYYY-MM-DD. */
  date: string
  /** Editor name. */
  editor: string
  /** The required letter, lowercase. */
  center: string
  /** The six other letters, lowercase. */
  outer: string[]
  /** Every accepted word, lowercase. */
  answers: string[]
  /** Words that use all seven letters. */
  pangrams: string[]
}

/** AI-written clues for a Spelling Bee's answers. */
export type SpellingBeeHints = {
  /** Print date as YYYY-MM-DD. */
  date: string
  /** A clue for each answer, keyed by the lowercase word. */
  hints: Record<string, string>
}

/** How other players are doing on a Spelling Bee. */
export type SpellingBeeStats = {
  /** How many people have played it. */
  players: number
  /** The share of players, from 0 to 1, who found each answer, keyed by the lowercase word. */
  found: Record<string, number>
}

/** A daily Connections puzzle. */
export type ConnectionsPuzzle = {
  /** NYT puzzle ID. */
  id: number
  /** Print date as YYYY-MM-DD. */
  date: string
  /** Editor name. */
  editor: string
  /** The four groups, easiest first. */
  groups: ConnectionsGroup[]
  /** All sixteen words in their starting order. */
  layout: string[]
}

/** One Connections group. */
export type ConnectionsGroup = {
  /** What the words share. */
  title: string
  /** The four words. */
  words: string[]
  /** Difficulty from 0 (easiest) to 3. */
  level: number
}

/** A daily Letter Boxed puzzle. */
export type LetterBoxedPuzzle = {
  /** NYT puzzle ID. */
  id: number
  /** Print date as YYYY-MM-DD. */
  date: string
  /** Editor name. */
  editor: string
  /** Four sides of three uppercase letters, clockwise from the top. */
  sides: string[]
  /** The target number of words. */
  par: number
  /** The editor's own solution. */
  solution: string[]
  /** Every accepted word, uppercase. */
  dictionary: string[]
}

/** Maps each game to its puzzle shape. */
export type PuzzleFor = {
  crossword: CrosswordPuzzle
  pips: PipsPuzzle
  "spelling-bee": SpellingBeePuzzle
  connections: ConnectionsPuzzle
  "letter-boxed": LetterBoxedPuzzle
}
