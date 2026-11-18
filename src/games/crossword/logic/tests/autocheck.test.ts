import { describe, expect, it } from "vitest"
import type { CrosswordPuzzle } from "@/types"
import { backspace } from "../backspace"
import { initialState } from "../initialState"
import { isSolved } from "../isSolved"
import { setAutocheck } from "../setAutocheck"
import { typeEntry } from "../typeEntry"

describe("autocheck", () => {
  it("checks existing entries when enabled, leaving empty cells unmarked", () => {
    const state = { ...initialState(puzzle), entries: ["CAT", "X", ""] }
    expect(setAutocheck(state, puzzle, true).marks).toEqual(["correct", "wrong", null])
  })

  it("checks each new letter or rebus immediately and accepts alternate answers", () => {
    let state = setAutocheck(initialState(puzzle), puzzle, true)
    state = typeEntry(state, puzzle, "cat")
    expect(state.entries[0]).toBe("CAT")
    expect(state.marks[0]).toBe("correct")
    state = typeEntry(state, puzzle, "X")
    expect(state.marks[1]).toBe("wrong")
    state = typeEntry({ ...state, cursor: 1 }, puzzle, "A")
    expect(state.marks[1]).toBe("correct")
    expect(isSolved(typeEntry(state, puzzle, "T"), puzzle)).toBe(true)

    const alternate = typeEntry(setAutocheck(initialState(puzzle), puzzle, true), puzzle, "C")
    expect(alternate.marks[0]).toBe("correct")
  })

  it("keeps confirmed cells frozen when overwriting or deleting, even after switching off", () => {
    const checked = typeEntry(setAutocheck(initialState(puzzle), puzzle, true), puzzle, "CAT")
    const state = { ...setAutocheck(checked, puzzle, false), cursor: 0 }
    expect(typeEntry(state, puzzle, "X").entries[0]).toBe("CAT")
    expect(backspace(state, puzzle).entries[0]).toBe("CAT")
    expect(backspace({ ...state, cursor: 1 }, puzzle).entries[0]).toBe("CAT")
    expect(typeEntry({ ...state, cursor: 1 }, puzzle, "X").marks[1]).toBeNull()
  })
})

/** A synthetic answer with a rebus square and a short accepted alternative. */
const puzzle: CrosswordPuzzle = {
  id: 1,
  date: "2026-01-02",
  constructors: [],
  editor: "",
  width: 3,
  height: 1,
  cells: ["CAT", "A", "T"].map((answer, i) => ({
    answer,
    altAnswers: i === 0 ? ["C"] : [],
    circled: false,
    shaded: false,
  })),
  clues: [{ id: 0, direction: "across", label: "1", text: "Test", cells: [0, 1, 2], related: [] }],
}
