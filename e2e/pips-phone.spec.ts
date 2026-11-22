import { expect, test } from "@playwright/test"
import type { Cell, Domino, PipsPuzzle } from "../src/types"
import { mockApi } from "./mockApi"

// An iPhone 17 Pro Max running the app from the home screen, less its status bar and home indicator.
test.use({ viewport: { width: 440, height: 860 } })

for (const { rows, cols, count, cell } of [
  { rows: 4, cols: 9, count: 15, cell: 45 },
  { rows: 8, cols: 6, count: 16, cell: 52 },
  { rows: 10, cols: 8, count: 16, cell: 45 },
])
  test(`fills an iPhone 17 Pro Max with a ${rows}×${cols} board and a turnable tray, without scrolling`, async ({
    page,
  }) => {
    await mockApi(page)
    const puzzle = puzzleOf(rows, cols, count)
    await page.route(/\/api\/pips\/[0-9-]+$/, route =>
      route.fulfill({ json: { ...puzzle, date: route.request().url().split("/").pop()! } }),
    )
    await page.goto("/pips")
    const dominoes = page.getByRole("button", { name: /^Domino / })
    await expect(dominoes).toHaveCount(count)

    const first = page.getByRole("gridcell", { name: "Row 1, column 1", exact: true })
    await expect
      .poll(async () => (await first.boundingBox())!.width)
      .toBeGreaterThanOrEqual(cell - 0.1)
    const scrolls = () =>
      page
        .locator("main")
        .evaluate(main => [
          main.scrollWidth - main.clientWidth,
          main.scrollHeight - main.clientHeight,
        ])
    expect(await scrolls()).toEqual([0, 0])

    // Turned upright, the bottom row still fits on screen.
    for (const domino of await dominoes.all()) await domino.click()
    await expect
      .poll(async () => {
        const boxes = await Promise.all((await dominoes.all()).map(d => d.boundingBox()))
        return boxes.every(
          box =>
            box!.height > box!.width &&
            box!.x >= 0 &&
            box!.x + box!.width <= 440 &&
            box!.y + box!.height <= 860,
        )
      })
      .toBe(true)
    expect(await scrolls()).toEqual([0, 0])
  })

/** A made-up puzzle whose board spans so many rows and columns, with room for so many dominoes. */
function puzzleOf(
  /** Rows the board spans. */
  rows: number,
  /** Columns the board spans. */
  cols: number,
  /** How many dominoes. */
  count: number,
): Omit<PipsPuzzle, "date"> {
  const all = Array.from({ length: rows * cols }, (_, i): Cell => [Math.floor(i / cols), i % cols])
  // The top row and left column set the span; the rest fill in from the top.
  const edge = all.filter(([r, c]) => r === 0 || c === 0)
  const cells = [...edge, ...all.filter(([r, c]) => r > 0 && c > 0)].slice(0, 2 * count)
  const dominoes = Array.from({ length: 7 }, (_, high) => high).flatMap(high =>
    Array.from({ length: high + 1 }, (_, low): Domino => [high, low]),
  )
  return {
    editor: "Test Editor",
    board: {
      id: 3,
      constructors: "Test",
      dominoes: dominoes.slice(0, count),
      regions: cells.map(c => ({ cells: [c], type: "sum", target: 1 })),
      solution: [],
    },
  }
}
