import { expect, test } from "@playwright/test"
import { mockApi } from "./mockApi"

for (const colorScheme of ["light", "dark"] as const) {
  test(`Connections selection stays dark gray in ${colorScheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme })
    await mockApi(page)
    await page.goto("/connections")
    const tile = page.getByRole("button", { name: "APPLE", exact: true })
    await tile.click()
    await expect(tile).toHaveAttribute("aria-pressed", "true")
    await expect(tile).toHaveCSS("background-color", "rgb(74, 74, 74)")
    await expect(tile).toHaveCSS("color", "rgb(255, 255, 255)")
    await tile.click()
    await expect(tile).toHaveAttribute("aria-pressed", "false")
  })

  test(`Connections solved bands follow difficulty in ${colorScheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme })
    await mockApi(page)
    await page.goto("/connections")
    // Solve out of difficulty order to catch coloring by solve position.
    for (const { title, words, color } of [
      { title: "TOOLS", words: ["SAW", "AXE", "AWL", "FILE"], color: "rgb(186, 129, 197)" },
      { title: "FRUIT", words: ["APPLE", "PEAR", "PLUM", "FIG"], color: "rgb(249, 223, 109)" },
      { title: "PETS", words: ["CAT", "DOG", "FISH", "BIRD"], color: "rgb(176, 196, 239)" },
      { title: "COLORS", words: ["RED", "BLUE", "GREEN", "PINK"], color: "rgb(160, 195, 90)" },
    ]) {
      for (const word of words) await page.getByRole("button", { name: word, exact: true }).click()
      await page.getByRole("button", { name: "Submit" }).click()
      const band = page.getByText(title, { exact: true }).locator("..")
      await expect(band).toHaveCSS("background-color", color)
      await expect(band).toHaveCSS("color", "rgb(29, 36, 51)")
    }
    await expect(page.getByText("Perfect!", { exact: true })).toBeVisible()
  })
}
