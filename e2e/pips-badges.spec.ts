import { expect, test } from "@playwright/test"
import { mockApi } from "./mockApi"

test("constraint badges leave a crossing domino's pips and outline intact", async ({ page }) => {
  await mockApi(page)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/pips?date=2026-11-16")
  await page.getByRole("tab", { name: "hard", exact: true }).click()

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
  const domino = page.getByRole("button", { name: "Domino 2–1", exact: true })
  await expect
    .poll(async () => {
      const box = (await domino.boundingBox())!
      return box.height / box.width
    })
    .toBeCloseTo(2)
  const box = (await domino.boundingBox())!
  // Include the straight outlines and pips beside the badge, excluding transparent tile margins.
  const clip = {
    x: box.x + box.width * 0.07,
    y: box.y + box.width * 0.3,
    width: box.width * 0.86,
    height: box.width * 1.4,
  }
  const withWarning = await page.screenshot({ clip, animations: "disabled" })
  await warning.evaluate(element => element.setAttribute("visibility", "hidden"))
  const withoutWarning = await page.screenshot({ clip, animations: "disabled" })
  expect(withWarning.equals(withoutWarning)).toBe(true)
})
