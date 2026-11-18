import { z } from "zod"
import { MAX_MISTAKES } from "../src/games/connections/logic/constants.ts"
import type { ConnectionsPuzzle } from "../src/types.ts"
import type { ProgressFormat } from "./types.ts"

/** Connections progress in NYT's state API: each guess as four cards, plus the outcome so far. */
export const connectionsProgress: ProgressFormat<"connections"> = {
  nytGame: "connections",
  schema: z.object({ guesses: z.array(z.array(z.string()).length(4)) }),
  fromNyt: ({ game_data }, puzzle) => {
    const data = game_data as Partial<ConnectionsData>
    return {
      guesses: (data.guesses ?? []).map(guess => guess.cards.map(c => puzzle.layout[c.position])),
    }
  },
  toNyt: ({ guesses }, puzzle, previous) => {
    const nytGuesses = guesses.map(words => {
      // NYT lists each guess's cards in board order.
      const cards = words.map(word => cardFor(word, puzzle)).sort((a, b) => a.position - b.position)
      return { cards, correct: cards.every(card => card.level === cards[0].level) }
    })
    const solvedCategories = nytGuesses
      .filter(guess => guess.correct)
      .map((guess, i) => ({ cards: guess.cards, level: guess.cards[0].level, orderSolved: i + 1 }))
    const mistakes = nytGuesses.filter(guess => !guess.correct).length
    const puzzleWon = solvedCategories.length === puzzle.groups.length
    return {
      isPlayingArchive: false,
      ...previous,
      guesses: nytGuesses,
      mistakes,
      puzzleComplete: puzzleWon || mistakes >= MAX_MISTAKES,
      puzzleWon,
      solvedCategories,
    }
  },
}

/** The card NYT uses for a word: its group's level and its starting position. */
function cardFor(
  /** The word. */
  word: string,
  /** The puzzle. */
  puzzle: ConnectionsPuzzle,
): Card {
  return {
    level: puzzle.groups.find(group => group.words.includes(word))!.level,
    position: puzzle.layout.indexOf(word),
  }
}

// TYPES

/** NYT's Connections record; the app writes the outcome fields from the guesses. */
type ConnectionsData = {
  /** Every guess, in order. */
  guesses: { cards: Card[]; correct: boolean }[]
}

/** A card in NYT's record. */
type Card = {
  /** Its group's difficulty, from 0 to 3. */
  level: number
  /** Its place on the starting board, from 0 to 15. */
  position: number
}
