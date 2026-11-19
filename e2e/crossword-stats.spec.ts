import { expect, test } from "@playwright/test"
import { mockApi } from "./mockApi"

test.beforeEach(async ({ page }) => {
  await mockApi(page)
  await page.route("https://xword-stats-2.vercel.app/**", route =>
    route.fulfill({ contentType: "text/html", body: "<p>Solve times</p>" }),
  )
})

test("shows the xword-stats chart for the puzzle's day of the week", async ({ page }) => {
  // A Monday.
  await page.goto("/crossword?date=2026-11-16")
  await page.getByRole("button", { name: "Stats", exact: true }).click()
  const stats = page.getByRole("dialog", { name: "Stats" })
  await expect(
    stats.frameLocator("iframe[title='Crossword solve times']").getByText("Solve times"),
  ).toBeVisible()
  await expect(stats.locator("iframe")).toHaveAttribute(
    "src",
    "https://xword-stats-2.vercel.app/?day=1",
  )
})
