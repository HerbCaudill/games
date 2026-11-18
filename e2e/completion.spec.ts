import { expect, test, type Page } from "@playwright/test"
import type { GameId } from "../src/types"
import { mockApi } from "./mockApi"

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

for (const game of ["crossword", "pips", "spelling-bee", "connections", "letter-boxed"] as const) {
  test(`${game} says how long it took, celebrates once and shows complete on the home page`, async ({
    page,
    isMobile,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" })
    await page.goto(`/${game}?date=2026-11-16`)
    await finish(page, game, isMobile)
    await expect(page.getByRole("status").filter({ hasText: /^Solved in \d+:\d\d/ })).toBeVisible()
    await expect(confetti(page)).toHaveCount(1)
    await page.reload()
    await expect(page.getByRole("status").filter({ hasText: /^Solved in/ })).toBeVisible()
    await expect(confetti(page)).toHaveCount(0)
    await page.getByRole("button", { name: "All games" }).click()
    await expect(
      page.locator(`a[href^="/${game}"]`).getByText("Complete", { exact: true }),
    ).toBeVisible()
  })
}

test("celebrates without motion when reduced motion is requested", async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/spelling-bee?date=2026-11-16")
  await finish(page, "spelling-bee", isMobile)
  await expect(page.getByRole("status").filter({ hasText: /^Solved in/ })).toBeVisible()
  await expect(confetti(page)).toHaveCount(1)
  expect(
    await confetti(page).evaluate(element => element.getAnimations({ subtree: true }).length),
  ).toBe(0)
  await expect(confetti(page)).toHaveCount(0)
})

test("celebrates each Pips board as it is solved", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/pips?date=2026-11-16")
  await solvePipsBoard(page, "medium")
  await expect(confetti(page)).toHaveCount(1)
})

/** The shared completion confetti, present only while it plays. */
function confetti(
  /** Browser page. */
  page: Page,
) {
  return page.locator(".completion-celebration")
}

/** Complete a synthetic puzzle through its public controls. */
async function finish(
  /** Browser page. */
  page: Page,
  /** Game to finish. */
  game: GameId,
  /** Whether to use the crossword's touch keyboard. */
  isMobile: boolean,
) {
  if (game === "crossword") {
    await expect(page.getByRole("grid", { name: "Crossword grid" })).toBeVisible()
    for (const letter of "CATWETOO") {
      if (isMobile)
        await page.getByRole("button", { name: letter, exact: true }).dispatchEvent("pointerdown")
      else await page.keyboard.press(letter)
    }
  } else if (game === "spelling-bee" || game === "letter-boxed") {
    const words = game === "spelling-bee" ? ["MOAT", "TORAH", "BATHROOM"] : ["ADG", "JBEHKCFIL"]
    for (const word of words) {
      for (const letter of word)
        await page.getByRole("button", { name: letter, exact: true }).dispatchEvent("pointerdown")
      await page.getByRole("button", { name: "Enter", exact: true }).click()
    }
  } else if (game === "connections") {
    for (const group of [
      ["APPLE", "PEAR", "PLUM", "FIG"],
      ["RED", "BLUE", "GREEN", "PINK"],
      ["CAT", "DOG", "FISH", "BIRD"],
      ["SAW", "AXE", "AWL", "FILE"],
    ]) {
      for (const word of group) await page.getByRole("button", { name: word, exact: true }).click()
      await page.getByRole("button", { name: "Submit", exact: true }).click()
    }
  } else {
    for (const difficulty of ["easy", "medium", "hard"]) await solvePipsBoard(page, difficulty)
  }
}

/** Switch to a Pips board and solve it by dragging both dominoes into place. */
async function solvePipsBoard(
  /** Browser page. */
  page: Page,
  /** Board to solve. */
  difficulty: string,
) {
  await page.getByRole("button", { name: /^Difficulty/ }).click()
  await page.getByRole("menuitemradio", { name: new RegExp(`^${difficulty}`, "i") }).click()
  await expect(page.getByRole("menu")).toBeHidden()
  for (const [col, name] of ["Domino 2–1", "Domino 3–1"].entries()) {
    const domino = page.getByRole("button", { name, exact: true })
    await domino.click()
    const top = (await page
      .getByRole("gridcell", { name: `Row 1, column ${col + 1}` })
      .boundingBox())!
    const bottom = (await page
      .getByRole("gridcell", { name: `Row 2, column ${col + 1}` })
      .boundingBox())!
    const start = (await domino.boundingBox())!
    await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
    await page.mouse.down()
    await page.mouse.move(top.x + top.width / 2, (top.y + bottom.y + bottom.height) / 2, {
      steps: 8,
    })
    await page.mouse.up()
  }
  await expect(page.getByText(/Solved in/)).toBeVisible()
}
