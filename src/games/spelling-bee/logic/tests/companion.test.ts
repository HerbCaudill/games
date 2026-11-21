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
      completeLengths: [true, false, false],
      rows: [
        {
          letter: "m",
          complete: false,
          cells: [
            { found: 1, total: 1 },
            { found: 0, total: 1 },
            { found: 0, total: 1 },
          ],
        },
        {
          letter: "t",
          complete: false,
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

  it("marks a row complete once every word starting with its letter is found", () => {
    const grid = wordGrid(answers, ["moat", "mortar", "motor", "tomb"])
    expect(grid.rows.map(row => [row.letter, row.complete])).toEqual([
      ["m", true],
      ["t", false],
    ])
  })

  it("marks a column complete once every word of its length is found", () => {
    const grid = wordGrid(answers, ["moat", "tomb", "mortar", "tomato"])
    expect(grid.completeLengths).toEqual([true, false, true])
  })
})

describe("twoLetterList", () => {
  it("counts words by their first two letters, grouped by first letter", () => {
    expect(twoLetterList(answers, found)).toEqual([
      { letter: "m", complete: false, prefixes: [{ prefix: "mo", found: 1, total: 3 }] },
      { letter: "t", complete: false, prefixes: [{ prefix: "to", found: 1, total: 3 }] },
    ])
  })

  it("marks a letter's group complete once every word starting with it is found", () => {
    const list = twoLetterList(answers, ["moat", "mortar", "motor", "tomb"])
    expect(list.map(group => [group.letter, group.complete])).toEqual([
      ["m", true],
      ["t", false],
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
