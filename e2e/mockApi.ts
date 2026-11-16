import type { Page } from "@playwright/test"
import type { GameId, PuzzleFor } from "../src/types"

/** Serve the test puzzles in place of the API. */
export async function mockApi(
  /** The Playwright page to intercept requests on. */
  page: Page,
) {
  await page.route("**/api/**", route => {
    const [, , game, date] = new URL(route.request().url()).pathname.split("/")
    const puzzle = PUZZLES[game as GameId]
    return route.fulfill({ json: { ...puzzle, date } })
  })
}

// CONSTANTS

/** Small made-up puzzles for each game, so tests never depend on NYT. */
const PUZZLES: { [G in GameId]: Omit<PuzzleFor[G], "date"> } = {
  crossword: {
    id: 1,
    constructors: ["Test Setter"],
    editor: "Test Editor",
    width: 3,
    height: 3,
    cells: [..."CATO#OWET"].map((answer, i) =>
      answer === "#"
        ? null
        : {
            answer,
            altAnswers: [],
            label: ({ 0: "1", 2: "2", 6: "3" } as Record<number, string>)[i],
            circled: false,
            shaded: false,
          },
    ),
    clues: [
      { id: 0, direction: "across", label: "1", text: "Feline", cells: [0, 1, 2] },
      { id: 1, direction: "across", label: "3", text: "Damp", cells: [6, 7, 8] },
      { id: 2, direction: "down", label: "1", text: "Bovine", cells: [0, 3, 6] },
      { id: 3, direction: "down", label: "2", text: "Toddler", cells: [2, 5, 8] },
    ],
  },
  pips: {
    editor: "Test Editor",
    boards: Object.fromEntries(
      (["easy", "medium", "hard"] as const).map(d => [
        d,
        {
          id: 1,
          constructors: "Test",
          dominoes: [
            [2, 1],
            [3, 1],
          ],
          regions: [
            {
              cells: [
                [0, 0],
                [0, 1],
              ],
              type: "sum",
              target: 5,
            },
            {
              cells: [
                [1, 0],
                [1, 1],
              ],
              type: "equals",
            },
          ],
          solution: [
            [
              [0, 0],
              [1, 0],
            ],
            [
              [0, 1],
              [1, 1],
            ],
          ],
        },
      ]),
    ) as PuzzleFor["pips"]["boards"],
  },
  "spelling-bee": {
    id: 1,
    editor: "Test Editor",
    center: "t",
    outer: ["a", "b", "h", "m", "o", "r"],
    answers: ["moat", "torah", "bathroom"],
    pangrams: ["bathroom"],
  },
  connections: {
    id: 1,
    editor: "Test Editor",
    groups: [
      { title: "FRUIT", words: ["APPLE", "PEAR", "PLUM", "FIG"], level: 0 },
      { title: "COLORS", words: ["RED", "BLUE", "GREEN", "PINK"], level: 1 },
      { title: "PETS", words: ["CAT", "DOG", "FISH", "BIRD"], level: 2 },
      { title: "TOOLS", words: ["SAW", "AXE", "AWL", "FILE"], level: 3 },
    ],
    layout: "APPLE RED CAT SAW PEAR BLUE DOG AXE PLUM GREEN FISH AWL FIG PINK BIRD FILE".split(" "),
  },
  "letter-boxed": {
    id: 1,
    editor: "Test Editor",
    sides: ["ABC", "DEF", "GHI", "JKL"],
    par: 2,
    solution: ["ADG", "GJBEHKCFIL"],
    dictionary: ["ADG", "GJBEHKCFIL", "GJA", "ADGJBEHKCFIL"],
  },
}
