import { expect, test, type Locator, type Page } from "@playwright/test"
import type { Cell, Domino, PipsPuzzle } from "../src/types"
import { mockApi } from "./mockApi"

test.beforeEach(async ({ page }) => {
  await mockApi(page)
  await page.route(/\/api\/pips\/[0-9-]+$/, route =>
    route.fulfill({ json: { ...PUZZLE, date: route.request().url().split("/").pop()! } }),
  )
  await page.goto("/pips")
  await expect(dominoes(page)).toHaveCount(DOMINOES.length)
})

test("starts with the smaller number on the left, in ascending order down the columns", async ({
  page,
}) => {
  const tray = await readTray(page)
  const downColumns = [...tray].sort((a, b) => a.x - b.x || a.y - b.y)
  expect(downColumns.map(({ left, right }) => [left, right])).toEqual([
    [0, 3],
    [0, 6],
    [1, 2],
    [1, 6],
    [2, 2],
    [2, 5],
    [3, 5],
    [4, 4],
  ])
  expect(tray.every(({ width, height }) => width > height)).toBe(true)
})

test("clear puts every domino back in its first slot, facing its first way", async ({ page }) => {
  const fresh = await readTray(page)
  await domino(page, "3–0").click()
  await settled(page)
  const { width, height } = page.viewportSize()!
  await dragTo(page, domino(page, "5–2"), [width / 2, height - 60])
  const cell = (await page
    .getByRole("gridcell", { name: "Row 1, column 2", exact: true })
    .boundingBox())!
  await dragTo(page, domino(page, "4–4"), [cell.x + cell.width, cell.y + cell.height / 2])
  await page.getByRole("button", { name: "Clear" }).click()
  expect(await readTray(page)).toEqual(fresh)
  await expect(page.getByRole("button", { name: "Clear" })).toBeDisabled()
  await page.reload()
  await expect(dominoes(page)).toHaveCount(DOMINOES.length)
  expect(await readTray(page)).toEqual(fresh)
})

test("the keyboard starts with the tray's first domino, smaller number on the cursor", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Keyboard play")
  await page.keyboard.press("Enter")
  await settled(page)
  const placed = (await readTray(page)).find(({ name }) => name === "Domino 3–0")!
  const cell = (await page
    .getByRole("gridcell", { name: "Row 1, column 1", exact: true })
    .boundingBox())!
  expect(Math.abs(placed.x - Math.round(cell.x))).toBeLessThanOrEqual(1)
  expect([placed.left, placed.right]).toEqual([0, 3])
})

/** Every domino. */
function dominoes(
  /** The page. */
  page: Page,
) {
  return page.getByRole("button", { name: /^Domino / })
}

/** One domino. */
function domino(
  /** The page. */
  page: Page,
  /** Its two counts, in the puzzle's order. */
  counts: string,
) {
  return page.getByRole("button", { name: `Domino ${counts}`, exact: true })
}

/** Wait for the dominoes to stop moving. */
async function settled(
  /** The page. */
  page: Page,
) {
  await expect
    .poll(() =>
      dominoes(page).evaluateAll(async elements => {
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        return elements.flatMap(element => element.getAnimations()).length
      }),
    )
    .toBe(0)
}

/** Where every domino lies, and the pips showing on each side of it. */
async function readTray(
  /** The page. */
  page: Page,
) {
  await settled(page)
  return dominoes(page).evaluateAll(elements =>
    elements.map(element => {
      const box = element.getBoundingClientRect()
      const middle = box.x + box.width / 2
      const pips = [...element.querySelectorAll("circle")].map(pip => {
        const { x, width } = pip.getBoundingClientRect()
        return x + width / 2
      })
      return {
        name: element.getAttribute("aria-label"),
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(box.height),
        left: pips.filter(x => x < middle).length,
        right: pips.filter(x => x > middle).length,
      }
    }),
  )
}

/** Drag a domino by its center to a point. */
async function dragTo(
  /** The page. */
  page: Page,
  /** The domino. */
  target: Locator,
  /** The desired center. */
  to: [number, number],
) {
  const box = (await target.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(...to, { steps: 8 })
  await page.mouse.up()
  await settled(page)
}

// CONSTANTS

/** Dominoes out of order, some with the larger number first. */
const DOMINOES: Domino[] = [
  [6, 1],
  [3, 0],
  [4, 4],
  [5, 2],
  [0, 6],
  [1, 2],
  [5, 3],
  [2, 2],
]

/** A made-up board with room for them all and no rules. */
const PUZZLE: Omit<PipsPuzzle, "date"> = {
  editor: "Test Editor",
  board: {
    id: 2,
    constructors: "Test",
    dominoes: DOMINOES,
    regions: [
      {
        type: "empty",
        cells: Array.from({ length: 16 }, (_, i): Cell => [Math.floor(i / 4), i % 4]),
      },
    ],
    solution: [],
  },
}
