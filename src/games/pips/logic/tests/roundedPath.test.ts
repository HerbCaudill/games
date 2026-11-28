import { describe, expect, it } from "vitest"
import { outline } from "../outline"
import { roundedPath } from "../roundedPath"

describe("roundedPath", () => {
  it("rounds an inner corner with its own radius, so it can wrap the corner it turns around", () => {
    // Cells (0,0), (1,0) and (1,1): five outer corners and one inner corner.
    const loops = outline(
      [
        [0, 0],
        [1, 0],
        [1, 1],
      ],
      0,
    )
    const radii = [...roundedPath(loops, 10, 2, 3).matchAll(/A(\d+),\d+ 0 0 (\d)/g)].map(
      ([, radius, sweep]) => `${radius}:${sweep}`,
    )
    expect(radii.toSorted()).toEqual(["2:1", "2:1", "2:1", "2:1", "2:1", "3:0"])
  })
})
