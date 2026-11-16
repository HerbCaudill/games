import { expect, test, type Locator, type Page } from "@playwright/test"
import { mockApi } from "./mockApi"

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test("lists the games in order and opens one", async ({ page }) => {
  await page.goto("/")
  const names = page.getByRole("listitem").locator("span.font-semibold")
  await expect(names).toHaveText([
    "Crossword",
    "Pips",
    "Spelling Bee",
    "Connections",
    "Letter Boxed",
  ])
  await page.getByRole("link", { name: /Connections/ }).click()
  await expect(page).toHaveURL(/\/connections$/)
  await expect(page.getByRole("heading", { name: "Connections" })).toBeVisible()
})

test("solves the crossword", async ({ page, isMobile }) => {
  await page.goto("/crossword")
  await expect(page.getByRole("grid", { name: "Crossword grid" })).toBeVisible()
  const type = async (letters: string) => {
    for (const letter of letters) {
      if (isMobile)
        await page.getByRole("button", { name: letter, exact: true }).dispatchEvent("pointerdown")
      else await page.keyboard.press(letter)
    }
  }
  // Filling 1-Across moves on to 3-Across, then to the one empty square of 1-Down, then 2-Down.
  await type("CATWET")
  await expect(page.getByText("1D", { exact: true })).toBeVisible()
  await type("OO")
  await expect(page.getByText(/Solved in/)).toBeVisible()
})

test("scores a Spelling Bee word and shows the rank", async ({ page }) => {
  await page.goto("/spelling-bee")
  for (const letter of "torah")
    await page
      .getByRole("button", { name: letter.toUpperCase(), exact: true })
      .dispatchEvent("pointerdown")
  await page.getByRole("button", { name: "Enter" }).click()
  await expect(page.getByText("5 points")).toBeVisible()
  await expect(page.getByText("You have found 1 word")).toBeVisible()
})

test("rejects a Spelling Bee word without the center letter", async ({ page }) => {
  await page.goto("/spelling-bee")
  for (const letter of "boom")
    await page
      .getByRole("button", { name: letter.toUpperCase(), exact: true })
      .dispatchEvent("pointerdown")
  await page.getByRole("button", { name: "Enter" }).click()
  await expect(page.getByRole("status")).toHaveText("Missing center letter")
})

test("solves a Connections group and loses after four mistakes", async ({ page }) => {
  await page.goto("/connections")
  for (const word of ["APPLE", "PEAR", "PLUM", "FIG"])
    await page.getByRole("button", { name: word, exact: true }).click()
  await page.getByRole("button", { name: "Submit" }).click()
  await expect(page.getByText("APPLE, PEAR, PLUM, FIG")).toBeVisible()

  for (const [i, fourth] of ["SAW", "AXE", "AWL", "FILE"].entries()) {
    if (i > 0) await page.getByRole("button", { name: "Deselect all" }).click()
    for (const word of ["RED", "CAT", "DOG", fourth])
      await page.getByRole("button", { name: word, exact: true }).click()
    await page.getByRole("button", { name: "Submit" }).click()
  }
  await expect(page.getByText("Better luck next time")).toBeVisible()
  await expect(page.getByText("SAW, AXE, AWL, FILE")).toBeVisible()
})

test("solves Letter Boxed", async ({ page }) => {
  await page.goto("/letter-boxed")
  const tap = async (letters: string) => {
    for (const letter of letters)
      await page.getByRole("button", { name: letter, exact: true }).dispatchEvent("pointerdown")
    await page.getByRole("button", { name: "Enter" }).click()
  }
  await tap("ADG")
  await expect(page.getByText("ADG", { exact: true })).toBeVisible()
  await tap("JBEHKCFIL")
  await expect(page.getByText("Solved in 2 words!")).toBeVisible()
})

test("solves a Pips board by turning and dragging dominoes", async ({ page }) => {
  await page.goto("/pips")
  const cell = (row: number, col: number) =>
    page.getByRole("gridcell", { name: `Row ${row}, column ${col}` })
  // Each domino lies flat; one tap turns it so its first half is on top.
  await placeDomino(page, "Domino 2–1", cell(1, 1), cell(2, 1))
  await placeDomino(page, "Domino 3–1", cell(1, 2), cell(2, 2))
  await expect(page.getByText(/Solved in/)).toBeVisible()
})

test("keeps progress after a reload", async ({ page }) => {
  await page.goto("/spelling-bee")
  for (const letter of "moat")
    await page
      .getByRole("button", { name: letter.toUpperCase(), exact: true })
      .dispatchEvent("pointerdown")
  await page.getByRole("button", { name: "Enter" }).click()
  await expect(page.getByText("1 point", { exact: false }).first()).toBeVisible()
  await page.reload()
  await expect(page.getByText("You have found 1 word")).toBeVisible()
})

/** Tap a Pips domino to turn it upright, then drag it onto two cells. */
async function placeDomino(
  /** The page. */
  page: Page,
  /** The domino's label. */
  name: string,
  /** Cell for its top half. */
  top: Locator,
  /** Cell for its bottom half. */
  bottom: Locator,
) {
  const domino = page.getByRole("button", { name })
  await domino.click()
  const from = center((await domino.boundingBox())!)
  const [a, b] = [center((await top.boundingBox())!), center((await bottom.boundingBox())!)]
  await page.mouse.move(...from)
  await page.mouse.down()
  await page.mouse.move((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, { steps: 8 })
  await page.mouse.up()
}

/** The center of a box. */
function center(
  /** The box. */
  box: { x: number; y: number; width: number; height: number },
): [number, number] {
  return [box.x + box.width / 2, box.y + box.height / 2]
}
