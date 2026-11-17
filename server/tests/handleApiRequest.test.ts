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

  it("reports a token NYT rejects as unauthorized", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 403 })))
    const response = await handleApiRequest("/api/pips/2026-01-02", "expired")
    expect(response).toEqual({ status: 401, body: { error: "NYT rejected the token." } })
  })
})
