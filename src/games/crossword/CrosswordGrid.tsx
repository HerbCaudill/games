import { useEffect, useRef } from "react"
import type { CrosswordPuzzle } from "@/types"
import { clueAt } from "./logic/clueAt"
import { type CrosswordState } from "./logic/types"

/** The crossword grid, drawn to fill its container while keeping squares square. */
export function CrosswordGrid(
  /** The component props. */
  { puzzle, state, rebus, onCell, onRebus }: Props,
) {
  const { width, height } = puzzle
  const [w, h] = [width * U, height * U]
  const clue = clueAt(puzzle, state.cursor, state.direction)
  const word = new Set(clue?.cells ?? [])
  const related = new Set(clue?.related.flatMap(id => puzzle.clues[id].cells) ?? [])
  const hold = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const origin = useRef({ x: 0, y: 0 })

  /** Cancel a pending long press after release, scrolling or pointer cancellation. */
  const cancelHold = () => clearTimeout(hold.current)
  useEffect(() => cancelHold, [])

  return (
    <svg
      viewBox={`${-BORDER} ${-BORDER} ${w + 2 * BORDER} ${h + 2 * BORDER}`}
      className="block touch-manipulation select-none"
      style={{ width: `min(100cqw, calc(100cqh * ${(w + 2 * BORDER) / (h + 2 * BORDER)}))` }}
      role="grid"
      data-board
      tabIndex={0}
      aria-label="Crossword grid"
      onPointerUp={cancelHold}
      onPointerCancel={cancelHold}
      onPointerLeave={cancelHold}
      onPointerMove={event => {
        if (Math.hypot(event.clientX - origin.current.x, event.clientY - origin.current.y) > 10)
          cancelHold()
      }}
      onContextMenu={event => event.preventDefault()}
    >
      <rect width={w} height={h} style={{ fill: "var(--xw-block)" }} />
      {puzzle.cells.map((cell, i) => {
        if (!cell) return null
        const x = (i % width) * U
        const y = Math.floor(i / width) * U
        const isCursor = i === state.cursor
        const mark = state.marks[i]
        const entry = isCursor && rebus !== undefined ? rebus : state.entries[i]
        const highlighted = isCursor || word.has(i) || related.has(i)
        const ink = highlighted ? "var(--xw-highlight-foreground)" : "var(--foreground)"
        return (
          <g
            key={i}
            role="gridcell"
            aria-label={`Row ${Math.floor(i / width) + 1}, column ${(i % width) + 1}: ${entry || "empty"}${mark ? `, ${mark}` : ""}`}
            aria-selected={isCursor}
            aria-readonly={mark === "correct" || mark === "revealed"}
            onPointerDown={event => {
              event.preventDefault()
              event.currentTarget.ownerSVGElement?.focus()
              cancelHold()
              onCell(i)
              if (event.pointerType !== "touch") return
              origin.current = { x: event.clientX, y: event.clientY }
              hold.current = setTimeout(() => onRebus(i), 500)
            }}
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
                    : related.has(i)
                      ? "var(--xw-related)"
                      : cell.shaded
                        ? "var(--xw-shade)"
                        : "var(--card)",
              }}
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
                style={{ font: `200 ${U * 0.28}px var(--font-sans)`, fill: ink }}
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
                textLength={entry.length > 2 ? U - 1.6 : undefined}
                lengthAdjust="spacingAndGlyphs"
                style={{
                  font: `500 ${entry.length > 1 ? Math.max(3, 7 - entry.length * 0.7) : U * 0.64}px var(--font-sans)`,
                  fill:
                    mark === "wrong"
                      ? "var(--xw-wrong)"
                      : mark === "correct"
                        ? highlighted
                          ? "var(--xw-correct-highlight)"
                          : "var(--xw-correct)"
                        : mark === "revealed"
                          ? "var(--xw-revealed)"
                          : ink,
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
      <rect
        x={-BORDER / 2}
        y={-BORDER / 2}
        width={w + BORDER}
        height={h + BORDER}
        style={{ stroke: "var(--xw-block)" }}
        strokeWidth={BORDER}
        fill="none"
        pointerEvents="none"
      />
      {/* Lines run between black squares too, as in the printed grid. */}
      <path
        d={[
          ...Array.from({ length: height + 1 }, (_, r) => `M0 ${r * U}H${w}`),
          ...Array.from({ length: width + 1 }, (_, c) => `M${c * U} 0V${h}`),
        ].join("")}
        style={{ stroke: "var(--xw-line)" }}
        strokeWidth={LINE}
        pointerEvents="none"
      />
    </svg>
  )
}

// CONSTANTS

/** Square size in SVG units. */
const U = 10

/** Width of the lines between squares. */
const LINE = 0.5

/** Width of the thick border around the grid; the edge lines sit on its inner side. */
const BORDER = 1.2

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
  /** Start rebus entry after holding a touch cell. */
  onRebus: (cell: number) => void
}
