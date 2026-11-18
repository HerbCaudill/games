import { describe, expect, it } from "vitest"
import { swapIntoTopRow } from "../swapIntoTopRow"
import type { ConnectionsPuzzle } from "@/types"
import { initialState } from "../initialState"
import { submitGuess } from "../submitGuess"
import { remainingWords } from "../remainingWords"
import { isOver } from "../isOver"
import { MAX_MISTAKES } from "../constants"

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

describe("swapIntoTopRow", () => {
  it("swaps the selected words with the top row's others, leaving every other word in place", () => {
    const words = "a b c d e f g h i j k l".split(" ")
    expect(swapIntoTopRow(words, ["b", "e", "h", "k"])).toEqual(
      "b e h k a f g c i j d l".split(" "),
    )
  })
})
