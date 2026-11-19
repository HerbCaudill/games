import type { Page } from "@playwright/test"
import type { GameId, PuzzleFor, SpellingBeeHints, SpellingBeeStats } from "../src/types"

/** Serve the test puzzles, the Spelling Bee's hints and stats, and an empty NYT account, in place of the API. */
export async function mockApi(
  /** The Playwright page to intercept requests on. */
  page: Page,
) {
  await page.route("**/api/**", route => {
    const [, , resource, date] = new URL(route.request().url()).pathname.split("/")
    // Nothing is saved in the test account, and saves go nowhere.
    if (resource.endsWith("-progress"))
      return route.fulfill({
        json: route.request().method() === "PUT" ? { saved: true } : { progress: null },
      })
    if (resource === "spelling-bee-hints")
      return route.fulfill({ json: { date, hints: HINTS } satisfies SpellingBeeHints })
    if (resource === "spelling-bee-stats") return route.fulfill({ json: STATS })
    const puzzle = PUZZLES[resource as GameId]
    return route.fulfill({ json: { ...puzzle, date } })
  })
}

// CONSTANTS

/** Clues for the test Spelling Bee. */
const HINTS = { moat: "Castle ring", torah: "Scroll in an ark", bathroom: "Where the tub is" }

/** Player stats for the test Spelling Bee. */
const STATS: SpellingBeeStats = { players: 1234, found: { moat: 0.9, torah: 0.6, bathroom: 0.4 } }

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
      { id: 0, direction: "across", label: "1", text: "Feline", cells: [0, 1, 2], related: [] },
      { id: 1, direction: "across", label: "3", text: "Damp", cells: [6, 7, 8], related: [] },
      { id: 2, direction: "down", label: "1", text: "Bovine", cells: [0, 3, 6], related: [] },
      { id: 3, direction: "down", label: "2", text: "Toddler", cells: [2, 5, 8], related: [] },
    ],
  },
  pips: {
    editor: "Test Editor",
    board: {
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
