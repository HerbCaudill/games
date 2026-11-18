import { describe, expect, it } from "vitest"
import type { ConnectionsPuzzle, CrosswordPuzzle, SpellingBeePuzzle } from "../../src/types.ts"
import { connectionsProgress } from "../connectionsProgress.ts"
import { crosswordProgress } from "../crosswordProgress.ts"
import { spellingBeeProgress } from "../spellingBeeProgress.ts"
import type { NytGameState } from "../types.ts"

describe("spellingBeeProgress", () => {
  const puzzle = { id: 77, date: "2026-01-05" } as SpellingBeePuzzle

  it("reads the words found and the rank", () => {
    const state = nytState({ answers: ["moat", "bathroom"], isRevealed: false, rank: "Good" })
    expect(spellingBeeProgress.fromNyt(state, puzzle)).toEqual({
      words: ["moat", "bathroom"],
      rank: "Good",
    })
  })

  it("writes the words and rank, keeping what NYT already had", () => {
    const previous = { answers: ["moat"], isRevealed: false, rank: "Beginner" }
    expect(
      spellingBeeProgress.toNyt({ words: ["moat", "torah"], rank: "Nice" }, puzzle, previous),
    ).toEqual({ answers: ["moat", "torah"], isRevealed: false, rank: "Nice" })
  })

  it("starts a new record when NYT has none", () => {
    expect(spellingBeeProgress.toNyt({ words: ["moat"], rank: "Good Start" }, puzzle)).toEqual({
      answers: ["moat"],
      isRevealed: false,
      rank: "Good Start",
    })
  })
})

describe("connectionsProgress", () => {
  // NYT numbers the cards by their starting position, which is the order of the layout.
  const puzzle: ConnectionsPuzzle = {
    id: 5,
    date: "2026-01-05",
    editor: "",
    groups: [
      { title: "Fish", words: ["BASS", "CARP", "PIKE", "SOLE"], level: 0 },
      { title: "Trees", words: ["ASH", "ELM", "FIR", "OAK"], level: 1 },
      { title: "Colors", words: ["RED", "TAN", "JADE", "RUST"], level: 2 },
      { title: "Notes", words: ["DO", "RE", "MI", "FA"], level: 3 },
    ],
    layout: "ASH BASS RED DO ELM CARP TAN RE FIR PIKE JADE MI OAK SOLE RUST FA".split(" "),
  }
  const card = (word: string) => ({
    level: puzzle.groups.findIndex(g => g.words.includes(word)),
    position: puzzle.layout.indexOf(word),
  })

  it("writes guesses as NYT's cards, with the solved groups and mistakes", () => {
    const guesses = [
      ["PIKE", "BASS", "SOLE", "CARP"],
      ["ASH", "ELM", "FIR", "RED"],
    ]
    expect(connectionsProgress.toNyt({ guesses }, puzzle)).toEqual({
      guesses: [
        { cards: ["BASS", "CARP", "PIKE", "SOLE"].map(card), correct: true },
        { cards: ["ASH", "RED", "ELM", "FIR"].map(card), correct: false },
      ],
      isPlayingArchive: false,
      mistakes: 1,
      puzzleComplete: false,
      puzzleWon: false,
      solvedCategories: [
        { cards: ["BASS", "CARP", "PIKE", "SOLE"].map(card), level: 0, orderSolved: 1 },
      ],
    })
  })

  it("marks the game won once every group is solved", () => {
    const guesses = puzzle.groups.map(g => g.words)
    expect(connectionsProgress.toNyt({ guesses }, puzzle)).toMatchObject({
      puzzleComplete: true,
      puzzleWon: true,
      mistakes: 0,
    })
  })

  it("marks the game over after four mistakes", () => {
    const wrong = ["ASH", "BASS", "RED", "DO"]
    const guesses = [wrong, ["ELM", "CARP", "TAN", "RE"], ["FIR", "PIKE", "JADE", "MI"], wrong]
    expect(connectionsProgress.toNyt({ guesses }, puzzle)).toMatchObject({
      puzzleComplete: true,
      puzzleWon: false,
      mistakes: 4,
    })
  })

  it("reads NYT's cards back as words, round trip", () => {
    const guesses = [
      ["BASS", "CARP", "PIKE", "SOLE"],
      ["ASH", "RED", "ELM", "FIR"],
    ]
    const gameData = connectionsProgress.toNyt({ guesses }, puzzle)
    expect(connectionsProgress.fromNyt(nytState(gameData), puzzle)).toEqual({ guesses })
  })
})

describe("crosswordProgress", () => {
  // A 2×2 grid with one black square: cells 0, 1 and 3 are playable.
  const puzzle = {
    id: 9,
    date: "2026-01-05",
    cells: [{ answer: "A" }, { answer: "B" }, null, { answer: "CD" }],
  } as CrosswordPuzzle

  const solved = {
    entries: ["A", "B", "", "CD"],
    marks: [null, null, null, null],
    elapsed: 300,
    autocheck: false,
    usedAid: false,
    firstSolve: { seconds: 300, date: "2026-01-05T09:00:00+01:00" },
    updated: 1767600000,
  }

  it("writes letters by square, with the clock and a gold star for an unaided solve that day", () => {
    expect(crosswordProgress.toNyt(solved, puzzle)).toEqual({
      cells: { 0: "A", 1: "B", 3: "CD" },
      checked: [],
      completionFraction: 1,
      confirmed: [],
      firstSolve: 300,
      firstSolveDate: "2026-01-05T09:00:00+01:00",
      firstSolveRevealedOrReset: false,
      firstSolveUsedAid: false,
      isAutocheckEnabled: false,
      isTimerReset: false,
      modified: [],
      penciled: [],
      playTimeSeconds: 300,
      puzzleInfoSeen: false,
      revealed: [],
      star: "gold",
    })
  })

  it("leaves out the solve until there is one", () => {
    const started = { ...solved, entries: ["A", "", "", ""], firstSolve: undefined, elapsed: 20 }
    const gameData = crosswordProgress.toNyt(started, puzzle)
    expect(gameData).toMatchObject({ cells: { 0: "A" }, playTimeSeconds: 20 })
    expect(gameData.completionFraction).toBeCloseTo(1 / 3)
    expect(gameData).not.toHaveProperty("firstSolve")
    expect(gameData).not.toHaveProperty("star")
  })

  it("gives a blue star for a solve with help, or one more than a day late", () => {
    expect(crosswordProgress.toNyt({ ...solved, usedAid: true }, puzzle).star).toBe("blue")
    const late = { ...solved, firstSolve: { seconds: 300, date: "2026-01-07T09:00:00+01:00" } }
    expect(crosswordProgress.toNyt(late, puzzle).star).toBe("blue")
    // NYT still gives gold the morning after, New York time.
    const nextMorning = { ...solved, firstSolve: { seconds: 1, date: "2026-01-06T23:00:00Z" } }
    expect(crosswordProgress.toNyt(nextMorning, puzzle).star).toBe("gold")
  })

  it("writes autocheck marks the way NYT keeps them", () => {
    const checked = {
      ...solved,
      entries: ["A", "X", "", ""],
      marks: ["correct", "wrong", null, null] as const,
      autocheck: true,
      usedAid: true,
      firstSolve: undefined,
    }
    expect(
      crosswordProgress.toNyt({ ...checked, marks: [...checked.marks] }, puzzle),
    ).toMatchObject({ confirmed: [0], checked: [1], revealed: [], isAutocheckEnabled: true })
  })

  it("never changes the first solve NYT already recorded", () => {
    const previous = crosswordProgress.toNyt(solved, puzzle)
    const replay = { ...solved, firstSolve: { seconds: 999, date: "2026-02-01T09:00:00Z" } }
    expect(crosswordProgress.toNyt(replay, puzzle, previous)).toMatchObject({
      firstSolve: 300,
      star: "gold",
    })
  })

  it("reads an NYT record back unchanged, round trip", () => {
    const gameData = {
      ...crosswordProgress.toNyt(solved, puzzle),
      // NYT keeps cells it once marked wrong in `checked` after they're corrected.
      checked: [1],
      confirmed: [0, 1, 3],
      isAutocheckEnabled: true,
      firstSolveUsedAid: true,
      star: "blue",
      puzzleInfoSeen: true,
    }
    const progress = crosswordProgress.fromNyt(nytState(gameData, 1767600000), puzzle)
    expect(progress).toEqual({
      ...solved,
      marks: ["correct", "correct", null, "correct"],
      autocheck: true,
      usedAid: true,
    })
    expect(crosswordProgress.toNyt(progress, puzzle, gameData)).toEqual(gameData)
  })
})

/** An NYT state record holding some game data. */
function nytState(
  /** The game data. */
  gameData: Record<string, unknown>,
  /** When it was saved, in Unix seconds. */
  timestamp = 1767600000,
): NytGameState {
  return { game_data: gameData, puzzle_id: "1", print_date: "2026-01-05", timestamp }
}
