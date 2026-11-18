import { describe, expect, it } from "vitest"
import { hintGroups } from "../hintGroups"
import { twoLetterList } from "../twoLetterList"
import { wordGrid } from "../wordGrid"

const answers = ["moat", "mortar", "motor", "tomb", "tomato", "torah"]
const found = ["moat", "tomb"]

describe("wordGrid", () => {
  it("counts found and total words by first letter and length", () => {
    expect(wordGrid(answers, found)).toEqual({
      lengths: [4, 5, 6],
      rows: [
        {
          letter: "m",
          cells: [
            { found: 1, total: 1 },
            { found: 0, total: 1 },
            { found: 0, total: 1 },
          ],
        },
        {
          letter: "t",
          cells: [
            { found: 1, total: 1 },
            { found: 0, total: 1 },
            { found: 0, total: 1 },
          ],
        },
      ],
    })
  })

  it("leaves a cell empty when no word has that letter and length", () => {
    expect(wordGrid(["moat", "tomato"], []).rows[0].cells).toEqual([
      { found: 0, total: 1 },
      undefined,
    ])
  })
})

describe("twoLetterList", () => {
  it("counts words by their first two letters, grouped by first letter", () => {
    expect(twoLetterList(answers, found)).toEqual([
      { letter: "m", prefixes: [{ prefix: "mo", found: 1, total: 3 }] },
      { letter: "t", prefixes: [{ prefix: "to", found: 1, total: 3 }] },
    ])
  })
})

describe("hintGroups", () => {
  it("groups clues by first two letters, shortest words first, marking found ones", () => {
    const hints = Object.fromEntries(answers.map(w => [w, `clue ${w}`]))
    expect(hintGroups(hints, found)[0]).toEqual({
      prefix: "mo",
      found: 1,
      hints: [
        { word: "moat", clue: "clue moat", found: true },
        { word: "motor", clue: "clue motor", found: false },
        { word: "mortar", clue: "clue mortar", found: false },
      ],
    })
  })
})
