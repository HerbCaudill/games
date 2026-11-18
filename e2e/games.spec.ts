import { expect, test, type Locator, type Page } from "@playwright/test"
import { mockApi } from "./mockApi"

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test("lists the games in order and opens one", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("main").getByRole("link")).toHaveText([
    /^Crossword/,
    /^Pips/,
    /^Spelling Bee/,
    /^Connections/,
    /^Letter Boxed/,
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
  await expect(page.getByRole("group", { name: "Current clue" })).toContainText("Bovine")
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
  await expect(page.getByText("5 / 21 points")).toBeVisible()
  await expect(page.getByText("3 points to Great")).toBeVisible()
  await expect(page.getByLabel("0 of 1 pangram found")).toBeVisible()
  await expect(page.getByText("You have found 1 word")).toBeVisible()
})

test("shows Spelling Bee hints, the word grid and player stats from the header", async ({
  page,
}) => {
  await page.goto("/spelling-bee")
  for (const letter of "moat")
    await page
      .getByRole("button", { name: letter.toUpperCase(), exact: true })
      .dispatchEvent("pointerdown")
  await page.getByRole("button", { name: "Enter" }).click()

  await page.getByRole("button", { name: "Hints" }).click()
  const hints = page.getByRole("dialog", { name: "Hints" })
  await hints.getByText("to", { exact: true }).click()
  await expect(hints.getByText("Scroll in an ark")).toBeVisible()
  // Found words stay hidden unless asked for.
  await expect(hints.getByText("Castle ring")).toHaveCount(0)
  // Typing in a panel doesn't reach the game behind it.
  await page.keyboard.press("t")
  await hints.getByRole("button", { name: "Close" }).click()
  await expect(page.getByLabel("Current word")).toHaveText("")

  await page.getByRole("button", { name: "Word grid and stats" }).click()
  const grid = page.getByRole("dialog", { name: "Word grid and stats" })
  await expect(grid.getByLabel("M, 4 letters: 1 of 1 found")).toBeVisible()
  await expect(grid.getByText("1,234 players")).toBeVisible()
})

test("rejects a Spelling Bee word without the center letter", async ({ page }) => {
  await page.goto("/spelling-bee")
  for (const letter of "boom")
    await page
      .getByRole("button", { name: letter.toUpperCase(), exact: true })
      .dispatchEvent("pointerdown")
  await page.getByRole("button", { name: "Enter" }).click()
  await expect(page.getByRole("status")).toHaveText("Missing center letter")
  // The message has its own place above the word, clear of the cursor.
  const word = (await page.getByLabel("Current word").boundingBox())!
  await expect
    .poll(async () => {
      const message = (await page.getByRole("status").boundingBox())!
      return message.y + message.height
    })
    .toBeLessThanOrEqual(word.y)
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
  await expect(page.getByRole("status").filter({ hasText: /^Solved in/ })).toBeVisible()
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

test("leaves a Pips domino where it is dropped, and snaps one dropped half on the board", async ({
  page,
}) => {
  await page.goto("/pips")
  const domino = page.getByRole("button", { name: "Domino 2–1" })
  const topLeft = center(
    (await page.getByRole("gridcell", { name: "Row 1, column 1" }).boundingBox())!,
  )
  const topRight = center(
    (await page.getByRole("gridcell", { name: "Row 1, column 2" }).boundingBox())!,
  )
  const cellSize = topRight[0] - topLeft[0]

  // Just below the board, clear of it, it stays put.
  const aside: [number, number] = [topLeft[0] - 0.5 * cellSize, topLeft[1] + 2.2 * cellSize]
  await dragTo(page, domino, aside)
  await expect
    .poll(async () => distance(center((await domino.boundingBox())!), aside))
    .toBeLessThan(2)

  // Hanging off the board's right edge, it settles on the top row.
  await dragTo(page, domino, [topRight[0] + 0.6 * cellSize, topRight[1] + 0.2 * cellSize])
  const topRow: [number, number] = [(topLeft[0] + topRight[0]) / 2, topLeft[1]]
  await expect
    .poll(async () => distance(center((await domino.boundingBox())!), topRow))
    .toBeLessThan(2)
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
  const [a, b] = [center((await top.boundingBox())!), center((await bottom.boundingBox())!)]
  await dragTo(page, domino, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2])
}

/** Drag something by its center to a point. */
async function dragTo(
  /** The page. */
  page: Page,
  /** What to drag. */
  target: Locator,
  /** Where to drop its center. */
  to: [number, number],
) {
  await page.mouse.move(...center((await target.boundingBox())!))
  await page.mouse.down()
  await page.mouse.move(...to, { steps: 8 })
  await page.mouse.up()
}

/** The distance between two points. */
function distance(
  /** One point. */
  a: [number, number],
  /** The other. */
  b: [number, number],
) {
  return Math.hypot(a[0] - b[0], a[1] - b[1])
}

/** The center of a box. */
function center(
  /** The box. */
  box: { x: number; y: number; width: number; height: number },
): [number, number] {
  return [box.x + box.width / 2, box.y + box.height / 2]
}

test("opens the Spelling Bee found-word list over the board on phones", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Wide screens show the list beside the board")
  await page.goto("/spelling-bee")
  for (const letter of "moat")
    await page
      .getByRole("button", { name: letter.toUpperCase(), exact: true })
      .dispatchEvent("pointerdown")
  await page.getByRole("button", { name: "Enter" }).click()
  const hive = page.getByRole("group", { name: "Letters" })
  const before = (await hive.boundingBox())!
  await page.getByRole("button", { name: "You have found 1 word" }).click()
  const list = page.getByRole("list", { name: "Found words" })
  await expect(list.getByText("Moat")).toBeVisible()
  expect((await hive.boundingBox())!.y).toBe(before.y)
  // The list covers the board.
  expect((await list.boundingBox())!.y + (await list.boundingBox())!.height).toBeGreaterThan(
    before.y,
  )
})
