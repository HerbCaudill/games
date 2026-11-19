import { beforeEach, expect, it } from "vitest"
import { puzzleKey } from "@/lib/puzzleKey"
import { writeStored } from "@/lib/writeStored"
import type { ConnectionsPuzzle, CrosswordPuzzle, SpellingBeePuzzle } from "@/types"
import { readHomeTile } from "../readHomeTile"

beforeEach(() => localStorage.clear())

it("shows nothing for a puzzle that has not been started", () => {
  expect(readHomeTile("connections", DATE)).toEqual({ status: "new" })
})

it("keeps a time of zero apart from no time at all", () => {
  writeStored("status:letter-boxed:" + DATE, "solved")
  writeStored("progress:letter-boxed:" + DATE, { words: ["ADG", "GJBEHKCFIL"] })
  writeStored("time:letter-boxed:" + DATE, 0)

  expect(readHomeTile("letter-boxed", DATE)).toEqual({ status: "solved", elapsed: 0 })
})

it("shows how much of the crossword is filled", () => {
  writeStored(puzzleKey("crossword", DATE), crossword)
  writeStored("status:crossword:" + DATE, "started")
  writeStored("progress:crossword:" + DATE, { entries: ["A", "", "", ""], elapsed: 75 })

  expect(readHomeTile("crossword", DATE)).toEqual({
    status: "started",
    elapsed: 75,
    progress: { game: "crossword", filled: 1 / 3 },
  })
})

it("shows the Spelling Bee rank reached", () => {
  writeStored(puzzleKey("spelling-bee", DATE), spellingBee)
  writeStored("status:spelling-bee:" + DATE, "started")
  writeStored("progress:spelling-bee:" + DATE, ["abcd"])
  writeStored("time:spelling-bee:" + DATE, 300)

  expect(readHomeTile("spelling-bee", DATE)).toEqual({
    status: "started",
    elapsed: 300,
    progress: { game: "spelling-bee", rank: 3, name: "Good" },
  })
})

it("shows the Connections groups found, by color, and the mistakes made", () => {
  writeStored(puzzleKey("connections", DATE), connections)
  writeStored("status:connections:" + DATE, "started")
  writeStored("progress:connections:" + DATE, { solved: [2, 0], mistakes: 1, guesses: [] })

  expect(readHomeTile("connections", DATE).progress).toEqual({
    game: "connections",
    levels: [3, 1],
    mistakes: 1,
  })
})

it("reads the time spent on Pips from its progress", () => {
  writeStored("status:pips:" + DATE, "started")
  writeStored("progress:pips:" + DATE, { placements: [], elapsed: 60 })

  expect(readHomeTile("pips", DATE)).toEqual({ status: "started", elapsed: 60 })
})

it("leaves out progress when the puzzle is not saved on this device", () => {
  writeStored("status:spelling-bee:" + DATE, "started")
  writeStored("progress:spelling-bee:" + DATE, ["abcd"])

  expect(readHomeTile("spelling-bee", DATE).progress).toBeUndefined()
})

// CONSTANTS

const DATE = "2026-11-18"

const square = { answer: "A", altAnswers: [], circled: false, shaded: false }

const crossword: CrosswordPuzzle = {
  id: 1,
  date: DATE,
  constructors: [],
  editor: "",
  width: 2,
  height: 2,
  cells: [square, square, null, square],
  clues: [],
}

// "abcd" scores 1 and the pangram 14, so finding "abcd" is 1 of 15 points: Good, the fourth rank.
const spellingBee: SpellingBeePuzzle = {
  id: 1,
  date: DATE,
  editor: "",
  center: "a",
  outer: ["b", "c", "d", "e", "f", "g"],
  answers: ["abcd", "abcdefg"],
  pangrams: ["abcdefg"],
}

const connections: ConnectionsPuzzle = {
  id: 1,
  date: DATE,
  editor: "",
  layout: [],
  groups: [0, 1, 2, 3].map(i => ({ title: `G${i}`, words: [], level: [1, 0, 3, 2][i] })),
}
