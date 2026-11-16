import { describe, expect, it } from "vitest"
import type { LetterBoxedPuzzle } from "@/types"
import { addLetter } from "../addLetter"
import { initialState } from "../initialState"
import { isSolved } from "../isSolved"
import { removeLetter } from "../removeLetter"
import { submitWord } from "../submitWord"

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
  dictionary: ["ADG", "GJBEHKCFIL", "GJA"],
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
    expect(state).toEqual({ words: ["ADG"], current: "G" })
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
    expect(removeLetter(state)).toEqual({ words: [], current: "ADG" })
  })
})

describe("isSolved", () => {
  it("is solved once submitted words use every letter", () => {
    const first = submitWord(type("ADG"), puzzle).state
    expect(isSolved(first, puzzle)).toBe(false)
    const second = submitWord(type("JBEHKCFIL", first), puzzle).state
    expect(isSolved(second, puzzle)).toBe(true)
  })
})
