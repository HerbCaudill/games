import { describe, expect, it } from "vitest"
import { parseConnections } from "../parseConnections.ts"
import { parseCrossword } from "../parseCrossword.ts"
import { parseLetterBoxed } from "../parseLetterBoxed.ts"
import { parsePips, type RawPips } from "../parsePips.ts"
import { parseSpellingBee } from "../parseSpellingBee.ts"

describe("parseCrossword", () => {
  const raw = {
    id: 7,
    publicationDate: "2026-01-02",
    constructors: ["Ada Lovelace"],
    editor: "Ed Itor",
    body: [
      {
        dimensions: { width: 3, height: 2 },
        cells: [
          { answer: "C", clues: [0, 2], label: "1", type: 1 },
          { answer: "AT", clues: [0, 3], label: "2", type: 2, moreAnswers: { valid: ["A"] } },
          {},
          { answer: "O", clues: [1, 2], label: "3", type: 3 },
          { answer: "X", clues: [1, 3], type: 1 },
          {},
        ],
        clues: [
          { cells: [0, 1], direction: "Across", label: "1", text: [{ plain: "Feline" }] },
          { cells: [3, 4], direction: "Across", label: "3", text: [{ plain: "Ox" }] },
          {
            cells: [0, 3],
            direction: "Down",
            label: "1",
            text: [{ plain: "Italic", formatted: "<i>Italic</i>" }],
          },
          { cells: [1, 4], direction: "Down", label: "2", text: [{ plain: "Ax" }] },
        ],
      },
    ],
  }

  it("keeps grid dimensions, metadata and black squares", () => {
    const puzzle = parseCrossword(raw)
    expect(puzzle).toMatchObject({ id: 7, date: "2026-01-02", width: 3, height: 2 })
    expect(puzzle.constructors).toEqual(["Ada Lovelace"])
    expect(puzzle.cells[2]).toBeNull()
  })

  it("reads rebus answers, alternates, circles and shading", () => {
    const { cells } = parseCrossword(raw)
    expect(cells[1]).toEqual({
      answer: "AT",
      altAnswers: ["A"],
      label: "2",
      circled: true,
      shaded: false,
    })
    expect(cells[3]?.shaded).toBe(true)
  })

  it("keeps only simple formatting tags in clue HTML", () => {
    const tricky = structuredClone(raw)
    tricky.body[0].clues[0].text = [
      { plain: "x", formatted: '<i class="a">Fine</i><script>bad()</script><img src=x onerror=y>' },
    ]
    expect(parseCrossword(tricky).clues[0].html).toBe("<i>Fine</i>bad()")
  })

  it("reads clues with directions and formatted text", () => {
    const { clues } = parseCrossword(raw)
    expect(clues.map(c => `${c.label}${c.direction[0]}`)).toEqual(["1a", "3a", "1d", "2d"])
    expect(clues[2]).toMatchObject({ text: "Italic", html: "<i>Italic</i>", cells: [0, 3] })
    expect(clues[0].html).toBeUndefined()
  })
})

describe("parsePips", () => {
  it("renames regions and keeps all three boards", () => {
    const board = {
      id: 1,
      constructors: "Someone",
      dominoes: [[1, 2]],
      regions: [
        { indices: [[0, 0]], type: "sum", target: 1 },
        { indices: [[0, 1]], type: "empty" },
      ],
      solution: [
        [
          [0, 0],
          [0, 1],
        ],
      ],
    } as RawPips["easy"]
    const puzzle = parsePips({
      printDate: "2026-01-02",
      editor: "Ed",
      easy: board,
      medium: board,
      hard: board,
    })
    expect(puzzle.date).toBe("2026-01-02")
    expect(puzzle.boards.hard.regions).toEqual([
      { cells: [[0, 0]], type: "sum", target: 1 },
      { cells: [[0, 1]], type: "empty" },
    ])
    expect(puzzle.boards.easy.solution).toEqual([
      [
        [0, 0],
        [0, 1],
      ],
    ])
  })
})

describe("parseConnections", () => {
  it("builds groups by level and the starting layout from card positions", () => {
    const categories = ["A", "B", "C", "D"].map((title, level) => ({
      title,
      cards: [0, 1, 2, 3].map(i => ({ content: `${title}${i}`, position: 15 - (level * 4 + i) })),
    }))
    const puzzle = parseConnections({ id: 3, print_date: "2026-01-02", editor: "Ed", categories })
    expect(puzzle.groups[1]).toEqual({ title: "B", words: ["B0", "B1", "B2", "B3"], level: 1 })
    expect(puzzle.layout[0]).toBe("D3")
    expect(puzzle.layout[15]).toBe("A0")
  })
})

describe("parseSpellingBee", () => {
  const active = {
    puzzles: [
      {
        id: 9,
        center_letter: "t",
        outer_letters: "abhmor",
        pangrams: ["bathroom"],
        answers: ["moat", "bathroom"],
        print_date: "2026-01-02",
        editor: "Ed",
      },
    ],
  }

  it("finds the puzzle for a date and merges pangrams into answers", () => {
    expect(parseSpellingBee(active, "2026-01-02")).toEqual({
      id: 9,
      date: "2026-01-02",
      editor: "Ed",
      center: "t",
      outer: ["a", "b", "h", "m", "o", "r"],
      answers: ["moat", "bathroom"],
      pangrams: ["bathroom"],
    })
  })

  it("returns undefined for a date outside the active window", () => {
    expect(parseSpellingBee(active, "2020-01-01")).toBeUndefined()
  })
})

describe("parseLetterBoxed", () => {
  const data = {
    id: 5,
    printDate: "2026-01-02",
    editor: "Ed",
    sides: ["ABC", "DEF", "GHI", "JKL"],
    par: 5,
    ourSolution: ["ADG", "GJ"],
    dictionary: ["ADG", "GJ"],
  }
  const html = `<html><script>window.gameData = ${JSON.stringify(data)}</script></html>`

  it("reads the puzzle embedded in the game page", () => {
    expect(parseLetterBoxed(html)).toEqual({
      id: 5,
      date: "2026-01-02",
      editor: "Ed",
      sides: ["ABC", "DEF", "GHI", "JKL"],
      par: 5,
      solution: ["ADG", "GJ"],
      dictionary: ["ADG", "GJ"],
    })
  })

  it("returns undefined when the page has no game data", () => {
    expect(parseLetterBoxed("<html></html>")).toBeUndefined()
  })
})
