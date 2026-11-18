import { expect, test, type Locator, type Page } from "@playwright/test"
import { mockApi } from "./mockApi"

test.beforeEach(async ({ page }) => {
  await mockApi(page)
  await page.goto("/pips")
})

test("keeps a loose domino beyond the game container and lets it return to the board", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Wide-screen placement")
  await page.setViewportSize({ width: 1440, height: 900 })
  const domino = page.getByRole("button", { name: "Domino 2–1" })
  const aside: [number, number] = [1280, 400]
  await dragTo(page, domino, aside)
  await expect.poll(async () => distance(await centerOf(domino), aside)).toBeLessThan(2)
  await expect(page.getByText(/Solved in/)).not.toBeVisible()
  await page.reload()
  await expect.poll(async () => distance(await centerOf(domino), aside)).toBeLessThan(2)

  const cell = page.getByRole("gridcell", { name: "Row 1, column 1", exact: true })
  const [x, y] = await centerOf(cell)
  const box = (await cell.boundingBox())!
  await dragTo(page, domino, [x + box.width / 2, y])
  await expect
    .poll(async () => distance(await centerOf(domino), [x + box.width / 2, y]))
    .toBeLessThan(2)
  await expect(page.getByRole("img", { name: "Broken constraint: 5" })).toBeVisible()
})

test("leaves a dropped domino where it was let go instead of replaying the drag", async ({
  page,
}) => {
  const domino = page.getByRole("button", { name: "Domino 2–1" })
  const viewport = page.viewportSize()!
  const drop: [number, number] = [viewport.width / 2, viewport.height - 40]
  await dragTo(page, domino, drop)
  const path = await domino.evaluate(
    el =>
      new Promise<[number, number][]>(resolve => {
        const points: [number, number][] = []
        const start = performance.now()
        const sample = () => {
          const box = el.getBoundingClientRect()
          points.push([box.x + box.width / 2, box.y + box.height / 2])
          if (performance.now() - start < 250) requestAnimationFrame(sample)
          else resolve(points)
        }
        sample()
      }),
  )
  expect(Math.max(...path.map(point => distance(point, drop)))).toBeLessThan(2)
})

test("keeps loose dominoes reachable at screen edges, after turning and after resizing", async ({
  page,
}) => {
  const domino = page.getByRole("button", { name: "Domino 2–1" })
  const viewport = page.viewportSize()!
  await dragTo(page, domino, [viewport.width - 1, viewport.height - 1])
  await expect
    .poll(async () => {
      const box = (await domino.boundingBox())!
      return Math.max(box.x + box.width - viewport.width, box.y + box.height - viewport.height)
    })
    .toBeLessThanOrEqual(1)
  await domino.click()
  await expect
    .poll(async () => {
      const box = (await domino.boundingBox())!
      return Math.max(box.x + box.width - viewport.width, box.y + box.height - viewport.height)
    })
    .toBeLessThanOrEqual(1)
  await page.setViewportSize({ width: 320, height: 568 })
  await expect
    .poll(async () => {
      const box = (await domino.boundingBox())!
      return box.x >= 0 && box.y >= 0 && box.x + box.width <= 321 && box.y + box.height <= 569
    })
    .toBe(true)
  // It still receives pointer input after being brought back inside the smaller screen.
  const before = (await domino.boundingBox())!
  await domino.click()
  await expect.poll(async () => (await domino.boundingBox())!.width).not.toBeCloseTo(before.width)
})

test("keeps a domino dropped at the top reachable below the header", async ({ page }) => {
  const domino = page.getByRole("button", { name: "Domino 2–1" })
  await dragTo(page, domino, [1, 1])
  const header = (await page.getByRole("banner").boundingBox())!
  await expect
    .poll(async () => (await domino.boundingBox())!.y)
    .toBeGreaterThanOrEqual(header.y + header.height)
  await domino.click()
  await expect
    .poll(async () => (await domino.boundingBox())!.height)
    .toBeGreaterThan((await domino.boundingBox())!.width)
})

/** Drag a domino by its center to a viewport point. */
async function dragTo(
  /** The page. */
  page: Page,
  /** The domino. */
  domino: Locator,
  /** The desired center. */
  destination: [number, number],
) {
  await page.mouse.move(...(await centerOf(domino)))
  await page.mouse.down()
  await page.mouse.move(...destination, { steps: 8 })
  await page.mouse.up()
}

/** The center of a visible game element. */
async function centerOf(
  /** The element. */
  element: Locator,
): Promise<[number, number]> {
  const box = (await element.boundingBox())!
  return [box.x + box.width / 2, box.y + box.height / 2]
}

/** Distance between viewport points. */
function distance(
  /** The first point. */
  a: [number, number],
  /** The second point. */
  b: [number, number],
) {
  return Math.hypot(a[0] - b[0], a[1] - b[1])
}

test("clears the board, putting every domino back in the tray", async ({ page }) => {
  const domino = page.getByRole("button", { name: "Domino 2–1" })
  const start = await centerOf(domino)
  const clear = page.getByRole("button", { name: "Clear" })
  await expect(clear).toBeDisabled()
  const cell = page.getByRole("gridcell", { name: "Row 1, column 1", exact: true })
  const [x, y] = await centerOf(cell)
  const box = (await cell.boundingBox())!
  await dragTo(page, domino, [x + box.width / 2, y])
  await expect(page.getByRole("img", { name: "Broken constraint: 5" })).toBeVisible()
  await clear.click()
  await expect(page.getByRole("img", { name: "Broken constraint: 5" })).not.toBeVisible()
  await expect.poll(async () => distance(await centerOf(domino), start)).toBeLessThan(2)
  await expect(clear).toBeDisabled()
})
