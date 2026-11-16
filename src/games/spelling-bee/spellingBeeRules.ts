import type { SpellingBeePuzzle } from "@/types"

/** Score one word: one point at four letters, otherwise one per letter, plus seven for a pangram. */
export function scoreWord(
  /** The word, lowercase. */
  word: string,
  /** The puzzle. */
  puzzle: SpellingBeePuzzle,
) {
  const base = word.length === 4 ? 1 : word.length
  return puzzle.pangrams.includes(word) ? base + 7 : base
}

/** Add up the score for a list of words. */
export function totalScore(
  /** Words found so far. */
  words: string[],
  /** The puzzle. */
  puzzle: SpellingBeePuzzle,
) {
  return words.reduce((sum, word) => sum + scoreWord(word, puzzle), 0)
}

/** Decide whether a guess counts, and why not if it doesn't. */
export function checkGuess(
  /** What the player typed. */
  guess: string,
  /** The puzzle. */
  puzzle: SpellingBeePuzzle,
  /** Words already found. */
  found: string[],
): GuessResult {
  const word = guess.toLowerCase()
  const letters = new Set([puzzle.center, ...puzzle.outer])
  if (word.length < 4) return { ok: false, message: "Too short" }
  if ([...word].some(letter => !letters.has(letter))) return { ok: false, message: "Bad letters" }
  if (!word.includes(puzzle.center)) return { ok: false, message: "Missing center letter" }
  if (!puzzle.answers.includes(word)) return { ok: false, message: "Not in word list" }
  if (found.includes(word)) return { ok: false, message: "Already found" }
  return { ok: true, word, score: scoreWord(word, puzzle), pangram: puzzle.pangrams.includes(word) }
}

/** Find the player's rank and the next one up. */
export function rankFor(
  /** Current score. */
  score: number,
  /** The puzzle. */
  puzzle: SpellingBeePuzzle,
): Rank {
  const max = totalScore(puzzle.answers, puzzle)
  const ranks = RANKS.map(([name, share]) => ({ name, score: Math.round(share * max) }))
  const index = ranks.findLastIndex(rank => score >= rank.score)
  return { name: ranks[index].name, next: ranks[index + 1], ranks, max }
}

// CONSTANTS

/** Rank names and the share of the maximum score each needs. */
const RANKS: [string, number][] = [
  ["Beginner", 0],
  ["Good Start", 0.02],
  ["Moving Up", 0.05],
  ["Good", 0.08],
  ["Solid", 0.15],
  ["Nice", 0.25],
  ["Great", 0.4],
  ["Amazing", 0.5],
  ["Genius", 0.7],
  ["Queen Bee", 1],
]

// TYPES

/** The outcome of a guess. */
export type GuessResult =
  | { ok: true; word: string; score: number; pangram: boolean }
  | { ok: false; message: string }

/** A player's standing. */
export type Rank = {
  /** Current rank name. */
  name: string
  /** The next rank and the score it needs. */
  next?: { name: string; score: number }
  /** Every rank with its score threshold. */
  ranks: { name: string; score: number }[]
  /** The maximum possible score. */
  max: number
}
