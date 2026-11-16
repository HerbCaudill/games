import { beforeEach, expect, it } from "vitest"
import { readGameStatus } from "../readGameStatus"
import { writeStored } from "../writeStored"

beforeEach(() => localStorage.clear())

it("shows an existing Letter Boxed finish with more than two words as in progress", () => {
  writeStored("status:letter-boxed:2026-11-16", "solved")
  writeStored("progress:letter-boxed:2026-11-16", {
    words: ["ADG", "GJA", "ADGJBEHKCFIL"],
    current: "L",
  })
  expect(readGameStatus("letter-boxed", "2026-11-16")).toBe("started")
})

it("keeps two-word Letter Boxed finishes complete", () => {
  writeStored("status:letter-boxed:2026-11-16", "solved")
  writeStored("progress:letter-boxed:2026-11-16", { words: ["ADG", "GJBEHKCFIL"], current: "L" })
  expect(readGameStatus("letter-boxed", "2026-11-16")).toBe("solved")
})
