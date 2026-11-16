import { expect, test } from "@playwright/test"
import sharp from "sharp"
import { mockApi } from "./mockApi"

test.beforeEach(async ({ page }) => {
  await mockApi(page)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/pips?date=2026-11-16")
  await page.getByRole("tab", { name: "hard", exact: true }).click()
})

test("centers each diamond exactly on its region cell's bottom-right corner", async ({ page }) => {
  for (const [label, row] of [
    ["5", 1],
    ["=", 2],
  ] as const) {
    const diamond = (await page
      .locator("svg text")
      .filter({ hasText: new RegExp(`^${label}$`) })
      .locator("..")
      .locator("path")
      .boundingBox())!
    const cell = (await page
      .getByRole("gridcell", { name: `Row ${row}, column 2`, exact: true })
      .boundingBox())!
    expect(diamond.x + diamond.width / 2).toBeCloseTo(cell.x + cell.width, 1)
    expect(diamond.y + diamond.height / 2).toBeCloseTo(cell.y + cell.height, 1)
  }
})

test("keeps a solid pure-red error diamond above placed and dragged dominoes", async ({ page }) => {
  for (const [name, col, turns] of [
    ["Domino 2–1", 2, 3],
    ["Domino 3–1", 1, 1],
  ] as const) {
    const domino = page.getByRole("button", { name, exact: true })
    for (let turn = 0; turn < turns; turn++) await domino.click()
    const cell = (await page
      .getByRole("gridcell", { name: `Row 1, column ${col}`, exact: true })
      .boundingBox())!
    const start = (await domino.boundingBox())!
    await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
    await page.mouse.down()
    await page.mouse.move(cell.x + cell.width / 2, cell.y + cell.height, { steps: 8 })
    await page.mouse.up()
  }

  const warning = page.getByRole("img", { name: "Broken constraint: 5", exact: true })
  await expect(warning).toBeVisible()
  await expect(warning.locator("text")).toHaveCSS("fill", "rgb(255, 255, 255)")
  const box = (await warning.locator("path").boundingBox())!
  // This patch is inside the diamond's left edge and overlaps the placed domino.
  const clip = {
    x: box.x + box.width * 0.2,
    y: box.y + box.height * 0.45,
    width: 2,
    height: 2,
  }
  const placed = await page.screenshot({ clip, animations: "disabled" })
  const { channels } = await sharp(placed).stats()
  expect(channels.slice(0, 3).map(channel => [channel.min, channel.max])).toEqual([
    [255, 255],
    [0, 0],
    [0, 0],
  ])

  const domino = page.getByRole("button", { name: "Domino 2–1", exact: true })
  const start = (await domino.boundingBox())!
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 })
  const dragged = await page.screenshot({ clip, animations: "disabled" })
  expect(dragged.equals(placed)).toBe(true)
  await page.mouse.up()
})
