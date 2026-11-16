import { expect, test } from "@playwright/test"
import { mockApi } from "./mockApi"

test("region outlines keep a one-pixel gap around a domino, including its corners", async ({
  page,
}) => {
  await mockApi(page)
  await page.goto("/pips?date=2026-11-16")
  const domino = page.getByRole("button", { name: "Domino 2–1", exact: true })
  const cell = (await page
    .getByRole("gridcell", { name: "Row 1, column 1", exact: true })
    .boundingBox())!
  const start = (await domino.boundingBox())!
  const paths = page.getByRole("grid", { name: "Board" }).locator("path")
  const emptyPath = await paths.first().getAttribute("d")
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  await page.mouse.move(cell.x + cell.width, cell.y + cell.height / 2, { steps: 8 })
  await page.mouse.up()
  await expect.poll(async () => (await domino.boundingBox())!.x).toBeCloseTo(cell.x)
  expect(await paths.first().getAttribute("d")).toBe(emptyPath)

  const gaps = await paths.evaluateAll((elements, cellSize) => {
    const tile = document.querySelector<SVGRectElement>('button[aria-label="Domino 2–1"] rect')!
    const box = tile.getBoundingClientRect()
    const tileScale = tile.getScreenCTM()!.a
    const radius = tile.rx.baseVal.value * tileScale
    const tileStroke = parseFloat(getComputedStyle(tile).strokeWidth) * tileScale
    return elements.map((element, row) => {
      const path = element as SVGPathElement
      const matrix = path.getScreenCTM()!
      const outlineStroke = parseFloat(getComputedStyle(path).strokeWidth) * matrix.a
      const length = path.getTotalLength()
      return Array.from({ length: 160 }, (_, i) => {
        const point = path.getPointAtLength((i / 160) * length).matrixTransform(matrix)
        // The empty second region must fit the same domino translated down one cell.
        const x = Math.abs(point.x - box.x - box.width / 2) - (box.width / 2 - radius)
        const y =
          Math.abs(point.y - box.y - row * cellSize - box.height / 2) - (box.height / 2 - radius)
        const distance =
          Math.hypot(Math.max(x, 0), Math.max(y, 0)) + Math.min(Math.max(x, y), 0) - radius
        return distance - tileStroke / 2 - outlineStroke / 2
      })
    })
  }, cell.height)
  for (const region of gaps) {
    // CSS layout rounds fractional tile positions; allow less than 0.05 CSS pixels of error.
    expect(Math.min(...region)).toBeCloseTo(1, 1)
    expect(Math.max(...region)).toBeCloseTo(1, 1)
  }
})
