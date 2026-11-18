import type { GameId } from "./types"

/** Keyboard shortcuts by screen, as shown in the keyboard reference. Keep in sync with the handlers. */
export const SHORTCUTS: Record<ShortcutContext, ShortcutGroup> = {
  global: {
    title: "Anywhere",
    keys: [
      [["?"], "Show keyboard shortcuts"],
      [["⌘", "["], "Go back"],
    ],
  },
  home: {
    title: "Games",
    keys: [[["1", "–", "5"], "Open a game"]],
  },
  crossword: {
    title: "Crossword",
    keys: [
      [["A", "–", "Z"], "Fill the square"],
      [["←", "↑", "↓", "→"], "Move, or turn to that direction"],
      [["Space"], "Switch between across and down"],
      [["Tab"], "Next clue"],
      [["⇧", "Tab"], "Previous clue"],
      [["⌫"], "Delete"],
      [["Esc"], "Start a rebus, or cancel rebus entry"],
      [["Enter"], "Save a rebus, or go to the next clue"],
    ],
  },
  pips: {
    title: "Pips",
    keys: [
      [["←", "↑", "↓", "→"], "Move around the board"],
      [["[", "]"], "Pick the previous or next domino"],
      [["R"], "Rotate the domino"],
      [["Enter"], "Place the domino, or pick up the one here"],
      [["⌫"], "Return the domino here to the tray"],
      [["E", "M", "H"], "Easy, medium or hard board"],
      [["⌘", "Z"], "Undo"],
      [["⇧", "⌘", "Z"], "Redo"],
    ],
  },
  "spelling-bee": {
    title: "Spelling Bee",
    keys: [
      [["A", "–", "Z"], "Type a letter"],
      [["Enter"], "Submit the word"],
      [["⌫"], "Delete a letter"],
      [["Space"], "Shuffle the letters"],
    ],
  },
  connections: {
    title: "Connections",
    keys: [
      [["Tab"], "Move between words"],
      [["Space"], "Select or deselect the word"],
      [["Enter"], "Submit four words"],
      [["S"], "Shuffle"],
      [["D"], "Deselect all"],
    ],
  },
  "letter-boxed": {
    title: "Letter Boxed",
    keys: [
      [["A", "–", "Z"], "Type a letter"],
      [["Enter"], "Submit the word"],
      [["⌫"], "Delete a letter"],
      [["Esc"], "Start over"],
    ],
  },
}

// TYPES

/** A screen with its own shortcuts. */
export type ShortcutContext = GameId | "home" | "global"

/** A titled list of key combinations and what they do. */
type ShortcutGroup = { title: string; keys: [string[], string][] }
