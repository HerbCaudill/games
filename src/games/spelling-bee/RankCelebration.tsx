import { useEffect, type CSSProperties } from "react"
import "./rank-celebration.css"

/**
 * A tiny burst around the rank name when the player reaches a new rank: a ring and a few sparkles
 * in the game's color. Place it inside the name's box; it calls `onDone` once it has played.
 */
export function RankCelebration(
  /** The component props. */
  { onDone }: Props,
) {
  useEffect(() => {
    const timer = setTimeout(onDone, DURATION_MS)
    return () => clearTimeout(timer)
  }, [onDone])
  return (
    <span data-rank-celebration className="rank-celebration" aria-hidden="true">
      <span className="rank-celebration-ring" />
      {SPARKLES.map(({ from, to, color }, i) => (
        <span
          key={i}
          className="rank-celebration-sparkle"
          style={
            {
              "--from-x": from[0],
              "--from-y": from[1],
              "--to-x": to[0],
              "--to-y": to[1],
              background: color,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}

// CONSTANTS

/** How long the burst plays, matching the longest animation in rank-celebration.css. */
const DURATION_MS = 800

/** Each sparkle starts just outside the name and flies a little farther out, clear of the letters. */
const SPARKLES = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * 2 * Math.PI + 0.3
  const [cos, sin] = [Math.cos(angle).toFixed(3), Math.sin(angle).toFixed(3)]
  const at = (gap: number) => [
    `calc(${cos} * (50cqw + ${gap + 4}px))`,
    `calc(${sin} * (50cqh + ${gap}px))`,
  ]
  return {
    from: at(4),
    to: at(16),
    color: `color-mix(in oklab, var(--game-spelling-bee), ${i % 2 ? "black 20%" : "white 0%"})`,
  }
})

// TYPES

type Props = {
  /** Called once the burst has played. */
  onDone: () => void
}
