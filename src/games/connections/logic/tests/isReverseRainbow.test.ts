import { expect, it } from "vitest"
import type { ConnectionsPuzzle } from "@/types"
import { isReverseRainbow } from "../isReverseRainbow"

it("is a reverse rainbow when the groups are found from purple down to yellow", () => {
  expect(isReverseRainbow([3, 2, 1, 0], puzzle)).toBe(true)
})

it("goes by each group's level, not its place in the puzzle", () => {
  expect(isReverseRainbow([0, 1, 2, 3], shuffled)).toBe(true)
})

it("is not a reverse rainbow in any other order, or before every group is found", () => {
  expect(isReverseRainbow([0, 1, 2, 3], puzzle)).toBe(false)
  expect(isReverseRainbow([3, 2, 0, 1], puzzle)).toBe(false)
  expect(isReverseRainbow([3, 2, 1], puzzle)).toBe(false)
})

// CONSTANTS

/** A puzzle whose groups are listed from yellow (level 0) to purple (level 3). */
const puzzle: ConnectionsPuzzle = {
  id: 1,
  date: "2026-01-02",
  editor: "Ed",
  groups: ["A", "B", "C", "D"].map((title, level) => ({
    title,
    words: [1, 2, 3, 4].map(n => `${title}${n}`),
    level,
  })),
  layout: [],
}

/** The same puzzle with its groups listed from purple to yellow. */
const shuffled: ConnectionsPuzzle = { ...puzzle, groups: [...puzzle.groups].reverse() }
