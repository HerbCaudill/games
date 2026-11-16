import { expect, test, type Page } from "@playwright/test"
import { mockApi } from "./mockApi"

test.beforeEach(async ({ page }) => {
  await mockApi(page)
  await page.goto("/connections")
})

test("a one-away guess shakes, costs one mistake, and shows a fading hint", async ({ page }) => {
  await select(page, ["APPLE", "PEAR", "PLUM", "RED"])
  await page.getByRole("button", { name: "Submit" }).click()
  await expect(page.getByRole("status")).toHaveText("One away…")
  await expect.poll(() => shakingTiles(page)).toBe(4)
  await expect(page.getByLabel("3 left", { exact: true })).toBeVisible()
  await expect(page.getByRole("button", { name: "APPLE", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  )
  await expect
    .poll(() =>
      page
        .getByRole("status")
        .evaluate(element =>
          element
            .getAnimations()
            .some(animation =>
              (animation.effect as KeyframeEffect)
                .getKeyframes()
                .some(frame => Number(frame.opacity) === 0),
            ),
        ),
    )
    .toBe(true)
  await expect(page.getByRole("status")).toHaveCount(0)
})

test("a mixed guess shakes without a one-away hint and cannot spend twice", async ({ page }) => {
  await select(page, ["APPLE", "PEAR", "CAT", "DOG"])
  await page.getByRole("button", { name: "Submit" }).click()
  await expect.poll(() => shakingTiles(page)).toBe(4)
  await page.keyboard.press("Enter")
  await expect(page.getByLabel("3 left", { exact: true })).toBeVisible()
  await expect(page.getByRole("status")).toHaveCount(0)
  await page.getByRole("button", { name: "Submit" }).click()
  await expect(page.getByRole("status")).toHaveText("Already guessed!")
  await expect(page.getByLabel("3 left", { exact: true })).toBeVisible()
})

/** Select a four-word guess. */
async function select(
  /** The game page. */
  page: Page,
  /** Words to select. */
  words: string[],
) {
  for (const word of words) await page.getByRole("button", { name: word, exact: true }).click()
}

/** Count selected tiles with an active horizontal shake. */
async function shakingTiles(
  /** The game page. */
  page: Page,
) {
  return page
    .getByRole("group", { name: "Words", exact: true })
    .evaluate(
      grid =>
        [...grid.querySelectorAll("button[aria-pressed=true]")].filter(tile =>
          tile
            .getAnimations()
            .some(animation =>
              (animation.effect as KeyframeEffect)
                .getKeyframes()
                .some(frame => String(frame.transform).includes("translateX(")),
            ),
        ).length,
    )
}
