import { describe, expect, it } from "vitest"
import type { SpellingBeePuzzle } from "@/types"
import { checkGuess } from "../checkGuess"
import { mergeSync } from "../mergeSync"
import { rankFor } from "../rankFor"
import { scoreWord } from "../scoreWord"
import { toSync } from "../toSync"
import { totalScore } from "../totalScore"

const puzzle: SpellingBeePuzzle = {
  id: 1,
  date: "2026-01-02",
  editor: "Ed",
  center: "t",
  outer: ["a", "b", "h", "m", "o", "r"],
  answers: ["moat", "tomb", "torah", "bathroom", "throb"],
  pangrams: ["bathroom"],
}

describe("scoreWord", () => {
  it("gives one point for four letters, a point per letter beyond, and seven extra for pangrams", () => {
    expect(scoreWord("moat", puzzle)).toBe(1)
    expect(scoreWord("torah", puzzle)).toBe(5)
    expect(scoreWord("bathroom", puzzle)).toBe(15)
  })
})

describe("totalScore", () => {
  it("adds up the found words", () => {
    expect(totalScore(["moat", "torah"], puzzle)).toBe(6)
  })
})

describe("checkGuess", () => {
  it("accepts an answer and reports its score", () => {
    expect(checkGuess("TORAH", puzzle, [])).toEqual({
      ok: true,
      word: "torah",
      score: 5,
      pangram: false,
    })
  })

  it("rejects guesses with the reason shown to the player", () => {
    expect(checkGuess("mat", puzzle, [])).toEqual({ ok: false, message: "Too short" })
    expect(checkGuess("boom", puzzle, [])).toEqual({ ok: false, message: "Missing center letter" })
    expect(checkGuess("taxi", puzzle, [])).toEqual({ ok: false, message: "Bad letters" })
    expect(checkGuess("moth", puzzle, [])).toEqual({ ok: false, message: "Not in word list" })
  })

  it("marks a word already found as a repeat, so it isn't treated as a mistake", () => {
    expect(checkGuess("moat", puzzle, ["moat"])).toEqual({
      ok: false,
      message: "Already found",
      repeat: true,
    })
  })
})

describe("rankFor", () => {
  it("ranks by the share of the maximum score", () => {
    // Maximum score is 1 + 1 + 5 + 15 + 5 = 27.
    expect(rankFor(0, puzzle).name).toBe("Beginner")
    expect(rankFor(14, puzzle).name).toBe("Amazing")
    expect(rankFor(19, puzzle).name).toBe("Genius")
    expect(rankFor(27, puzzle).name).toBe("Queen Bee")
  })

  it("says how many points the next rank needs", () => {
    expect(rankFor(0, puzzle).next).toEqual({ name: "Good Start", score: 1 })
    expect(rankFor(27, puzzle).next).toBeUndefined()
  })
})

describe("toSync", () => {
  it("shares the words found and the rank they reach", () => {
    expect(toSync(["moat", "torah"], puzzle)).toEqual({ words: ["moat", "torah"], rank: "Solid" })
  })

  it("has nothing to share before the first word", () => {
    expect(toSync([], puzzle)).toBeUndefined()
  })
})

describe("mergeSync", () => {
  it("adds words found elsewhere after the ones found here", () => {
    const remote = { words: ["torah", "moat", "bathroom"], rank: "Genius" }
    expect(mergeSync(["moat", "tomb"], remote, puzzle)).toEqual([
      "moat",
      "tomb",
      "torah",
      "bathroom",
    ])
  })

  it("ignores words the puzzle doesn't accept", () => {
    expect(mergeSync(["moat"], { words: ["moot"], rank: "Beginner" }, puzzle)).toEqual(["moat"])
  })
})
