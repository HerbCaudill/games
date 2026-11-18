import { cleanup, render } from "@testing-library/react"
import { afterEach, expect, it } from "vitest"
import { DominoTile } from "../DominoTile"
import { regionColors } from "../regionColors"

afterEach(cleanup)

it("keeps each half's region color out of the other half", () => {
  const { container } = render(<DominoTile domino={[4, 0]} turn={1} regions={[0, 1]} />)
  const half = (region: number) =>
    [...container.querySelectorAll("rect")].find(rect =>
      rect.style.fill.includes(regionColors.fill(region)),
    )!
  const [first, second] = [half(0), half(1)]
  const end = Number(first.getAttribute("x")) + Number(first.getAttribute("width"))
  expect(end).toBeLessThanOrEqual(Number(second.getAttribute("x")))
})
