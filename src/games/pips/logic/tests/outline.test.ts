import { describe, expect, it } from "vitest"
import { outline } from "../outline"

describe("outline", () => {
  it("traces a single cell clockwise, inset on every side", () => {
    expect(outline([[0, 0]], 0.1)).toEqual([
      [
        [0.1, 0.1],
        [0.9, 0.1],
        [0.9, 0.9],
        [0.1, 0.9],
      ],
    ])
  })

  it("traces an L-shaped region as one loop, with the inner corner kept inside", () => {
    // Cells (0,0), (1,0) and (1,1): a column of two with a foot to the right.
    const [loop, ...rest] = outline(
      [
        [0, 0],
        [1, 0],
        [1, 1],
      ],
      0.1,
    )
    expect(rest).toEqual([])
    expect(loop).toHaveLength(6)
    // The inner corner at x=1, y=1 moves away from the empty square above and to its right.
    expect(loop).toContainEqual([0.9, 1.1])
    expect(loop).toContainEqual([1.9, 1.1])
    expect(loop).toContainEqual([0.1, 0.1])
  })

  it("keeps cells that touch only at a corner as separate loops", () => {
    const loops = outline(
      [
        [0, 0],
        [1, 1],
      ],
      0,
    )
    expect(loops).toHaveLength(2)
  })
})
