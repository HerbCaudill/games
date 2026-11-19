import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { nytToday } from "@/lib/nytToday"
import { App } from "../App"

beforeEach(() => localStorage.clear())

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("App", () => {
  it("shows the game menu at the root", () => {
    render(<App />)
    expect(screen.getByRole("link", { name: /Crossword/ })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Letter Boxed/ })).toBeInTheDocument()
  })

  it("starts writing today's Spelling Bee hints as soon as it loads", async () => {
    const today = nytToday()
    const hints = { date: today, hints: { moat: "Castle ring" } }
    const fetch = vi.fn(async () => Response.json(hints))
    vi.stubGlobal("fetch", fetch)
    localStorage.setItem("nyt-token", JSON.stringify("abc123"))
    render(<App />)

    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem(`hints:spelling-bee:${today}`)!)).toEqual(hints),
    )
    expect(fetch).toHaveBeenCalledWith(`/api/spelling-bee-hints/${today}`, expect.anything())
  })
})
