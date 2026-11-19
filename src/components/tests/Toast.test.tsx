import { render, screen } from "@testing-library/react"
import { expect, it } from "vitest"
import { Toast } from "../Toast"

it("shows a success's points beside its message, not inside it", () => {
  render(<Toast message={{ text: "Nice!", points: 6, success: true, id: 1, leaving: false }} />)
  expect(screen.getByRole("status")).toHaveTextContent(/^Nice!$/)
  expect(screen.getByText("+6")).toBeInTheDocument()
})
