import { expect, test } from "@playwright/test"
import { mockApi } from "./mockApi"

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test("puts the clue directly above the keyboard on touch screens", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Desktop shows the clue above the grid")
  await page.goto("/crossword")
  const grid = (await page.getByRole("grid", { name: "Crossword grid" }).boundingBox())!
  const clue = (await page.getByRole("group", { name: "Current clue" }).boundingBox())!
  const key = (await page.getByRole("button", { name: "Q", exact: true }).boundingBox())!
  expect(clue.y).toBeGreaterThan(grid.y + grid.height)
  expect(key.y).toBeGreaterThan(clue.y + clue.height)
  expect(key.y - (clue.y + clue.height)).toBeLessThan(40)
})
