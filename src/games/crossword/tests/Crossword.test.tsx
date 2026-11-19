import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { CrosswordPuzzle } from "@/types"
import { Crossword } from "../Crossword"

/** Stands in for the app header the puzzle controls go into. */
let toolbar: HTMLElement

beforeEach(() => {
  localStorage.clear()
  HTMLElement.prototype.scrollIntoView = vi.fn()
  toolbar = document.body.appendChild(document.createElement("div"))
})

afterEach(() => {
  cleanup()
  toolbar.remove()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("syncing with NYT", () => {
  it("keeps a letter typed while NYT's progress loads, on top of NYT's grid", async () => {
    vi.useFakeTimers()
    const saved: unknown[] = []
    let answer!: (response: Response) => void
    vi.stubGlobal(
      "fetch",
      vi.fn((_path: string, init?: RequestInit) => {
        if (init?.method !== "PUT") return new Promise<Response>(resolve => (answer = resolve))
        saved.push(JSON.parse(String(init.body)))
        return Promise.resolve(Response.json({ saved: true }))
      }),
    )
    render(<Crossword puzzle={puzzle} token="token" toolbar={toolbar} />)
    await act(() => vi.advanceTimersByTimeAsync(0))
    fireEvent.keyDown(document.body, { key: "X" })
    const remote = {
      entries: ["", "A", "T"],
      marks: [null, null, null],
      elapsed: 90,
      autocheck: false,
      usedAid: false,
      updated: 1767340800,
    }
    await act(async () => answer(Response.json({ progress: remote })))
    expect(screen.getByRole("grid")).toHaveTextContent("XAT")
    expect(saved.at(-1)).toMatchObject({ entries: ["X", "A", "T"] })
  })
})

describe("crossword entry controls", () => {
  it("opens a rebus from the toolbar, saves all its letters and solves with it", () => {
    render(<Crossword puzzle={puzzle} token="" toolbar={toolbar} />)
    fireEvent.click(screen.getByRole("button", { name: "Enter rebus" }))
    for (const key of "cat") fireEvent.keyDown(document.body, { key })
    fireEvent.keyDown(document.body, { key: "Enter" })
    expect(screen.getByRole("grid")).toHaveTextContent("CAT")
    fireEvent.keyDown(document.body, { key: "A" })
    fireEvent.keyDown(document.body, { key: "T" })
    expect(screen.getByText(/Solved in/)).toBeVisible()
  })

  it("cancels a rebus with Escape without changing the saved entry", () => {
    render(<Crossword puzzle={puzzle} token="" toolbar={toolbar} />)
    fireEvent.click(screen.getByRole("button", { name: "Enter rebus" }))
    fireEvent.keyDown(document.body, { key: "X" })
    fireEvent.keyDown(document.body, { key: "Escape" })
    expect(screen.getByRole("grid")).not.toHaveTextContent("X")
  })

  it("opens rebus entry for a long-pressed touch cell", () => {
    vi.useFakeTimers()
    render(<Crossword puzzle={puzzle} token="" toolbar={toolbar} />)
    const cell = screen.getByRole("grid").querySelector("g")!
    const down = new Event("pointerdown", { bubbles: true, cancelable: true })
    Object.assign(down, { pointerType: "touch", clientX: 20, clientY: 20 })
    fireEvent(cell, down)
    act(() => vi.advanceTimersByTime(600))
    expect(screen.getAllByRole("button", { name: "Save rebus" })[0]).toBeVisible()
  })

  it("checks existing entries when toggled on and remembers the setting after reload", () => {
    const view = render(<Crossword puzzle={puzzle} token="" toolbar={toolbar} />)
    fireEvent.keyDown(document.body, { key: "X" })
    fireEvent.click(screen.getByRole("switch", { name: "Autocheck" }))
    expect(screen.getByRole("switch", { name: "Autocheck" })).toBeChecked()
    expect(screen.getByRole("gridcell", { name: /X, wrong/ })).toBeVisible()
    view.unmount()
    render(<Crossword puzzle={puzzle} token="" toolbar={toolbar} />)
    expect(screen.getByRole("switch", { name: "Autocheck" })).toBeChecked()
  })

  it("returns keyboard entry to the grid after using the autocheck switch", () => {
    render(<Crossword puzzle={puzzle} token="" toolbar={toolbar} />)
    const toggle = screen.getByRole("switch", { name: "Autocheck" })
    toggle.focus()
    fireEvent.click(toggle)
    fireEvent.pointerDown(screen.getAllByRole("gridcell")[1])
    fireEvent.keyDown(document.activeElement!, { key: "A" })
    expect(screen.getByRole("gridcell", { name: /Row 1, column 2: A, correct/ })).toBeVisible()
  })
})

/** A short synthetic crossword with one multi-letter square. */
const puzzle: CrosswordPuzzle = {
  id: 2,
  date: "2026-01-02",
  constructors: ["Test Setter"],
  editor: "Test Editor",
  width: 3,
  height: 1,
  cells: ["CAT", "A", "T"].map(answer => ({
    answer,
    altAnswers: [],
    circled: false,
    shaded: false,
  })),
  clues: [
    {
      id: 0,
      direction: "across",
      label: "1",
      text: "Synthetic clue",
      cells: [0, 1, 2],
      related: [],
    },
  ],
}
