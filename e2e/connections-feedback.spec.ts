import { expect, test, type Page } from "@playwright/test"
import { mockApi } from "./mockApi"

test.beforeEach(async ({ page }) => {
  await mockApi(page)
  await page.goto("/connections")
})

test("a one-away guess shakes, costs one mistake, and shows a fading hint", async ({ page }) => {
  await select(page, ["APPLE", "PEAR", "PLUM", "RED"])
  await page.getByRole("button", { name: "Submit" }).click()
  await expect.poll(() => shakingTiles(page), { intervals: [25] }).toBe(4)
  await expect(page.getByRole("status")).toHaveText("One away…")
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
  await expect.poll(() => shakingTiles(page), { intervals: [25] }).toBe(4)
  await page.keyboard.press("Enter")
  await expect(page.getByLabel("3 left", { exact: true })).toBeVisible()
  await expect(page.getByRole("status")).toHaveCount(0)
  await page.getByRole("button", { name: "Submit" }).click()
  await expect(page.getByRole("status")).toHaveText("Already guessed!")
  await expect(page.getByLabel("3 left", { exact: true })).toBeVisible()
})

test("submission bounces in sequence before moving the words into a solved band", async ({
  page,
}) => {
  await select(page, ["APPLE", "PEAR", "PLUM", "FIG"])
  await page.getByRole("button", { name: "Submit" }).click()
  const grid = page.getByRole("group", { name: "Words", exact: true })
  await expect
    .poll(
      () =>
        grid.evaluate(element =>
          [...element.querySelectorAll("button[aria-pressed=true]")].flatMap(tile =>
            tile
              .getAnimations()
              .filter(animation =>
                (animation.effect as KeyframeEffect)
                  .getKeyframes()
                  .some(frame => String(frame.transform).includes("translateY(-")),
              )
              .map(animation => animation.effect!.getTiming().delay),
          ),
        ),
      { intervals: [25] },
    )
    .toEqual([0, 55, 110, 165])
  await expect(page.getByText("FRUIT", { exact: true })).toHaveCount(0)
  await expect(grid).toHaveAttribute("aria-busy", "true")
  await page.keyboard.press("Enter")
  await page.keyboard.press("s")
  await page.keyboard.press("d")
  await expect
    .poll(
      () =>
        grid.evaluate(element => {
          const tile = [...element.querySelectorAll("button")].find(
            button => button.textContent === "FIG",
          )!
          return tile
            ?.getAnimations()
            .some(animation =>
              (animation.effect as KeyframeEffect)
                .getKeyframes()
                .some(frame => /translate\([^,]+,\s*[1-9]/.test(String(frame.transform))),
            )
        }),
      { intervals: [25] },
    )
    .toBe(true)
  await expect
    .poll(
      () =>
        grid.evaluate(
          element =>
            [...element.querySelectorAll("button[aria-pressed=true]")].filter(tile =>
              tile
                .getAnimations()
                .some(animation =>
                  (animation.effect as KeyframeEffect)
                    .getKeyframes()
                    .some(
                      frame => String(frame.transform).includes("scaleX(") && frame.backgroundColor,
                    ),
                ),
            ).length,
        ),
      { intervals: [25] },
    )
    .toBe(4)
  await expect(page.getByText("FRUIT", { exact: true })).toBeVisible()
  await expect(grid).toHaveAttribute("aria-busy", "false")
  await expect(page.getByRole("button", { name: "APPLE", exact: true })).toHaveCount(0)
  await expect(page.getByLabel("4 left", { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText("FRUIT", { exact: true })).toBeVisible()
})

test("reduced motion gives immediate results without moving tiles", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await select(page, ["APPLE", "PEAR", "PLUM", "RED"])
  await page.getByRole("button", { name: "Submit" }).click()
  await expect(page.getByRole("status")).toHaveText("One away…")
  await expect(page.getByLabel("3 left", { exact: true })).toBeVisible()
  await expect.poll(() => shakingTiles(page)).toBe(0)
  await page.getByRole("button", { name: "Deselect all" }).click()
  await select(page, ["APPLE", "PEAR", "PLUM", "FIG"])
  await page.getByRole("button", { name: "Submit" }).click()
  await expect(page.getByText("FRUIT", { exact: true })).toBeVisible()
  expect(
    await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter(animation =>
            (animation.effect as KeyframeEffect).getKeyframes().some(frame => frame.transform),
          ).length,
    ),
  ).toBe(0)
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
