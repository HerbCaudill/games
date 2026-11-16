import { expect, test, type Page } from "@playwright/test"
import { mockApi } from "./mockApi"

test.beforeEach(async ({ page }) => {
  await mockApi(page)
  await page.goto("/letter-boxed?date=2026-11-16")
  await expect(page.getByRole("group", { name: "Letters" })).toBeVisible()
})

test("restarts a solved puzzle and keeps the empty board after reload", async ({ page }) => {
  await enterWord(page, "ADG")
  await enterWord(page, "JBEHKCFIL")
  await expect(page.getByText("Solved in 2 words!")).toBeVisible()
  await page.getByRole("button", { name: "Show the editor’s solution" }).click()
  await page.getByRole("button", { name: "Restart", exact: true }).click()
  await expect(page.getByRole("button", { name: "Restart", exact: true })).toBeDisabled()
  await page.reload()
  await expect(page.getByRole("button", { name: "Restart", exact: true })).toBeDisabled()
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("status:letter-boxed:2026-11-16")))
    .toBe('"new"')
  await enterWord(page, "ADG")
  await enterWord(page, "JBEHKCFIL")
  await expect(page.getByRole("button", { name: "Show the editor’s solution" })).toBeVisible()
})

test("animates accepted paths quickly while keeping word entry usable", async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await enterWord(page, "ADG")
  // Pause real browser animations so input can be checked during the acceptance feedback.
  const durations = await page.getByRole("group", { name: "Letters" }).evaluate(element => {
    const animations = element.getAnimations({ subtree: true })
    animations.forEach(animation => animation.pause())
    return animations.map(animation => Number(animation.effect!.getTiming().duration))
  })
  expect(durations.length).toBeGreaterThan(0)
  expect(durations.every(duration => duration > 0 && duration < 1500)).toBe(true)
  if (isMobile) await enterWord(page, "JBEHKCFIL")
  else {
    await page.keyboard.type("JBEHKCFIL")
    await page.keyboard.press("Enter")
  }
  await expect(page.getByText("Solved in 2 words!")).toBeVisible()
  await page.getByRole("group", { name: "Letters" }).evaluate(element => {
    element.getAnimations({ subtree: true }).forEach(animation => animation.play())
  })
  await expect
    .poll(() =>
      page
        .getByRole("group", { name: "Letters" })
        .evaluate(element => element.getAnimations({ subtree: true }).length),
    )
    .toBe(0)
  await page.reload()
  await expect(page.getByText("Solved in 2 words!")).toBeVisible()
  expect(
    await page
      .getByRole("group", { name: "Letters" })
      .evaluate(element => element.getAnimations({ subtree: true }).length),
  ).toBe(0)
})

test("honors reduced motion when accepting words", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await enterWord(page, "ADG")
  await expect(page.getByText("ADG", { exact: true })).toBeVisible()
  expect(
    await page
      .getByRole("group", { name: "Letters" })
      .evaluate(element => element.getAnimations({ subtree: true }).length),
  ).toBe(0)
  await enterWord(page, "JBEHKCFIL")
  await expect(page.getByText("Solved in 2 words!")).toBeVisible()
})

test("keeps a three-word finish in progress without celebrating", async ({ page }) => {
  await enterWord(page, "ADG")
  await enterWord(page, "JA")
  await enterWord(page, "DGJBEHKCFIL")
  await expect(page.getByText("ADG – GJA – ADGJBEHKCFIL", { exact: true })).toBeVisible()
  await expect(page.getByRole("status").filter({ hasText: "Puzzle complete!" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Enter", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "All games" }).click()
  await expect(
    page.getByRole("link", { name: /Letter Boxed/ }).getByText("In progress"),
  ).toBeVisible()
})

/** Tap a word and submit it, omitting the carried letter for subsequent words. */
async function enterWord(
  /** Browser page. */
  page: Page,
  /** Letters to enter. */
  letters: string,
) {
  for (const letter of letters)
    await page.getByRole("button", { name: letter, exact: true }).dispatchEvent("pointerdown")
  await page.getByRole("button", { name: "Enter", exact: true }).click()
}
