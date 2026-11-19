import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { GAMES } from "@/constants"
import type { ConnectionsPuzzle } from "@/types"
import { GameScreen } from "../GameScreen"

beforeEach(() => localStorage.clear())

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it("asks for a new NYT token when NYT rejects the saved one, then loads the puzzle with it", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ error: "An NYT token is required." }, { status: 401 }))
    .mockResolvedValueOnce(Response.json(puzzle))
  vi.stubGlobal("fetch", fetch)
  render(<WithToken />)

  expect(await screen.findByText("An NYT token is required.")).toBeVisible()
  fireEvent.change(screen.getByLabelText("NYT token"), { target: { value: " abc123 " } })
  fireEvent.click(screen.getByRole("button", { name: "Save" }))

  expect(await screen.findByText("APPLE")).toBeVisible()
  const [url, init] = fetch.mock.lastCall!
  expect(url).toBe("/api/connections/2026-01-03")
  expect(new Headers(init.headers).get("x-nyt-token")).toBe("abc123")
})

/** The Connections screen, holding its token as the app does. */
function WithToken() {
  const [token, setToken] = useState("expired")
  return (
    <GameScreen game={connections} date="2026-01-03" isToday token={token} onToken={setToken} />
  )
}

// CONSTANTS

/** The Connections game. */
const connections = GAMES.find(game => game.id === "connections")!

/** A small made-up Connections puzzle. */
const puzzle: ConnectionsPuzzle = {
  id: 1,
  date: "2026-01-03",
  editor: "Test Editor",
  groups: [
    { title: "FRUIT", words: ["APPLE", "PEAR", "PLUM", "FIG"], level: 0 },
    { title: "COLORS", words: ["RED", "BLUE", "GREEN", "PINK"], level: 1 },
    { title: "PETS", words: ["CAT", "DOG", "FISH", "BIRD"], level: 2 },
    { title: "TOOLS", words: ["SAW", "AXE", "AWL", "FILE"], level: 3 },
  ],
  layout: "APPLE RED CAT SAW PEAR BLUE DOG AXE PLUM GREEN FISH AWL FIG PINK BIRD FILE".split(" "),
}
