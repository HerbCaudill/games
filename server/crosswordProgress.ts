import { z } from "zod"
import { nytToday } from "../src/lib/nytToday.ts"
import type { CrosswordMark, CrosswordPuzzle, CrosswordSync } from "../src/types.ts"
import type { NytGameData, ProgressFormat } from "./types.ts"

/** Crossword progress in NYT's state API: letters by square, marks, the clock and the first solve. */
export const crosswordProgress: ProgressFormat<"crossword"> = {
  nytGame: "crossword_daily",
  schema: z.object({
    entries: z.array(z.string()),
    marks: z.array(z.enum(["wrong", "correct", "revealed"]).nullable()),
    elapsed: z.number().int().nonnegative(),
    autocheck: z.boolean(),
    usedAid: z.boolean(),
    firstSolve: z.object({ seconds: z.number().int().nonnegative(), date: z.string() }).optional(),
    updated: z.number().int().positive(),
  }),
  fromNyt: ({ game_data, timestamp }, puzzle) => {
    const data = game_data as Partial<CrosswordData>
    const sets = Object.fromEntries(
      MARK_LISTS.map(list => [list, new Set(data[list] ?? [])]),
    ) as Record<MarkList, Set<number>>
    const firstSolve =
      data.firstSolve === undefined || !data.firstSolveDate
        ? undefined
        : { seconds: data.firstSolve, date: data.firstSolveDate }
    return {
      entries: puzzle.cells.map((cell, i) => (cell && data.cells?.[i]) || ""),
      marks: puzzle.cells.map((_, i) => markFor(sets, i)),
      elapsed: data.playTimeSeconds ?? 0,
      autocheck: data.isAutocheckEnabled ?? false,
      usedAid:
        data.firstSolveUsedAid ??
        (!!data.isAutocheckEnabled || sets.checked.size > 0 || sets.revealed.size > 0),
      ...(firstSolve && { firstSolve }),
      updated: timestamp,
    }
  },
  toNyt: (progress, puzzle, previous) => {
    const prior = (previous ?? {}) as Partial<CrosswordData>
    const squares = puzzle.cells.flatMap((cell, i) => (cell ? [i] : []))
    const filled = squares.filter(i => progress.entries[i])
    // NYT lists marked squares in the order they were marked, so earlier ones keep their places.
    const marked = (mark: CrosswordMark, list: MarkList) =>
      keepOrder(
        prior[list] ?? [],
        squares.filter(i => progress.marks[i] === mark),
      )
    const revealed = marked("revealed", "revealed")
    // NYT keeps a square in `checked` once it has been marked wrong, even after it's corrected.
    const checked = [...new Set([...(prior.checked ?? []), ...marked("wrong", "checked")])]
    return {
      isTimerReset: false,
      modified: [],
      puzzleInfoSeen: false,
      ...previous,
      cells: Object.fromEntries(filled.map(i => [i, progress.entries[i]])),
      checked,
      confirmed: marked("correct", "confirmed"),
      revealed,
      // The app has no pencil, so a penciled letter stays penciled only until it's replaced.
      penciled: (prior.penciled ?? []).filter(
        i => prior.cells?.[i] && prior.cells[i] === progress.entries[i],
      ),
      completionFraction: filled.length / squares.length,
      isAutocheckEnabled: progress.autocheck,
      playTimeSeconds: progress.elapsed,
      ...(prior.firstSolve === undefined &&
        progress.firstSolve &&
        solveRecord(progress, puzzle, revealed.length > 0)),
    } satisfies Partial<CrosswordData> as NytGameData
  },
  updated: progress => progress.updated,
}

/** What NYT records about a first solve, including the star it earns. */
function solveRecord(
  /** The progress. */
  { firstSolve, usedAid }: CrosswordSync,
  /** The puzzle. */
  puzzle: CrosswordPuzzle,
  /** Whether any square was revealed. */
  revealed: boolean,
): Partial<CrosswordData> {
  const { seconds, date } = firstSolve!
  const aided = usedAid || revealed
  // NYT's records give gold to an unaided solve by the end of the next day in New York, and blue after that.
  const late = daysBetween(puzzle.date, nytToday(new Date(date))) > 1
  return {
    firstSolve: seconds,
    firstSolveDate: date,
    firstSolveRevealedOrReset: revealed,
    firstSolveUsedAid: aided,
    star: revealed ? null : aided || late ? "blue" : "gold",
  }
}

/** The current squares, with those already in an earlier list first, in their earlier order. */
function keepOrder(
  /** The earlier list. */
  earlier: number[],
  /** The squares that belong in the list now, in grid order. */
  current: number[],
) {
  const now = new Set(current)
  const kept = earlier.filter(i => now.has(i))
  const old = new Set(kept)
  return [...kept, ...current.filter(i => !old.has(i))]
}

/** The mark a square shows, from NYT's lists. */
function markFor(
  /** NYT's marked squares, by list. */
  sets: Record<MarkList, Set<number>>,
  /** The square. */
  i: number,
): CrosswordMark | null {
  if (sets.revealed.has(i)) return "revealed"
  if (sets.confirmed.has(i)) return "correct"
  if (sets.checked.has(i)) return "wrong"
  return null
}

/** Whole days from one YYYY-MM-DD date to another. */
function daysBetween(
  /** The earlier date. */
  from: string,
  /** The later date. */
  to: string,
) {
  return (Date.parse(to) - Date.parse(from)) / DAY_MS
}

// CONSTANTS

/** NYT's lists of marked squares. */
const MARK_LISTS = ["checked", "confirmed", "revealed"] as const

/** Milliseconds in a day. */
const DAY_MS = 24 * 60 * 60 * 1000

// TYPES

/** One of NYT's lists of marked squares. */
type MarkList = (typeof MARK_LISTS)[number]

/** NYT's crossword record. */
type CrosswordData = {
  /** Letters by square index, for filled squares only. */
  cells: Record<number, string>
  /** Squares ever marked wrong. */
  checked: number[]
  /** Squares marked correct. */
  confirmed: number[]
  /** Squares revealed. */
  revealed: number[]
  /** Squares holding penciled letters. */
  penciled: number[]
  /** Squares NYT tracks as changed; the app keeps whatever NYT had. */
  modified: number[]
  /** The share of squares filled, from 0 to 1. */
  completionFraction: number
  /** Whether autocheck is on. */
  isAutocheckEnabled: boolean
  /** Whether the timer was reset. */
  isTimerReset: boolean
  /** Whether the solver opened the puzzle notes. */
  puzzleInfoSeen: boolean
  /** Seconds spent. */
  playTimeSeconds: number
  /** Seconds on the clock at the first solve. */
  firstSolve: number
  /** The moment of the first solve, ISO 8601 with the solver's offset. */
  firstSolveDate: string
  /** Whether any square was revealed or the puzzle reset before the first solve. */
  firstSolveRevealedOrReset: boolean
  /** Whether the solver had help before the first solve. */
  firstSolveUsedAid: boolean
  /** The star earned: gold unaided on time, blue otherwise, none after a reveal. */
  star: "gold" | "blue" | null
}
