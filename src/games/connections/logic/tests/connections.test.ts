import { describe, expect, it } from "vitest"
import { swapIntoTopRow } from "../swapIntoTopRow"
import type { ConnectionsPuzzle } from "@/types"
import { initialState } from "../initialState"
import { submitGuess } from "../submitGuess"
import { remainingWords } from "../remainingWords"
import { isOver } from "../isOver"
import { MAX_MISTAKES } from "../constants"
import { mergeSync } from "../mergeSync"
import { toSync } from "../toSync"

const puzzle: ConnectionsPuzzle = {
  id: 1,
  date: "2026-01-02",
  editor: "Ed",
  groups: ["A", "B", "C", "D"].map((title, level) => ({
    title,
    words: [1, 2, 3, 4].map(n => `${title}${n}`),
    level,
  })),
  layout: [
    "A1",
    "B1",
    "C1",
    "D1",
    "A2",
    "B2",
    "C2",
    "D2",
    "A3",
    "B3",
    "C3",
    "D3",
    "A4",
    "B4",
    "C4",
    "D4",
  ],
}

describe("submitGuess", () => {
  it("solves a group when all four words match", () => {
    const { state, result } = submitGuess(initialState(puzzle), ["A1", "A2", "A3", "A4"], puzzle)
    expect(result).toBe("correct")
    expect(state.solved).toEqual([0])
    expect(remainingWords(state, puzzle)).not.toContain("A1")
    expect(remainingWords(state, puzzle)).toHaveLength(12)
  })

  it("moves a solved group into the top row, swapping places with the words there", () => {
    const { state } = submitGuess(initialState(puzzle), ["A1", "A2", "A3", "A4"], puzzle)
    expect(remainingWords(state, puzzle)).toEqual("B1 B2 C2 D2 C1 B3 C3 D3 D1 B4 C4 D4".split(" "))
    const next = submitGuess(state, ["B1", "B2", "B3", "B4"], puzzle).state
    expect(remainingWords(next, puzzle).slice(0, 4)).toEqual(["C1", "C2", "C3", "D3"])
  })

  it("flags a guess that is one word away and counts it as a mistake", () => {
    const { state, result } = submitGuess(initialState(puzzle), ["A1", "A2", "A3", "B4"], puzzle)
    expect(result).toBe("one-away")
    expect(state.mistakes).toBe(1)
  })

  it("does not charge for repeating a wrong guess", () => {
    const first = submitGuess(initialState(puzzle), ["A1", "B2", "C3", "D4"], puzzle)
    expect(first.result).toBe("wrong")
    const second = submitGuess(first.state, ["D4", "C3", "B2", "A1"], puzzle)
    expect(second.result).toBe("already-guessed")
    expect(second.state.mistakes).toBe(1)
  })

  it("ends the game after the last allowed mistake", () => {
    let state = initialState(puzzle)
    for (let i = 0; i < MAX_MISTAKES; i++) {
      state = submitGuess(state, ["A1", "B1", "C1", `D${i + 1}`], puzzle).state
    }
    expect(isOver(state, puzzle)).toBe(true)
  })

  it("ends the game when every group is solved", () => {
    const state = [0, 1, 2, 3].reduce(
      (s, level) => submitGuess(s, puzzle.groups[level].words, puzzle).state,
      initialState(puzzle),
    )
    expect(isOver(state, puzzle)).toBe(true)
  })
})

describe("toSync", () => {
  it("shares the guesses, once there are any", () => {
    expect(toSync(initialState(puzzle))).toBeUndefined()
    const { state } = submitGuess(initialState(puzzle), ["A1", "B1", "C1", "D1"], puzzle)
    expect(toSync(state)).toEqual({ guesses: [["A1", "B1", "C1", "D1"]] })
  })
})

describe("mergeSync", () => {
  it("takes NYT's game when it has gone further, replaying its guesses", () => {
    const here = submitGuess(initialState(puzzle), ["A1", "B1", "C1", "D1"], puzzle).state
    const guesses = [
      ["A1", "B1", "C1", "D1"],
      ["B1", "B2", "B3", "B4"],
    ]
    const merged = mergeSync(here, { guesses }, puzzle)
    expect(merged).toMatchObject({ solved: [1], mistakes: 1, guesses })
    expect(remainingWords(merged, puzzle).slice(0, 4)).toEqual(["A2", "A1", "C2", "D2"])
  })

  it("keeps this device's game when it has gone as far or further", () => {
    const here = submitGuess(initialState(puzzle), ["A1", "B1", "C1", "D1"], puzzle).state
    expect(mergeSync(here, { guesses: [["A1", "B1", "C1", "D1"]] }, puzzle)).toBe(here)
    expect(mergeSync(here, { guesses: [] }, puzzle)).toBe(here)
  })
})

describe("swapIntoTopRow", () => {
  it("swaps the selected words with the top row's others, leaving every other word in place", () => {
    const words = "a b c d e f g h i j k l".split(" ")
    expect(swapIntoTopRow(words, ["b", "e", "h", "k"])).toEqual(
      "b e h k a f g c i j d l".split(" "),
    )
  })
})
