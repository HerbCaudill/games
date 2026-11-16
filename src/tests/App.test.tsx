import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { App } from "../App"

describe("App", () => {
  it("shows the game menu at the root", () => {
    render(<App />)
    expect(screen.getByRole("link", { name: /Crossword/ })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Letter Boxed/ })).toBeInTheDocument()
  })
})
