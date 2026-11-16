import { expect, test, type Page } from "@playwright/test"
import type { GameId } from "../src/types"
import { mockApi } from "./mockApi"

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

for (const game of ["crossword", "pips", "spelling-bee", "connections", "letter-boxed"] as const) {
  test(`${game} celebrates once and shows complete on the home page`, async ({
    page,
    isMobile,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" })
    await page.goto(`/${game}?date=2026-11-16`)
    await finish(page, game, isMobile)
    const celebration = page.getByRole("status").filter({ hasText: "Puzzle complete!" })
    await expect(celebration).toBeVisible()
    expect(await celebration.evaluate(element => element.getAnimations().length)).toBeGreaterThan(0)
    await page.reload()
    await expect(page.getByRole("button", { name: "All games" })).toBeVisible()
    await expect(celebration).toHaveCount(0)
    await page.getByRole("button", { name: "All games" }).click()
    await expect(
      page.locator(`a[href^="/${game}"]`).getByText("Complete", { exact: true }),
    ).toBeVisible()
  })
}

test("celebrates without motion when reduced motion is requested", async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/letter-boxed?date=2026-11-16")
  await finish(page, "letter-boxed", isMobile)
  const celebration = page.getByRole("status").filter({ hasText: "Puzzle complete!" })
  await expect(celebration).toBeVisible()
  expect(
    await celebration.evaluate(
      element => element.parentElement!.getAnimations({ subtree: true }).length,
    ),
  ).toBe(0)
  await expect(celebration).toHaveCount(0)
})

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
    for (const difficulty of ["easy", "medium", "hard"]) {
      await page.getByRole("tab", { name: difficulty, exact: true }).click()
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
    }
  }
}
