import { useEffect, useState, type CSSProperties } from "react"
import { GAMES } from "@/constants"
import type { GameId } from "@/types"
import "./completion-celebration.css"

/**
 * Shared, nonblocking celebration for every game's completion. The game's color floods out from
 * the middle of the board, fills the screen and drains away; as it passes the solved message,
 * rings and sparkles in lighter and darker versions of that color burst from it. Each game shows
 * its own solved message.
 */
export function CompletionCelebration(
  /** No external configuration. */
  _props: Props,
) {
  const [celebration, setCelebration] = useState<Celebration>()
  useEffect(() => {
    let count = 0
    const celebrate = (event: Event) =>
      setCelebration(measure(++count, (event as CustomEvent<GameId | undefined>).detail))
    window.addEventListener("game-completed", celebrate)
    return () => window.removeEventListener("game-completed", celebrate)
  }, [])
  useEffect(() => {
    if (!celebration) return
    // While it plays, the game's own backgrounds step aside so the flood shows behind the board.
    const root = document.documentElement
    root.dataset.celebrating = ""
    const timer = window.setTimeout(() => setCelebration(undefined), DURATION + 200)
    return () => {
      window.clearTimeout(timer)
      delete root.dataset.celebrating
    }
  }, [celebration])

  if (!celebration) return null
  const { id, origin, reach, message, color, background } = celebration
  const tints = TINTS.map(white => `color-mix(in oklab, ${color}, white ${white}%)`)
  const shades = SHADES.map(black => `color-mix(in oklab, ${color}, black ${black}%)`)
  const rings = [tints[2], shades[1], tints[1]]
  const sparkleColors = [...tints, ...shades]
  return (
    <div key={id} data-celebration className="completion-celebration" aria-hidden="true">
      <div className="completion-flood-layer" style={{ background }}>
        <div
          data-celebration-part="flood"
          className="completion-flood"
          style={{
            left: origin.x - reach,
            top: origin.y - reach,
            width: reach * 2,
            height: reach * 2,
            background: color,
          }}
        />
        <div className="completion-echo" style={{ left: origin.x, top: origin.y }} />
      </div>
      {message && (
        <div
          data-celebration-part="halo"
          className="completion-halo"
          style={{
            left: message.x - message.width / 2,
            top: message.y - message.height / 2,
            width: message.width,
            height: message.height,
          }}
        >
          {rings.map((ring, i) => (
            <span
              key={i}
              className="completion-ring"
              style={
                {
                  borderColor: ring,
                  borderWidth: 2.5 - i * 0.6,
                  animationDelay: `${HALO_DELAY + 160 + i * 140}ms`,
                  animationDuration: `${800 + i * 150}ms`,
                  "--ring-grow": `${46 + i * 34}px`,
                } as CSSProperties
              }
            />
          ))}
          {Array.from({ length: SPARKLES }, (_, i) => {
            const angle = (i / SPARKLES) * Math.PI * 2 + (noise(i, 1) - 0.5) * 0.3
            const [ux, uy] = [Math.cos(angle), Math.sin(angle)]
            const distance = 28 + noise(i, 2) * 42
            const size = 14 + noise(i, 3) * 12
            return (
              <svg
                key={i}
                viewBox="0 0 24 24"
                className="completion-sparkle"
                style={
                  {
                    left: message.width / 2 + ux * (message.width / 2 - 8) - size / 2,
                    top: message.height / 2 + uy * (message.height / 2) - size / 2,
                    width: size,
                    height: size,
                    color: sparkleColors[i % sparkleColors.length],
                    animationDelay: `${HALO_DELAY + 200 + noise(i, 4) * 140}ms`,
                    animationDuration: `${900 + noise(i, 5) * 250}ms`,
                    "--sparkle-x": `${ux * distance}px`,
                    "--sparkle-y": `${uy * distance}px`,
                  } as CSSProperties
                }
              >
                <path d={SPARKLE} fill="currentColor" />
              </svg>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Where the celebration plays, read from the page at the moment the puzzle is solved. */
function measure(
  /** Distinguishes this celebration from the last, so a repeat restarts it. */
  id: number,
  /** The game that was completed. */
  game: GameId | undefined,
): Celebration {
  const board = document.querySelector("[data-board]")?.getBoundingClientRect()
  const origin = board
    ? { x: board.left + board.width / 2, y: board.top + board.height / 2 }
    : { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  // Reach the farthest corner of the screen and no farther, so the spread reads as coming from the board.
  const reach = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  )
  const element = document.querySelector<HTMLElement>("[data-solved-message]")
  const rect = element?.getBoundingClientRect()
  // The message may still be zooming in, so take its center from the screen and its size from layout.
  const message =
    element && rect
      ? {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: element.offsetWidth,
          height: element.offsetHeight,
        }
      : undefined
  const shell = document.querySelector(".app-shell")
  return {
    id,
    origin,
    reach,
    message,
    color: GAMES.find(g => g.id === game)?.color ?? "var(--solved)",
    background: shell ? getComputedStyle(shell).backgroundColor : "transparent",
  }
}

/** A repeatable number from 0 to 1, so the sparkles scatter the same way every time. */
function noise(
  /** Which sparkle. */
  i: number,
  /** Which of the sparkle's properties. */
  salt: number,
) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

// CONSTANTS

/** How long the flood takes from start to finish, in milliseconds; matches the stylesheet. */
const DURATION = 2200

/** How long the halo waits for the flood to reach the solved message, in milliseconds. */
const HALO_DELAY = 420

/** Number of sparkles around the solved message. */
const SPARKLES = 18

/** Percentages of white in the lighter versions of the game's color. */
const TINTS = [35, 60, 85]

/** Percentages of black in the darker versions of the game's color. */
const SHADES = [20, 38, 55]

/** A four-pointed sparkle, in a 24-unit square. */
const SPARKLE = "M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z"

// TYPES

/** One celebration's placement and colors. */
type Celebration = {
  /** Distinguishes this celebration from the last. */
  id: number
  /** The middle of the board, where the flood starts. */
  origin: { x: number; y: number }
  /** The flood's final radius. */
  reach: number
  /** The solved message's center and size, if it is showing. */
  message?: { x: number; y: number; width: number; height: number }
  /** The game's color, as a CSS value. */
  color: string
  /** The game screen's own background, which shows wherever the flood isn't. */
  background: string
}

type Props = Record<string, never>
