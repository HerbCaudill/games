import type { SpellingBeeStats } from "../src/types.ts"

/** Convert NYT's Spelling Bee player counts into the share of players who found each word. */
export function parseSpellingBeeStats(
  /** The parsed stats response. */
  raw: RawSpellingBeeStats,
): SpellingBeeStats {
  return {
    players: raw.numberOfUsers,
    // Answer counts come from a sample of `n` players, not from everyone.
    found: Object.fromEntries(
      Object.entries(raw.answers).map(([word, count]) => [word, raw.n ? count / raw.n : 0]),
    ),
  }
}

// TYPES

/** The parts of NYT's Spelling Bee stats feed this app reads. */
export type RawSpellingBeeStats = {
  /** How many players found each word, in the sample. */
  answers: Record<string, number>
  /** Sample size. */
  n: number
  /** Everyone who has played. */
  numberOfUsers: number
}
