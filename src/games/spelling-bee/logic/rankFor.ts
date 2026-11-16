import { totalScore } from "./totalScore"
import type { Rank } from "./types"
import type { SpellingBeePuzzle } from "@/types"

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
