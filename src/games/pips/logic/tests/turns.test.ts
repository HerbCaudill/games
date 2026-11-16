import { describe, expect, it } from "vitest"
import { directionOf } from "../directionOf"
import { turnTo } from "../turnTo"

describe("directionOf", () => {
  it("names the direction from a placed domino's first half to its second", () => {
    expect(
      directionOf([
        [2, 2],
        [3, 2],
      ]),
    ).toBe(1)
    expect(
      directionOf([
        [2, 2],
        [2, 1],
      ]),
    ).toBe(2)
  })
})

describe("turnTo", () => {
  it("finds the nearest turn count that faces a direction, so a turn never spins the long way", () => {
    expect(turnTo(0, 1)).toBe(1)
    expect(turnTo(3, 0)).toBe(4)
    expect(turnTo(4, 3)).toBe(3)
    expect(turnTo(5, 1)).toBe(5)
    expect(turnTo(-1, 2)).toBe(-2)
  })
})
