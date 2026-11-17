import { describe, expect, it } from "vitest"
import type { CrosswordCell, CrosswordPuzzle } from "@/types"
import { arrow } from "../arrow"
import { backspace } from "../backspace"
import { check } from "../check"
import { clueAt } from "../clueAt"
import { initialState } from "../initialState"
import { isSolved } from "../isSolved"
import { nextClue } from "../nextClue"
import { reveal } from "../reveal"
import { selectCell } from "../selectCell"
import { typeEntry } from "../typeEntry"
import { type CrosswordState } from "../types"

/** Type each character as its own entry. */
function type(text: string, state = initialState(puzzle)) {
  return [...text].reduce((s, letter) => typeEntry(s, puzzle, letter), state)
}

/** A plain square with an answer and optional number. */
function cell(answer: string, label?: string): CrosswordCell {
  return { answer, altAnswers: [], label, circled: false, shaded: false }
}

/*
  A 3x3 grid with one black square in the middle:

    C A T
    O # O
    W E T

  Across: 1 CAT (0,1,2), 4 WET (6,7,8). Down: 1 COW (0,3,6), 2 TOT (2,5,8).
*/
const letters = "CAT O#OWET".replace(" ", "")
const puzzle: CrosswordPuzzle = {
  id: 1,
  date: "2026-01-02",
  constructors: [],
  editor: "",
  width: 3,
  height: 3,
  cells: [...letters].map((l, i) =>
    l === "#" ? null : cell(l, { 0: "1", 2: "2", 6: "4" }[i] as string | undefined),
  ),
  clues: [
    { id: 0, direction: "across", label: "1", text: "Feline", cells: [0, 1, 2] },
    { id: 1, direction: "across", label: "4", text: "Damp", cells: [6, 7, 8] },
    { id: 2, direction: "down", label: "1", text: "Bovine", cells: [0, 3, 6] },
    { id: 3, direction: "down", label: "2", text: "Toddler", cells: [2, 5, 8] },
  ],
}

describe("selectCell", () => {
  it("starts at the first square going across", () => {
    expect(initialState(puzzle)).toMatchObject({ cursor: 0, direction: "across" })
  })

  it("switches direction when the same square is selected again", () => {
    expect(selectCell(initialState(puzzle), puzzle, 0).direction).toBe("down")
  })

  it("switches direction when the square has no answer in the current direction", () => {
    expect(selectCell(initialState(puzzle), puzzle, 3).direction).toBe("down")
  })
})

describe("typeEntry", () => {
  it("fills the square and moves to the next empty square in the answer", () => {
    const state = type("CA")
    expect(state.entries.slice(0, 3)).toEqual(["C", "A", ""])
    expect(state.cursor).toBe(2)
  })

  it("moves to the next unfinished answer after completing one", () => {
    const state = type("CAT")
    expect(clueAt(puzzle, state.cursor, state.direction)?.label).toBe("4")
    expect(state.direction).toBe("across")
  })

  it("skips squares that are already filled", () => {
    const withMiddle = { ...initialState(puzzle), entries: ["", "A", "", "", "", "", "", "", ""] }
    expect(type("C", withMiddle).cursor).toBe(2)
  })

  it("stays in a full answer when overwriting it", () => {
    const full = { ...type("CAT"), cursor: 0, direction: "across" as const }
    expect(type("X", full).cursor).toBe(1)
  })

  it("accepts a multi-letter rebus entry", () => {
    expect(typeEntry(initialState(puzzle), puzzle, "cat").entries[0]).toBe("CAT")
  })
})

describe("backspace", () => {
  it("clears the current square when it has a letter", () => {
    const state: CrosswordState = { ...type("C"), cursor: 0 }
    const after = backspace(state, puzzle)
    expect(after.cursor).toBe(0)
    expect(after.entries[0]).toBe("")
  })

  it("moves back and clears the previous square when the current one is empty", () => {
    const state = backspace(type("CA"), puzzle)
    expect(state.cursor).toBe(1)
    expect(state.entries.slice(0, 3)).toEqual(["C", "", ""])
  })

  it("moves back into the previous answer from the empty first square of an answer", () => {
    const state = backspace(type("CAT"), puzzle)
    expect(state).toMatchObject({ cursor: 2, direction: "across" })
    expect(state.entries.slice(0, 3)).toEqual(["C", "A", ""])
  })

  it("crosses from the first down answer back to the last across answer", () => {
    const state = backspace({ ...initialState(puzzle), direction: "down" }, puzzle)
    expect(state).toMatchObject({ cursor: 8, direction: "across" })
  })
})

describe("arrow", () => {
  it("moves along the current direction, skipping black squares", () => {
    const state = { ...initialState(puzzle), cursor: 1, direction: "down" as const }
    expect(arrow(state, puzzle, 1, 0).cursor).toBe(7)
  })

  it("turns to the arrow's direction before moving", () => {
    const state = arrow(initialState(puzzle), puzzle, 1, 0)
    expect(state).toMatchObject({ cursor: 0, direction: "down" })
  })
})

describe("nextClue", () => {
  it("jumps to the first empty square of the next answer, wrapping from across to down", () => {
    const state = nextClue({ ...initialState(puzzle), cursor: 6 }, puzzle, 1)
    expect(state).toMatchObject({ cursor: 0, direction: "down" })
  })

  it("goes back to the previous answer", () => {
    const state = nextClue(initialState(puzzle), puzzle, -1)
    expect(clueAt(puzzle, state.cursor, state.direction)?.label).toBe("2")
    expect(state.direction).toBe("down")
  })
})

describe("check and reveal", () => {
  it("marks wrong letters in the chosen scope", () => {
    const state = check(type("CUT"), puzzle, "puzzle")
    expect(state.marks.slice(0, 3)).toEqual([null, "wrong", null])
  })

  it("clears a wrong mark when the square is retyped", () => {
    const checked = { ...check(type("CUT"), puzzle, "puzzle"), cursor: 1 }
    expect(type("A", checked).marks[1]).toBeNull()
  })

  it("reveals answers and locks them", () => {
    const state = reveal(initialState(puzzle), puzzle, "square")
    expect(state.entries[0]).toBe("C")
    expect(state.marks[0]).toBe("revealed")
    expect(type("X", state).entries[0]).toBe("C")
  })

  it("is solved when every square is correct", () => {
    expect(isSolved(reveal(initialState(puzzle), puzzle, "puzzle"), puzzle)).toBe(true)
    expect(isSolved(type("CAT"), puzzle)).toBe(false)
  })

  it("accepts alternate answers", () => {
    const rebus = {
      ...puzzle,
      cells: puzzle.cells.map((c, i) =>
        i === 0 ? { ...c!, answer: "CAT", altAnswers: ["C"] } : c,
      ),
    }
    const state = reveal(initialState(rebus), rebus, "puzzle")
    const withAlt = { ...state, entries: state.entries.map((e, i) => (i === 0 ? "C" : e)) }
    expect(isSolved(withAlt, rebus)).toBe(true)
  })
})
