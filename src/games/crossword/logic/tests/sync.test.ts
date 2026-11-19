import { describe, expect, it } from "vitest"
import type { CrosswordPuzzle, CrosswordSync } from "@/types"
import { initialState } from "../initialState"
import { mergeSync } from "../mergeSync"
import { recordChange } from "../recordChange"
import { setAutocheck } from "../setAutocheck"
import { toSync } from "../toSync"
import { typeEntry } from "../typeEntry"
import type { CrosswordProgress } from "../types"

describe("recordChange", () => {
  const start: CrosswordProgress = { ...initialState(puzzle), elapsed: 30 }
  const now = new Date("2026-01-02T09:00:00Z")

  it("stamps a change to the entries, but not a move of the cursor", () => {
    const typed = recordChange(start, typeEntry(start, puzzle, "C"), puzzle, now)
    expect(typed.updated).toBe(now.getTime() / 1000)
    expect(typed.elapsed).toBe(30)
    const moved = recordChange(
      typed,
      { ...typed, cursor: 2 },
      puzzle,
      new Date("2026-01-02T10:00:00Z"),
    )
    expect(moved.updated).toBe(typed.updated)
  })

  it("records the first solve with the time on the clock", () => {
    const almost = { ...start, entries: ["C", "A", ""], cursor: 2 }
    const solved = recordChange(almost, typeEntry(almost, puzzle, "T"), puzzle, now)
    expect(solved.firstSolve?.seconds).toBe(30)
    expect(new Date(solved.firstSolve!.date).getTime()).toBe(now.getTime())
    // Clearing a square and refilling it later doesn't move the solve.
    const later = new Date("2026-01-03T09:00:00Z")
    const again = recordChange(
      { ...solved, elapsed: 90 },
      typeEntry(solved, puzzle, "T"),
      puzzle,
      later,
    )
    expect(again.firstSolve).toEqual(solved.firstSolve)
  })
})

describe("usedAid", () => {
  it("is set by turning autocheck on, and stays set after turning it off", () => {
    const on = setAutocheck(initialState(puzzle), puzzle, true)
    expect(on.usedAid).toBe(true)
    expect(setAutocheck(on, puzzle, false).usedAid).toBe(true)
  })
})

describe("toSync", () => {
  it("shares the grid, clock and solve, once a square is filled", () => {
    const progress: CrosswordProgress = {
      ...initialState(puzzle),
      entries: ["C", "", ""],
      elapsed: 12,
      updated: 1767340800,
    }
    expect(toSync(progress)).toEqual({
      entries: ["C", "", ""],
      marks: [null, null, null],
      elapsed: 12,
      autocheck: false,
      usedAid: false,
      updated: 1767340800,
    })
    expect(toSync({ ...initialState(puzzle), elapsed: 5 })).toBeUndefined()
  })
})

describe("mergeSync", () => {
  const here: CrosswordProgress = {
    ...initialState(puzzle),
    entries: ["C", "", ""],
    cursor: 1,
    elapsed: 40,
    updated: 1000,
  }
  const remote: CrosswordSync = {
    entries: ["C", "A", ""],
    marks: [null, null, null],
    elapsed: 60,
    autocheck: false,
    usedAid: false,
    updated: 2000,
  }

  it("takes NYT's grid when it changed more recently, keeping the cursor here", () => {
    expect(mergeSync(here, remote)).toMatchObject({
      entries: ["C", "A", ""],
      cursor: 1,
      elapsed: 60,
      updated: 2000,
    })
  })

  it("keeps this grid when it changed more recently, with the longer clock", () => {
    expect(mergeSync({ ...here, updated: 3000 }, remote)).toMatchObject({
      entries: ["C", "", ""],
      elapsed: 60,
      updated: 3000,
    })
  })

  it("never takes an empty grid over a filled one", () => {
    const empty = { ...remote, entries: ["", "", ""], updated: 5000 }
    expect(mergeSync(here, empty).entries).toEqual(["C", "", ""])
  })

  it("takes the fuller grid when this device's progress predates syncing", () => {
    const legacy = { ...here, entries: ["C", "A", "T"], updated: undefined }
    expect(mergeSync(legacy, remote).entries).toEqual(["C", "A", "T"])
    expect(mergeSync({ ...here, updated: undefined }, remote).entries).toEqual(["C", "A", ""])
  })

  it("keeps squares changed here since the last sync on top of NYT's grid", () => {
    const base: CrosswordProgress = { ...initialState(puzzle), elapsed: 0 }
    const typed = { ...base, entries: ["", "", "T"], cursor: 2, elapsed: 5, updated: 3000 }
    expect(mergeSync(typed, remote, base)).toMatchObject({
      entries: ["C", "A", "T"],
      cursor: 2,
      elapsed: 60,
      updated: 3000,
    })
  })

  it("lets a square typed or cleared here since the last sync win over NYT's", () => {
    const base = { ...here, entries: ["C", "", ""] }
    const changed = { ...base, entries: ["", "B", ""], updated: 1500 }
    expect(mergeSync(changed, remote, base).entries).toEqual(["", "B", ""])
  })

  it("keeps help and the first solve from either side", () => {
    const firstSolve = { seconds: 50, date: "2026-01-02T09:00:00Z" }
    const merged = mergeSync({ ...here, updated: 3000 }, { ...remote, usedAid: true, firstSolve })
    expect(merged).toMatchObject({ usedAid: true, firstSolve })
  })
})

/** A three-square puzzle reading CAT. */
const puzzle: CrosswordPuzzle = {
  id: 1,
  date: "2026-01-02",
  constructors: [],
  editor: "",
  width: 3,
  height: 1,
  cells: ["C", "A", "T"].map(answer => ({ answer, altAnswers: [], circled: false, shaded: false })),
  clues: [{ id: 0, direction: "across", label: "1", text: "Test", cells: [0, 1, 2], related: [] }],
}
