import type { CSSProperties } from "react"
import type { LetterBoxedPuzzle } from "@/types"
import { cn } from "@/lib/utils"
import { usedLetters } from "./logic/usedLetters"
import { type LetterBoxedState } from "./logic/types"

/** The white square with three letters on each side and the paths drawn between them. */
export function LetterBox(
  /** The component props. */
  { puzzle, state, onLetter, acceptedWordIndex }: Props,
) {
  const spots = new Map(
    puzzle.sides.flatMap((side, s) => [...side].map((letter, i) => [letter, spot(s, i)] as const)),
  )
  const used = usedLetters(state)
  const path = (word: string) => [...word].map(l => spots.get(l)!.join(",")).join(" ")
  const count = state.words.length

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full select-none"
      role="group"
      aria-label="Letters"
      data-board
    >
      <rect
        x={ORIGIN}
        y={ORIGIN}
        width={SQUARE}
        height={SQUARE}
        fill="white"
        stroke="black"
        strokeWidth={STROKE}
      />
      {state.current.length > 1 && (
        <polyline
          points={path(state.current)}
          className="fill-none stroke-(--letter-boxed-background)"
          strokeWidth={STROKE * 1.5}
          strokeDasharray={STROKE * 3}
        />
      )}
      {state.words.map((word, i) => (
        <polyline
          key={i}
          points={path(word)}
          className={cn(
            "letter-boxed-path fill-none stroke-(--letter-boxed-background)",
            i === acceptedWordIndex && "letter-boxed-accepted-path",
          )}
          // Older words fade so the chain reads from faint to strong.
          style={{ "--path-opacity": 0.8 - (0.6 / count) * (count - i) } as CSSProperties}
          pathLength="1"
          strokeWidth={STROKE * 1.5}
        />
      ))}
      {[...spots].map(([letter, [x, y]]) => {
        const [dx, dy, anchor] = labelOffset(x, y)
        const isUsed = used.has(letter)
        return (
          <g
            key={letter}
            role="button"
            aria-label={letter}
            className="cursor-pointer"
            onPointerDown={event => {
              event.preventDefault()
              onLetter(letter)
            }}
          >
            {/* A generous invisible hit area around the dot and its label. */}
            <circle cx={x + dx / 2} cy={y + dy / 2} r="7.5" fill="transparent" />
            <circle
              cx={x}
              cy={y}
              r={DOT}
              fill={isUsed ? "black" : "white"}
              stroke={isUsed ? "white" : "black"}
              strokeWidth={STROKE}
            />
            <text
              x={x + dx}
              y={y + dy}
              textAnchor={anchor}
              fill={isUsed ? "black" : "white"}
              style={{ font: `600 ${LETTER}px var(--font-mono)` }}
            >
              {letter}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Where a letter's dot sits: sides go top, right, bottom, left, each read left to right or top to bottom. */
function spot(
  /** Side index. */
  side: number,
  /** Position along the side. */
  i: number,
): [number, number] {
  const along = ORIGIN + (SQUARE * (2 * i + 1)) / 6
  const near = ORIGIN
  const far = ORIGIN + SQUARE
  return (
    [
      [along, near],
      [far, along],
      [along, far],
      [near, along],
    ] as [number, number][]
  )[side]
}

/** Where a letter's label sits relative to its dot, just outside the square, and how it aligns. */
function labelOffset(
  /** Dot x. */
  x: number,
  /** Dot y. */
  y: number,
): [number, number, "start" | "middle" | "end"] {
  const gap = LETTER * 0.7
  if (y === ORIGIN) return [0, -gap, "middle"]
  if (y === ORIGIN + SQUARE) return [0, gap * 2, "middle"]
  if (x === ORIGIN) return [-gap, gap / 2, "end"]
  return [gap, gap / 2, "start"]
}

// CONSTANTS

/** The square's side, in a 100-unit view box. */
const SQUARE = 70

/** Where the square starts. */
const ORIGIN = (100 - SQUARE) / 2

/** Letter size. */
const LETTER = 8

/** Radius of each letter's dot. */
const DOT = LETTER * 0.3

/** Line width for the square, dots and paths. */
const STROKE = LETTER * 0.135

// TYPES

type Props = {
  /** The puzzle. */
  puzzle: LetterBoxedPuzzle
  /** Current progress. */
  state: LetterBoxedState
  /** Called when a letter is tapped. */
  onLetter: (letter: string) => void
  /** Word submitted this visit; restored progress stays still. */
  acceptedWordIndex: number | null
}
