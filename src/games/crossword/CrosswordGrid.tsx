import type { CrosswordPuzzle } from "@/types"
import { clueAt } from "./logic/clueAt"
import { type CrosswordState } from "./logic/types"

/** The crossword grid, drawn to fill its container while keeping squares square. */
export function CrosswordGrid(
  /** The component props. */
  { puzzle, state, rebus, onCell }: Props,
) {
  const { width, height } = puzzle
  const word = new Set(clueAt(puzzle, state.cursor, state.direction)?.cells ?? [])
  return (
    <svg
      viewBox={`-0.5 -0.5 ${width * U + 1} ${height * U + 1}`}
      className="block touch-manipulation select-none"
      style={{ width: `min(100cqw, calc(100cqh * ${width / height}))` }}
      role="grid"
      aria-label="Crossword grid"
    >
      <rect width={width * U} height={height * U} className="fill-foreground" />
      {puzzle.cells.map((cell, i) => {
        if (!cell) return null
        const x = (i % width) * U
        const y = Math.floor(i / width) * U
        const isCursor = i === state.cursor
        const mark = state.marks[i]
        const entry = isCursor && rebus !== undefined ? rebus : state.entries[i]
        return (
          <g
            key={i}
            onPointerDown={event => (event.preventDefault(), onCell(i))}
            className="cursor-pointer"
          >
            <rect
              x={x}
              y={y}
              width={U}
              height={U}
              style={{
                fill: isCursor
                  ? "var(--xw-cursor)"
                  : word.has(i)
                    ? "var(--xw-word)"
                    : cell.shaded
                      ? "var(--xw-shade)"
                      : "var(--card)",
              }}
              className="stroke-foreground/70"
              strokeWidth="0.6"
            />
            {cell.circled && (
              <circle
                cx={x + U / 2}
                cy={y + U / 2}
                r={U / 2 - 0.6}
                className="stroke-foreground/60 fill-none"
                strokeWidth="0.6"
              />
            )}
            {cell.label && (
              <text
                x={x + 1}
                y={y + 3.4}
                style={{ font: `200 ${U * 0.28}px var(--font-sans)` }}
                className="fill-foreground"
              >
                {cell.label}
              </text>
            )}
            {mark === "revealed" && (
              <path d={`M${x + U - 3.2} ${y} h3.2 v3.2 z`} style={{ fill: "var(--xw-revealed)" }} />
            )}
            {entry && (
              <text
                x={x + U / 2}
                y={y + U * 0.82}
                textAnchor="middle"
                textLength={entry.length > 3 ? U - 2 : undefined}
                lengthAdjust="spacingAndGlyphs"
                style={{
                  font: `400 ${entry.length > 1 ? Math.max(2.6, 6.2 - entry.length) : U * 0.64}px var(--font-sans)`,
                  fill:
                    mark === "wrong"
                      ? "var(--xw-wrong)"
                      : mark === "revealed"
                        ? "var(--xw-revealed)"
                        : "var(--foreground)",
                }}
              >
                {entry}
              </text>
            )}
            {mark === "wrong" && (
              <line
                x1={x + 1}
                y1={y + U - 1}
                x2={x + U - 1}
                y2={y + 1}
                style={{ stroke: "var(--xw-wrong)" }}
                strokeWidth="0.5"
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

// CONSTANTS

/** Square size in SVG units. */
const U = 10

// TYPES

type Props = {
  /** The puzzle. */
  puzzle: CrosswordPuzzle
  /** Current progress. */
  state: CrosswordState
  /** Letters being typed into the current square in rebus mode. */
  rebus?: string
  /** Called when a square is tapped. */
  onCell: (cell: number) => void
}
