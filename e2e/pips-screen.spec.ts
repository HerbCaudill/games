import { expect, test, type Locator, type Page } from "@playwright/test"
import { TRAY_SCALE } from "../src/games/pips/logic/constants"
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
  const slack = await snapSlack(page)
  await expect.poll(async () => distance(await centerOf(domino), aside)).toBeLessThan(slack)
  await expect(page.getByText(/Solved in/)).not.toBeVisible()
  // Read where it came to rest once it has finished sliding onto the grid.
  await domino.evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)))
  const dropped = await centerOf(domino)
  await page.reload()
  await expect.poll(async () => distance(await centerOf(domino), dropped)).toBeLessThan(2)

  const cell = page.getByRole("gridcell", { name: "Row 1, column 1", exact: true })
  const [x, y] = await centerOf(cell)
  const box = (await cell.boundingBox())!
  await dragTo(page, domino, [x + box.width / 2, y])
  await expect
    .poll(async () => distance(await centerOf(domino), [x + box.width / 2, y]))
    .toBeLessThan(2)
  await expect(page.getByRole("img", { name: "Broken constraint: 5" })).toBeVisible()
})

test("leaves a dropped domino where it was let go, give or take the snap grid, instead of replaying the drag", async ({
  page,
}) => {
  const domino = page.getByRole("button", { name: "Domino 2–1" })
  const viewport = page.viewportSize()!
  const drop: [number, number] = [viewport.width / 2, viewport.height - 40]
  const slack = await snapSlack(page)
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
  expect(Math.max(...path.map(point => distance(point, drop)))).toBeLessThan(slack)
})

test("pushes a loose domino out from under one dropped on it", async ({ page }) => {
  const dropped = page.getByRole("button", { name: "Domino 2–1" })
  const other = page.getByRole("button", { name: "Domino 3–1" })
  const [x, y] = await centerOf(other)
  await dragTo(page, dropped, [x + 10, y + 5])
  await expect.poll(() => overlap(dropped, other)).toBeLessThanOrEqual(0.5)
  // The dropped domino keeps its place; the one under it moved.
  expect(distance(await centerOf(dropped), [x + 10, y + 5])).toBeLessThan(await snapSlack(page))
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
    .poll(async () => {
      const box = (await domino.boundingBox())!
      return box.height > box.width
    })
    .toBe(true)
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

test("pushes a loose domino out of the way of one turned into it", async ({ page }) => {
  const turned = page.getByRole("button", { name: "Domino 2–1" })
  const other = page.getByRole("button", { name: "Domino 3–1" })
  const [x, y] = await centerOf(other)
  const { height } = (await other.boundingBox())!
  await dragTo(page, turned, [x, y + height + 2])
  await expect.poll(() => overlap(turned, other)).toBeLessThanOrEqual(0.5)
  await turned.click()
  await expect
    .poll(async () => {
      const box = (await turned.boundingBox())!
      return box.height > box.width
    })
    .toBe(true)
  await expect.poll(() => overlap(turned, other)).toBeLessThanOrEqual(0.5)
})

test("pushes a loose domino aside when undo brings another back to where it lies", async ({
  page,
}) => {
  const undone = page.getByRole("button", { name: "Domino 2–1" })
  const other = page.getByRole("button", { name: "Domino 3–1" })
  const slot = await centerOf(undone)
  const cell = page.getByRole("gridcell", { name: "Row 1, column 1", exact: true })
  const [x, y] = await centerOf(cell)
  const box = (await cell.boundingBox())!
  await dragTo(page, undone, [x + box.width / 2, y])
  await dragTo(page, other, slot)
  await page.getByRole("button", { name: "Undo" }).click()
  await expect.poll(async () => distance(await centerOf(undone), slot)).toBeLessThan(2)
  await expect.poll(() => overlap(undone, other)).toBeLessThanOrEqual(0.5)
})

test("moves a domino dropped on the edge of the board clear of it", async ({ page }) => {
  const placed = page.getByRole("button", { name: "Domino 2–1" })
  const dropped = page.getByRole("button", { name: "Domino 3–1" })
  const cell = page.getByRole("gridcell", { name: "Row 2, column 1", exact: true })
  const [x, y] = await centerOf(cell)
  const box = (await cell.boundingBox())!
  await dragTo(page, placed, [x + box.width / 2, y])
  // Just off the board's bottom-right corner, grazing it.
  const corner = (await page
    .getByRole("gridcell", { name: "Row 2, column 2", exact: true })
    .boundingBox())!
  await dragTo(page, dropped, [corner.x + corner.width * 1.6, corner.y + corner.height * 1.2])
  await expect
    .poll(async () => Math.max(...(await Promise.all(cells(page).map(c => overlap(dropped, c))))))
    .toBeLessThanOrEqual(0.5)
  await expect.poll(() => overlap(dropped, placed)).toBeLessThanOrEqual(0.5)
  // Nor does it hide the rule badge hanging off the corner.
  await expect
    .poll(() => overlap(dropped, page.getByRole("img", { name: "Broken constraint: =" })))
    .toBeLessThanOrEqual(0.5)
})

test("moves a domino turned into the board clear of it", async ({ page }) => {
  const domino = page.getByRole("button", { name: "Domino 3–1" })
  const cell = (await page
    .getByRole("gridcell", { name: "Row 2, column 1", exact: true })
    .boundingBox())!
  // Lying flat just under the board, so turning it upright would reach up onto it.
  await dragTo(page, domino, [cell.x + cell.width / 2, cell.y + cell.height * 1.45])
  await domino.click()
  await expect
    .poll(async () => {
      const box = (await domino.boundingBox())!
      return box.height > box.width
    })
    .toBe(true)
  await expect
    .poll(async () => Math.max(...(await Promise.all(cells(page).map(c => overlap(domino, c))))))
    .toBeLessThanOrEqual(0.5)
})

test("spreads out loose dominoes a smaller screen pulls on top of each other", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Wide-screen placement")
  await page.setViewportSize({ width: 1280, height: 800 })
  const a = page.getByRole("button", { name: "Domino 2–1" })
  const b = page.getByRole("button", { name: "Domino 3–1" })
  await dragTo(page, a, [1000, 500])
  await dragTo(page, b, [1200, 500])
  await page.setViewportSize({ width: 600, height: 800 })
  for (const domino of [a, b])
    await expect
      .poll(async () => {
        const box = (await domino.boundingBox())!
        return box.x + box.width
      })
      .toBeLessThanOrEqual(601)
  await expect.poll(() => overlap(a, b)).toBeLessThanOrEqual(0.5)
})

/** The board's cells. */
function cells(
  /** The page. */
  page: Page,
) {
  return ["1, column 1", "1, column 2", "2, column 1", "2, column 2"].map(name =>
    page.getByRole("gridcell", { name: `Row ${name}`, exact: true }),
  )
}

/** How much two elements overlap, in pixels: the smaller of the overlap's width and height. */
async function overlap(
  /** One element. */
  one: Locator,
  /** The other. */
  other: Locator,
) {
  const [a, b] = [(await one.boundingBox())!, (await other.boundingBox())!]
  const across = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)
  const down = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)
  return Math.min(across, down)
}

/** How far, in pixels, snapping can move a dropped domino: half a grid step each way. */
async function snapSlack(
  /** The page. */
  page: Page,
) {
  const cell = page.getByRole("gridcell", { name: "Row 1, column 1", exact: true })
  const step = ((await cell.boundingBox())!.width * TRAY_SCALE) / 4
  return Math.hypot(step / 2, step / 2) + 1
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

test("draws a dragged domino full size only over the board", async ({ page }) => {
  const domino = page.getByRole("button", { name: "Domino 2–1" })
  const cell = page.getByRole("gridcell", { name: "Row 1, column 1", exact: true })
  const box = (await cell.boundingBox())!
  const full = 2 * box.width
  const small = TRAY_SCALE * full
  const width = async () => (await domino.boundingBox())!.width
  const overBoard: [number, number] = [box.x + box.width, box.y + box.height / 2]
  const offBoard: [number, number] = [
    page.viewportSize()!.width / 2,
    page.viewportSize()!.height - 40,
  ]

  await page.mouse.move(...(await centerOf(domino)))
  await page.mouse.down()
  await page.mouse.move(...offBoard, { steps: 8 })
  // Let any change of size finish, so a domino on its way to full size can't pass as small.
  await domino.evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)))
  await expect.poll(width).toBeCloseTo(small, 0)
  await page.mouse.move(...overBoard, { steps: 8 })
  await expect.poll(width).toBeCloseTo(full, 0)
  await page.mouse.move(...offBoard, { steps: 8 })
  await expect.poll(width).toBeCloseTo(small, 0)
  await page.mouse.move(...overBoard, { steps: 8 })
  await page.mouse.up()
  await expect.poll(width).toBeCloseTo(full, 0)

  // Picked up off the board, it shrinks again.
  await page.mouse.down()
  await page.mouse.move(...offBoard, { steps: 8 })
  await expect.poll(width).toBeCloseTo(small, 0)
  await page.mouse.up()
  await expect.poll(width).toBeCloseTo(small, 0)
})

test("undoes and redoes moves", async ({ page }) => {
  const domino = page.getByRole("button", { name: "Domino 2–1" })
  const start = await centerOf(domino)
  const undo = page.getByRole("button", { name: "Undo" })
  const redo = page.getByRole("button", { name: "Redo" })
  await expect(undo).toBeDisabled()
  const cell = page.getByRole("gridcell", { name: "Row 1, column 1", exact: true })
  const [x, y] = await centerOf(cell)
  const box = (await cell.boundingBox())!
  await dragTo(page, domino, [x + box.width / 2, y])
  const placed = await centerOf(domino)
  await undo.click()
  await expect.poll(async () => distance(await centerOf(domino), start)).toBeLessThan(2)
  await redo.click()
  await expect.poll(async () => distance(await centerOf(domino), placed)).toBeLessThan(2)
  await expect(redo).toBeDisabled()

  // The same by keyboard.
  await page.keyboard.press("ControlOrMeta+z")
  await expect.poll(async () => distance(await centerOf(domino), start)).toBeLessThan(2)
  await page.keyboard.press("ControlOrMeta+Shift+z")
  await expect.poll(async () => distance(await centerOf(domino), placed)).toBeLessThan(2)
})

test("leaves out turning and moving dominoes off the board from undo", async ({ page }) => {
  const placedDomino = page.getByRole("button", { name: "Domino 2–1" })
  const looseDomino = page.getByRole("button", { name: "Domino 3–1" })
  const start = await centerOf(placedDomino)
  const undo = page.getByRole("button", { name: "Undo" })
  const viewport = page.viewportSize()!
  // Far enough from the bottom that the domino, turned upright, isn't held back by the screen's edge.
  const aside: [number, number] = [viewport.width / 2, viewport.height - 100]
  const slack = await snapSlack(page)

  await looseDomino.click()
  await dragTo(page, looseDomino, aside)
  await expect(undo).toBeDisabled()

  const cell = page.getByRole("gridcell", { name: "Row 1, column 1", exact: true })
  const [x, y] = await centerOf(cell)
  const box = (await cell.boundingBox())!
  await dragTo(page, placedDomino, [x + box.width / 2, y])
  await looseDomino.click()
  await undo.click()
  await expect.poll(async () => distance(await centerOf(placedDomino), start)).toBeLessThan(2)
  await expect(undo).toBeDisabled()
  // The loose domino stays where it was dropped, turned twice.
  await expect.poll(async () => distance(await centerOf(looseDomino), aside)).toBeLessThan(slack)
  const turned = (await looseDomino.boundingBox())!
  expect(turned.width).toBeGreaterThan(turned.height)
})
