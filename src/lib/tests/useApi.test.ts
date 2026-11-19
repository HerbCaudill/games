import { renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { useApi } from "../useApi"

beforeEach(() => localStorage.clear())
afterEach(() => vi.unstubAllGlobals())

it("waits for a path, then loads and keeps a local copy", async () => {
  const fetch = vi.fn(async () => Response.json({ hello: "world" }))
  vi.stubGlobal("fetch", fetch)
  const { result, rerender } = renderHook(
    ({ path }: { path?: string }) => useApi<{ hello: string }>(path, "token", { storageKey: "k" }),
    { initialProps: {} },
  )
  expect(result.current.status).toBe("idle")
  expect(fetch).not.toHaveBeenCalled()
  rerender({ path: "/api/thing/2026-01-01" })
  await waitFor(() =>
    expect(result.current).toMatchObject({ status: "ready", data: { hello: "world" } }),
  )

  // A later visit uses the local copy without asking the server again.
  const again = renderHook(() => useApi("/api/thing/2026-01-01", "token", { storageKey: "k" }))
  expect(again.result.current).toMatchObject({ status: "ready", data: { hello: "world" } })
  expect(fetch).toHaveBeenCalledTimes(1)
})

it("asks for a token when the server answers 401, and can try again", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ error: "An NYT token is required." }, { status: 401 }))
    .mockResolvedValueOnce(Response.json({ ok: true }))
  vi.stubGlobal("fetch", fetch)
  const { result } = renderHook(() => useApi("/api/thing/2026-01-01", ""))
  await waitFor(() => expect(result.current.status).toBe("needs-token"))
  result.current.retry()
  await waitFor(() => expect(result.current.status).toBe("ready"))
})

it("shares one request among everything asking for the same thing at once", async () => {
  const fetch = vi.fn(async () => Response.json({ hello: "world" }))
  vi.stubGlobal("fetch", fetch)
  const first = renderHook(() => useApi("/api/thing/2026-01-01", "token", { storageKey: "k" }))
  const second = renderHook(() => useApi("/api/thing/2026-01-01", "token", { storageKey: "k" }))
  await waitFor(() => expect(first.result.current.status).toBe("ready"))
  await waitFor(() => expect(second.result.current.status).toBe("ready"))
  expect(fetch).toHaveBeenCalledTimes(1)
})
