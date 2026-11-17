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
})

/** Fake NYT: account endpoints accept only signed-in tokens; puzzle feeds answer anyone, with no puzzle. */
function nyt(
  /** Tokens that belong to a signed-in NYT account. */
  { validTokens }: { validTokens: string[] },
) {
  return vi.fn(async (url: string, init: RequestInit) => {
    const token = new Headers(init.headers).get("nyt-s") ?? ""
    if (!url.includes("/svc/games/state/")) return new Response("", { status: 404 })
    return validTokens.includes(token)
      ? Response.json({ error: "puzzle_id is required" }, { status: 400 })
      : Response.json({ error: "forbidden" }, { status: 403 })
  })
}
