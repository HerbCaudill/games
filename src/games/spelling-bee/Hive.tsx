import { useEffect, useState, type CSSProperties } from "react"
import { cn } from "@/lib/utils"
import "./pangram-celebration.css"

/**
 * The seven letter cells, center letter in the middle. A new order of outer letters fades in after
 * the old one fades out.
 *
 * Given a pangram to celebrate, the hive spells it out: each cell lights up gold in the order the
 * word first uses its letter, the whole hive pulses, honeycomb sparkles burst out, and the glow
 * fades. It calls `onPangramDone` once that has played.
 */
export function Hive(
  /** The component props. */
  { center, outer, onLetter, pangram, onPangramDone }: Props,
) {
  const [shown, setShown] = useState(outer)
  const fading = shown.join() !== outer.join()
  useEffect(() => {
    if (!fading) return
    const timer = setTimeout(() => setShown(outer), FADE_MS)
    return () => clearTimeout(timer)
  }, [fading, outer])
  useEffect(() => {
    if (!pangram || !onPangramDone) return
    const timer = setTimeout(onPangramDone, PANGRAM_MS)
    return () => clearTimeout(timer)
  }, [pangram, onPangramDone])
  // The order the pangram first uses each letter, which is the order the cells light up.
  const order = pangram ? [...new Set(pangram)] : []

  const cells = [{ letter: center, x: 0, y: 0, isCenter: true }].concat(
    shown.map((letter, i) => {
      const angle = ((-90 + 60 * i) * Math.PI) / 180
      return { letter, x: SPACING * Math.cos(angle), y: SPACING * Math.sin(angle), isCenter: false }
    }),
  )
  return (
    <svg
      viewBox="-3 -3.05 6 6.1"
      className="w-[min(18rem,80vw,36svh)] overflow-visible"
      role="group"
      aria-label="Letters"
      data-board
    >
      {pangram && (
        <g data-pangram-celebration className="pangram-burst" aria-hidden="true">
          <circle r={RING_RADIUS} className="pangram-ring" />
          {SPARKLES.map(({ angle, color }, i) => (
            <polygon
              key={i}
              points={hexPoints(0, 0, SPARKLE_RADIUS)}
              className="pangram-sparkle"
              style={
                {
                  "--from-x": `${Math.cos(angle) * SPARKLE_FROM}px`,
                  "--from-y": `${Math.sin(angle) * SPARKLE_FROM}px`,
                  "--to-x": `${Math.cos(angle) * SPARKLE_TO}px`,
                  "--to-y": `${Math.sin(angle) * SPARKLE_TO}px`,
                  fill: color,
                } as CSSProperties
              }
            />
          ))}
        </g>
      )}
      <g
        className={pangram ? "pangram-pulse" : undefined}
        style={{ transformOrigin: "0 0", transformBox: "view-box" }}
      >
        {cells.map(({ letter, x, y, isCenter }, i) => (
          <g
            // Keyed by place, so a letter's text fades in where the old one faded out.
            key={i}
            role="button"
            aria-label={letter.toUpperCase()}
            tabIndex={-1}
            className="cursor-pointer transition-transform active:scale-90"
            style={{ transformOrigin: `${x}px ${y}px`, transformBox: "view-box" }}
            onPointerDown={event => {
              event.preventDefault()
              onLetter(letter)
            }}
          >
            <polygon
              points={hexPoints(x, y, RADIUS)}
              className={isCenter ? "fill-(--game-spelling-bee)" : "fill-muted"}
            />
            {pangram && (
              <polygon
                data-pangram-glow
                points={hexPoints(x, y, RADIUS)}
                className="pangram-glow"
                style={
                  {
                    "--light-at": `${order.indexOf(letter) * PANGRAM_STEP_MS}ms`,
                    transformOrigin: `${x}px ${y}px`,
                    transformBox: "view-box",
                  } as CSSProperties
                }
              />
            )}
            <text
              x={x}
              y={y}
              dy="0.36em"
              textAnchor="middle"
              className={cn(isCenter ? "fill-black" : "fill-foreground", pangram && "pangram-ink")}
              style={
                {
                  "--light-at": `${order.indexOf(letter) * PANGRAM_STEP_MS}ms`,
                  font: `700 ${FONT_SIZE}px var(--font-sans)`,
                  textTransform: "uppercase",
                  opacity: fading && !isCenter ? 0 : 1,
                  transition: `opacity ${FADE_MS}ms ease-in-out`,
                } as CSSProperties
              }
            >
              {letter}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}

/** The corners of a flat-topped hexagon, as an SVG points list. */
function hexPoints(
  /** Center x. */
  x: number,
  /** Center y. */
  y: number,
  /** Distance from the center to each corner. */
  radius: number,
) {
  return [0, 60, 120, 180, 240, 300]
    .map(deg => {
      const a = (deg * Math.PI) / 180
      return `${x + radius * Math.cos(a)},${y + radius * Math.sin(a)}`
    })
    .join(" ")
}

// CONSTANTS

/** How long the outer letters take to fade out, and then back in, when shuffled. */
const FADE_MS = 150

/** Hexagon radius. */
const RADIUS = 0.98

/** Letter size: capitals 0.4 of the hexagon's radius tall, as in the NYT hive. */
const FONT_SIZE = 0.56

/** Distance between neighboring cell centers, leaving a small gap. */
const SPACING = Math.sqrt(3) * 1.05

/** Time between one cell lighting up for a pangram and the next. Matches pangram-celebration.css. */
const PANGRAM_STEP_MS = 110

/** How long the pangram celebration plays, matching the end of the glow's fade in pangram-celebration.css. */
const PANGRAM_MS = 1900

/** The ring that spreads from the hive as it bursts, just around the outer cells. */
const RING_RADIUS = 2.9

/** Size of each honeycomb sparkle. */
const SPARKLE_RADIUS = 0.17

/** Sparkles start just outside the hive and fly well clear of it. */
const SPARKLE_FROM = 2.7
const SPARKLE_TO = 4.3

/** Honeycomb sparkles all around the hive, in lighter and darker golds. */
const SPARKLES = Array.from({ length: 18 }, (_, i) => ({
  angle: (i / 18) * 2 * Math.PI + 0.15,
  color: `color-mix(in oklab, var(--game-spelling-bee), ${["white 0%", "black 20%", "white 40%"][i % 3]})`,
}))

// TYPES

type Props = {
  /** The required letter. */
  center: string
  /** The other six letters, in display order. */
  outer: string[]
  /** Called when a letter is tapped. */
  onLetter: (letter: string) => void
  /** A pangram to celebrate, when the player's first word is one. */
  pangram?: string
  /** Called once the pangram celebration has played. */
  onPangramDone?: () => void
}
