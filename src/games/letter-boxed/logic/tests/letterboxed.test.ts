import { describe, expect, it } from "vitest"
import type { LetterBoxedPuzzle } from "@/types"
import { addLetter } from "../addLetter"
import { initialState } from "../initialState"
import { isSolved } from "../isSolved"
import { remainingLetters } from "../remainingLetters"
import { removeLetter } from "../removeLetter"
import { restoreChain } from "../restoreChain"
import { submitWord } from "../submitWord"
import { twoWordSolutions } from "../twoWordSolutions"

/** Type a word one letter at a time. */
function type(word: string, state = initialState()) {
  return [...word].reduce((s, letter) => addLetter(s, letter, puzzle), state)
}

const puzzle: LetterBoxedPuzzle = {
  id: 1,
  date: "2026-01-02",
  editor: "Ed",
  sides: ["ABC", "DEF", "GHI", "JKL"],
  par: 3,
  solution: [],
  dictionary: ["ADG", "GJBEHKCFIL", "GJA", "ADGJBEHKCFIL"],
}

describe("addLetter", () => {
  it("adds letters from other sides", () => {
    expect(type("ADG").current).toBe("ADG")
  })

  it("ignores a letter from the same side as the one before", () => {
    expect(type("AB").current).toBe("A")
  })

  it("ignores letters that are not on the board", () => {
    expect(type("AZ").current).toBe("A")
  })
})

describe("submitWord", () => {
  it("accepts a dictionary word and starts the next word with its last letter", () => {
    const { state, error } = submitWord(type("ADG"), puzzle)
    expect(error).toBeUndefined()
    expect(state).toMatchObject({ words: ["ADG"], current: "G" })
  })

  it("records each chain in the history, keeping only the longest version of it", () => {
    const first = submitWord(type("ADG"), puzzle)
    expect(first.state.history).toEqual([["ADG"]])
    const second = submitWord(type("JA", first.state), puzzle)
    expect(second.state.history).toEqual([["ADG", "GJA"]])
  })

  it("ends the chain when every letter has been used, in any number of words", () => {
    const first = submitWord(type("ADG"), puzzle).state
    const second = submitWord(type("JA", first), puzzle).state
    const { state, solution } = submitWord(type("DGJBEHKCFIL", second), puzzle)
    expect(solution).toBe(true)
    expect(state).toMatchObject({ words: ["ADG", "GJA", "ADGJBEHKCFIL"], current: "" })
  })

  it("does not end the chain before every letter is used", () => {
    expect(submitWord(type("ADG"), puzzle).solution).toBe(false)
  })

  it("rejects short words and words outside the dictionary", () => {
    expect(submitWord(type("AD"), puzzle).error).toBe("Too short")
    expect(submitWord(type("ADI"), puzzle).error).toBe("Not a word")
  })
})

describe("removeLetter", () => {
  it("removes the last typed letter", () => {
    expect(removeLetter(type("ADG")).current).toBe("AD")
  })

  it("reopens the previous word when only its carried-over letter is left", () => {
    const { state } = submitWord(type("ADG"), puzzle)
    expect(removeLetter(state)).toMatchObject({ words: [], current: "ADG" })
  })

  it("clears a finished chain", () => {
    const { state } = submitWord(type("ADGJBEHKCFIL"), puzzle)
    expect(removeLetter(state)).toMatchObject({ words: [], current: "" })
  })
})

describe("addLetter after a finished chain", () => {
  it("starts a new chain with the letter and keeps the history", () => {
    const { state } = submitWord(type("ADGJBEHKCFIL"), puzzle)
    const next = addLetter(state, "g", puzzle)
    expect(next).toEqual({ words: [], current: "G", history: [["ADGJBEHKCFIL"]] })
  })
})

describe("restoreChain", () => {
  it("picks up an unfinished chain where it left off", () => {
    expect(restoreChain(initialState(), ["ADG", "GJA"], puzzle)).toMatchObject({
      words: ["ADG", "GJA"],
      current: "A",
    })
  })

  it("shows a finished chain as finished", () => {
    expect(restoreChain(initialState(), ["ADG", "GJBEHKCFIL"], puzzle)).toMatchObject({
      words: ["ADG", "GJBEHKCFIL"],
      current: "",
    })
  })
})

describe("remainingLetters", () => {
  it("lists the board letters a chain has not used, in board order", () => {
    expect(remainingLetters(["ADG", "GJA"], puzzle)).toBe("BCEFHIKL")
  })
})

describe("twoWordSolutions", () => {
  it("finds every two-word chain in the dictionary that uses all the letters, official one first", () => {
    const solutions = twoWordSolutions({ ...puzzle, solution: ["GJA", "ADGJBEHKCFIL"] })
    expect(solutions).toEqual([
      ["GJA", "ADGJBEHKCFIL"],
      ["ADG", "GJBEHKCFIL"],
    ])
  })

  it("puts shorter solutions first", () => {
    const solutions = twoWordSolutions({ ...puzzle, solution: [] })
    expect(solutions).toEqual([
      ["ADG", "GJBEHKCFIL"],
      ["GJA", "ADGJBEHKCFIL"],
    ])
  })
})

describe("isSolved", () => {
  it("is solved once two submitted words have used every letter, even after starting over", () => {
    const first = submitWord(type("ADG"), puzzle).state
    expect(isSolved(first, puzzle)).toBe(false)
    const second = submitWord(type("JBEHKCFIL", first), puzzle).state
    expect(isSolved(second, puzzle)).toBe(true)
    expect(isSolved(addLetter(second, "A", puzzle), puzzle)).toBe(true)
  })

  it("requires exactly two words even when every letter has been used", () => {
    const oneWord = submitWord(type("ADGJBEHKCFIL"), puzzle).state
    expect(isSolved(oneWord, puzzle)).toBe(false)
    const threeWords = { words: [], current: "", history: [["ADG", "GJA", "ADGJBEHKCFIL"]] }
    expect(isSolved(threeWords, puzzle)).toBe(false)
  })
})
