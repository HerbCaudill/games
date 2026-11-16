import type { LetterBoxedPuzzle } from "@/types"
import { usedLetters, type LetterBoxedState } from "./letterBoxedRules"

/** The square with three letters on each side and the paths drawn between them. */
export function LetterBox({ puzzle, state, onLetter }: Props) {
  const spots = new Map(
    puzzle.sides.flatMap((side, s) => [...side].map((letter, i) => [letter, spot(s, i)] as const)),
  )
  const used = usedLetters(state)
  const path = (word: string) => [...word].map(l => spots.get(l)!.join(",")).join(" ")
  const last = state.current.at(-1)

  return (
    <svg
      viewBox="-24 -24 148 148"
      className="w-[min(22rem,88vw)] select-none"
      role="group"
      aria-label="Letters"
    >
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        className="fill-card stroke-foreground"
        strokeWidth="1.5"
      />
      {state.words.map((word, i) => (
        <polyline
          key={i}
          points={path(word)}
          className="fill-none stroke-(--game-letter-boxed)"
          strokeWidth="1.6"
          strokeLinejoin="round"
          opacity={0.55}
        />
      ))}
      {state.current.length > 1 && (
        <polyline
          points={path(state.current)}
          className="fill-none stroke-(--game-letter-boxed)"
          strokeWidth="1.6"
          strokeDasharray="3 2"
          strokeLinejoin="round"
        />
      )}
      {[...spots].map(([letter, [x, y]]) => {
        const [lx, ly] = labelSpot(x, y)
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
            <circle cx={(x + lx) / 2} cy={(y + ly) / 2} r="11" fill="transparent" />
            <circle
              cx={x}
              cy={y}
              r={letter === last ? 4 : 3.2}
              className={
                isUsed
                  ? "fill-(--game-letter-boxed) stroke-(--game-letter-boxed)"
                  : "fill-card stroke-foreground"
              }
              strokeWidth="1.2"
            />
            <text
              x={lx}
              y={ly}
              dy="3.6"
              textAnchor="middle"
              className={isUsed ? "fill-muted-foreground" : "fill-foreground"}
              style={{ font: "600 10.5px var(--font-sans)" }}
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
  const along = 25 * (i + 1)
  return (
    [
      [along, 0],
      [100, along],
      [along, 100],
      [0, along],
    ] as [number, number][]
  )[side]
}

/** Where a letter's label sits, just outside its dot. */
function labelSpot(
  /** Dot x. */
  x: number,
  /** Dot y. */
  y: number,
): [number, number] {
  if (y === 0) return [x, -12]
  if (y === 100) return [x, 112]
  if (x === 0) return [-13, y]
  return [113, y]
}

type Props = {
  /** The puzzle. */
  puzzle: LetterBoxedPuzzle
  /** Current progress. */
  state: LetterBoxedState
  /** Called when a letter is tapped. */
  onLetter: (letter: string) => void
}
