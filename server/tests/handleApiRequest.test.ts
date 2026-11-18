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
})

/** Fake NYT: account endpoints accept only signed-in tokens; puzzle feeds answer anyone, with no puzzle. */
function nyt(
  /** The fake's setup. */
  {
    validTokens,
    spellingBee = false,
  }: {
    /** Tokens that belong to a signed-in NYT account. */
    validTokens: string[]
    /** Whether to serve a Spelling Bee for 2026-01-05 and its player stats. */
    spellingBee?: boolean
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
    if (!url.includes("/svc/games/state/")) return new Response("", { status: 404 })
    return validTokens.includes(token)
      ? Response.json({ error: "puzzle_id is required" }, { status: 400 })
      : Response.json({ error: "forbidden" }, { status: 403 })
  })
}
