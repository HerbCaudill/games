import { describe, expect, it } from "vitest"
import type { Domino } from "@/types"
import { trayOrder } from "../trayOrder"

describe("trayOrder", () => {
  it("sorts dominoes by their smaller number, then their larger, whichever half is first", () => {
    const dominoes: Domino[] = [
      [6, 1],
      [3, 0],
      [4, 4],
      [0, 6],
      [1, 2],
    ]
    expect(trayOrder(dominoes).map(i => dominoes[i])).toEqual([
      [3, 0],
      [0, 6],
      [1, 2],
      [6, 1],
      [4, 4],
    ])
  })
})
