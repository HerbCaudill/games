import type { CrosswordClue, CrosswordPuzzle, Direction } from "@/types"

/** Start with an empty grid, at the first square, going across. */
export function initialState(
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
): CrosswordState {
  return {
    entries: puzzle.cells.map(() => ""),
    marks: puzzle.cells.map(() => null),
    cursor: puzzle.cells.findIndex(Boolean),
    direction: "across",
  }
}

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

/** Move to a square; selecting the current square again turns to the other direction. */
export function selectCell(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** Square index. */
  cell: number,
): CrosswordState {
  if (!puzzle.cells[cell]) return state
  const other = flip(state.direction)
  const turn =
    cell === state.cursor
      ? Boolean(clueAt(puzzle, cell, other))
      : !clueAt(puzzle, cell, state.direction)
  return { ...state, cursor: cell, direction: turn ? other : state.direction }
}

/** Turn to the other direction, if the current square has an answer that way. */
export function toggleDirection(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
): CrosswordState {
  const other = flip(state.direction)
  return clueAt(puzzle, state.cursor, other) ? { ...state, direction: other } : state
}

/** Type into the current square, then move on the way a solver expects. */
export function typeEntry(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** A letter, or several letters for a rebus square. */
  text: string,
): CrosswordState {
  const { cursor } = state
  const clue = clueAt(puzzle, cursor, state.direction)
  const wasFull = clue ? clue.cells.every(c => state.entries[c]) : true
  const locked = state.marks[cursor] === "revealed"
  const entries = locked ? state.entries : replaceAt(state.entries, cursor, text.toUpperCase())
  const marks = locked ? state.marks : replaceAt(state.marks, cursor, null)
  const typed = { ...state, entries, marks }
  if (!clue) return typed

  const position = clue.cells.indexOf(cursor)
  // Correcting a finished answer: step through it rather than jumping away.
  if (wasFull) return { ...typed, cursor: clue.cells[position + 1] ?? cursor }
  const after = clue.cells.slice(position + 1).find(c => !entries[c])
  const before = clue.cells.slice(0, position).find(c => !entries[c])
  if (after !== undefined || before !== undefined) return { ...typed, cursor: after ?? before! }
  return nextClue(typed, puzzle, 1)
}

/** Delete the current letter, or step back and delete the previous one. */
export function backspace(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
): CrosswordState {
  const clear = (s: CrosswordState, cell: number): CrosswordState =>
    s.marks[cell] === "revealed"
      ? s
      : { ...s, entries: replaceAt(s.entries, cell, ""), marks: replaceAt(s.marks, cell, null) }
  if (state.entries[state.cursor]) return clear(state, state.cursor)
  const clue = clueAt(puzzle, state.cursor, state.direction)
  const previous = clue?.cells[clue.cells.indexOf(state.cursor) - 1]
  if (previous === undefined) return state
  return clear({ ...state, cursor: previous }, previous)
}

/** Handle an arrow key: turn to its direction first, then move, skipping black squares. */
export function arrow(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** Row step. */
  dr: number,
  /** Column step. */
  dc: number,
): CrosswordState {
  const direction: Direction = dr === 0 ? "across" : "down"
  if (direction !== state.direction && clueAt(puzzle, state.cursor, direction))
    return { ...state, direction }
  let row = Math.floor(state.cursor / puzzle.width) + dr
  let col = (state.cursor % puzzle.width) + dc
  while (row >= 0 && row < puzzle.height && col >= 0 && col < puzzle.width) {
    const cell = row * puzzle.width + col
    if (puzzle.cells[cell]) return { ...state, cursor: cell, direction }
    row += dr
    col += dc
  }
  return state
}

/** Go to the next or previous answer with an empty square, landing on its first empty square. */
export function nextClue(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** 1 for the next answer, -1 for the previous one. */
  step: 1 | -1,
): CrosswordState {
  const { clues } = puzzle
  const current = clueAt(puzzle, state.cursor, state.direction)
  const start = current ? clues.indexOf(current) : 0
  const ordered = clues.map(
    (_, i) => clues[(start + step * (i + 1) + clues.length * 2) % clues.length],
  )
  const target = ordered.find(c => c.cells.some(cell => !state.entries[cell])) ?? ordered[0]
  const cursor = target.cells.find(cell => !state.entries[cell]) ?? target.cells[0]
  return { ...state, cursor, direction: target.direction }
}

/** Mark wrong letters in a square, the current answer, or the whole puzzle. */
export function check(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** What to check. */
  scope: Scope,
): CrosswordState {
  const marks = [...state.marks]
  for (const cell of scopeCells(state, puzzle, scope)) {
    const entry = state.entries[cell]
    if (entry && !isCorrect(puzzle, cell, entry)) marks[cell] = "wrong"
  }
  return { ...state, marks }
}

/** Fill in the answers in a square, the current answer, or the whole puzzle. */
export function reveal(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** What to reveal. */
  scope: Scope,
): CrosswordState {
  const entries = [...state.entries]
  const marks = [...state.marks]
  for (const cell of scopeCells(state, puzzle, scope)) {
    if (isCorrect(puzzle, cell, entries[cell])) continue
    entries[cell] = puzzle.cells[cell]!.answer
    marks[cell] = "revealed"
  }
  return { ...state, entries, marks }
}

/** Empty a square, the current answer, or the whole puzzle, keeping revealed squares. */
export function clear(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** What to clear. */
  scope: Scope,
): CrosswordState {
  const cells = new Set(scopeCells(state, puzzle, scope))
  const keep = (i: number) => !cells.has(i) || state.marks[i] === "revealed"
  return {
    ...state,
    entries: state.entries.map((e, i) => (keep(i) ? e : "")),
    marks: state.marks.map((m, i) => (keep(i) ? m : null)),
  }
}

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

/** Whether every square is correct. */
export function isSolved(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
) {
  return puzzle.cells.every((square, i) => !square || isCorrect(puzzle, i, state.entries[i]))
}

/** Squares covered by a check, reveal or clear. */
function scopeCells(
  /** Current state. */
  state: CrosswordState,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** The scope. */
  scope: Scope,
): number[] {
  if (scope === "square") return [state.cursor]
  if (scope === "word") return clueAt(puzzle, state.cursor, state.direction)?.cells ?? []
  return puzzle.cells.flatMap((square, i) => (square ? [i] : []))
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

/** The other direction. */
function flip(
  /** A direction. */
  direction: Direction,
): Direction {
  return direction === "across" ? "down" : "across"
}

/** Copy an array with one item replaced. */
function replaceAt<T>(
  /** The array. */
  items: T[],
  /** Index to replace. */
  index: number,
  /** New value. */
  value: T,
): T[] {
  return items.map((item, i) => (i === index ? value : item))
}

// CONSTANTS

/** Clue lookups, cached per puzzle object. */
const lookups = new WeakMap<CrosswordPuzzle, Record<Direction, Map<number, CrosswordClue>>>()

// TYPES

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
