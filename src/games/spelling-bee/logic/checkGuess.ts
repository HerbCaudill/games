import { scoreWord } from "./scoreWord"
import type { GuessResult } from "./types"
import type { SpellingBeePuzzle } from "@/types"

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
