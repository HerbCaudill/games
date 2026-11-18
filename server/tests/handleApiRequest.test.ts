import { afterEach, describe, expect, it, vi } from "vitest"
import { handleApiRequest } from "../handleApiRequest.ts"

describe("handleApiRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("asks for a token instead of calling NYT without one", async () => {
    const fetch = vi.fn()
    vi.stubGlobal("fetch", fetch)
    const response = await handleApiRequest("/api/pips/2026-01-01", undefined)
    expect(response).toEqual({ status: 401, body: { error: "An NYT token is required." } })
    expect(fetch).not.toHaveBeenCalled()
  })

  it("rejects a token NYT doesn't recognize, even though the puzzle feeds are open", async () => {
    vi.stubGlobal("fetch", nyt({ validTokens: [] }))
    const response = await handleApiRequest("/api/pips/2026-01-02", "made-up")
    expect(response).toEqual({ status: 401, body: { error: "NYT rejected the token." } })
  })

  it("serves a token NYT recognizes, checking it only once", async () => {
    const fetch = nyt({ validTokens: ["signed-in"] })
    vi.stubGlobal("fetch", fetch)
    await handleApiRequest("/api/pips/2026-01-03", "signed-in")
    const response = await handleApiRequest("/api/pips/2026-01-04", "signed-in")
    expect(response).toEqual({ status: 404, body: { error: "No pips puzzle for 2026-01-04" } })
    const checks = fetch.mock.calls.filter(([url]) => String(url).includes("/svc/games/state/"))
    expect(checks).toHaveLength(1)
  })

  it("serves AI hints for a Spelling Bee, writing them once per puzzle", async () => {
    vi.stubGlobal("fetch", nyt({ validTokens: ["signed-in"], spellingBee: true }))
    const writeHints = vi.fn(async (answers: string[]) =>
      Object.fromEntries(answers.map(word => [word, `Clue for ${word}`])),
    )
    const path = "/api/spelling-bee-hints/2026-01-05"
    await handleApiRequest(path, "signed-in", { writeHints })
    const response = await handleApiRequest(path, "signed-in", { writeHints })
    expect(response).toEqual({
      status: 200,
      body: { date: "2026-01-05", hints: { moat: "Clue for moat", bathroom: "Clue for bathroom" } },
    })
    expect(writeHints).toHaveBeenCalledTimes(1)
    expect(writeHints).toHaveBeenCalledWith(["moat", "bathroom"], ["bathroom"])
  })

  it("says hints aren't set up when the server has no way to write them", async () => {
    vi.stubGlobal("fetch", nyt({ validTokens: ["signed-in"], spellingBee: true }))
    const response = await handleApiRequest("/api/spelling-bee-hints/2026-01-06", "signed-in")
    expect(response.status).toBe(503)
  })

  it("serves the share of players who found each Spelling Bee word", async () => {
    vi.stubGlobal("fetch", nyt({ validTokens: ["signed-in"], spellingBee: true }))
    const response = await handleApiRequest("/api/spelling-bee-stats/2026-01-05", "signed-in")
    expect(response).toEqual({
      status: 200,
      body: { players: 5000, found: { moat: 0.9, bathroom: 0.25 } },
    })
  })

  it("reads progress from the NYT account, or none when there isn't any", async () => {
    const saved = { spelling_bee: { answers: ["moat"], isRevealed: false, rank: "Good" } }
    vi.stubGlobal("fetch", nyt({ validTokens: ["signed-in"], spellingBee: true, saved }))
    const path = "/api/spelling-bee-progress/2026-01-05"
    expect(await handleApiRequest(path, "signed-in")).toEqual({
      status: 200,
      body: { progress: { words: ["moat"], rank: "Good" } },
    })
    vi.stubGlobal("fetch", nyt({ validTokens: ["signed-in"], spellingBee: true }))
    expect(await handleApiRequest(path, "signed-in")).toEqual({
      status: 200,
      body: { progress: null },
    })
  })

  it("saves progress to the NYT account, keeping NYT's other fields", async () => {
    const saved = { spelling_bee: { answers: ["moat"], isRevealed: false, rank: "Good" } }
    const fetch = nyt({ validTokens: ["signed-in"], spellingBee: true, saved })
    vi.stubGlobal("fetch", fetch)
    const response = await handleApiRequest(
      "/api/spelling-bee-progress/2026-01-05",
      "signed-in",
      {},
      { method: "PUT", body: { words: ["moat", "bathroom"], rank: "Queen Bee" } },
    )
    expect(response).toEqual({ status: 200, body: { saved: true } })
    expect(posts(fetch)).toEqual([
      expect.objectContaining({
        game: "spelling_bee",
        puzzle_id: "77",
        print_date: "2026-01-05",
        user_id: 42,
        game_data: { answers: ["moat", "bathroom"], isRevealed: false, rank: "Queen Bee" },
      }),
    ])
  })

  it("doesn't write to NYT when the progress hasn't changed", async () => {
    const saved = { spelling_bee: { answers: ["moat"], isRevealed: false, rank: "Good" } }
    const fetch = nyt({ validTokens: ["signed-in"], spellingBee: true, saved })
    vi.stubGlobal("fetch", fetch)
    const response = await handleApiRequest(
      "/api/spelling-bee-progress/2026-01-05",
      "signed-in",
      {},
      { method: "PUT", body: { words: ["moat"], rank: "Good" } },
    )
    expect(response).toEqual({ status: 200, body: { saved: false } })
    expect(posts(fetch)).toEqual([])
  })

  it("refuses progress in the wrong shape", async () => {
    vi.stubGlobal("fetch", nyt({ validTokens: ["signed-in"], spellingBee: true }))
    const response = await handleApiRequest(
      "/api/spelling-bee-progress/2026-01-05",
      "signed-in",
      {},
      { method: "PUT", body: { words: "moat" } },
    )
    expect(response.status).toBe(400)
  })

  it("only reads puzzles", async () => {
    vi.stubGlobal("fetch", nyt({ validTokens: ["signed-in"], spellingBee: true }))
    const response = await handleApiRequest(
      "/api/spelling-bee/2026-01-05",
      "signed-in",
      {},
      {
        method: "PUT",
        body: {},
      },
    )
    expect(response.status).toBe(405)
  })
})

/** The game states posted to the fake NYT. */
function posts(
  /** The fake NYT. */
  fetch: ReturnType<typeof nyt>,
) {
  return fetch.mock.calls
    .filter(([, init]) => init?.method === "POST")
    .map(([, init]) => JSON.parse(String(init!.body)))
}

/** Fake NYT: account endpoints accept only signed-in tokens; puzzle feeds answer anyone, with no puzzle. */
function nyt(
  /** The fake's setup. */
  {
    validTokens,
    spellingBee = false,
    saved = {},
  }: {
    /** Tokens that belong to a signed-in NYT account. */
    validTokens: string[]
    /** Whether to serve a Spelling Bee for 2026-01-05 and its player stats. */
    spellingBee?: boolean
    /** Game data saved in the account, by NYT game name. */
    saved?: Record<string, Record<string, unknown>>
  },
) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    const token = new Headers(init?.headers).get("nyt-s") ?? ""
    if (spellingBee && url.endsWith("/svc/spelling-bee/v1/active.json"))
      return Response.json({
        puzzles: [
          {
            id: 77,
            center_letter: "o",
            outer_letters: "abhmrt",
            pangrams: ["bathroom"],
            answers: ["moat"],
            print_date: "2026-01-05",
          },
        ],
      })
    if (spellingBee && url.endsWith("/stats/77.json"))
      return Response.json({
        id: 77,
        answers: { moat: 9000, bathroom: 2500 },
        n: 10000,
        numberOfUsers: 5000,
      })
    if (!url.includes("/svc/games/state")) return new Response("", { status: 404 })
    if (!validTokens.includes(token)) return Response.json({ error: "forbidden" }, { status: 403 })
    if (init?.method === "POST") return Response.json({}, { status: 201 })
    const latests = url.match(/\/svc\/games\/state\/(\w+)\/latests\?puzzle_ids=(\d+)/)
    if (latests) {
      const [, game, id] = latests
      const gameData = saved[game]
      const states = gameData
        ? [{ game_data: gameData, puzzle_id: id, print_date: "2026-01-05", timestamp: 1 }]
        : []
      return Response.json({ states, user_id: 42 })
    }
    return validTokens.includes(token)
      ? Response.json({ error: "puzzle_id is required" }, { status: 400 })
      : Response.json({ error: "forbidden" }, { status: 403 })
  })
}
