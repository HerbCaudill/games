import { useLayoutEffect, useRef, useState, type PointerEvent } from "react"
import { cn } from "@/lib/utils"
import type { Cell, PipsBoard } from "@/types"
import { DominoTile } from "./DominoTile"
import { PipsGrid } from "./PipsGrid"
import { boardCells } from "./logic/boardCells"
import { directionOf } from "./logic/directionOf"
import { tableLayout } from "./logic/tableLayout"
import { turnTo } from "./logic/turnTo"
import type { Placements, Point } from "./logic/types"

/**
 * The board and the tray of dominoes, at one scale. Drag a domino anywhere to move it; tap it to turn it.
 */
export function PipsTable(
  /** The component props. */
  { board, placements, turns, spots, solved, cursor, selected, onTap, onDrop }: Props,
) {
  const space = useRef<HTMLDivElement>(null)
  const [room, setRoom] = useState({ width: 0, height: 0, left: 0, top: 0, contentTop: 0 })
  const [drag, setDrag] = useState<{ index: number; offset: Point }>()
  const pointer = useRef<{ index: number; id: number; start: Point; moved: boolean }>(undefined)

  useLayoutEffect(() => {
    const el = space.current!
    const measure = () => {
      const { left, top } = el.getBoundingClientRect()
      const content = el.closest("main")
      setRoom({
        width: el.clientWidth,
        // Scrolling moves the table, but must not change its scale.
        height: window.innerHeight - top - (content?.scrollTop ?? 0) - BOTTOM_ROOM,
        left,
        top,
        contentTop: content?.getBoundingClientRect().top ?? 0,
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    window.addEventListener("resize", measure)
    window.addEventListener("scroll", measure, true)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
      window.removeEventListener("scroll", measure, true)
    }
  }, [])

  const cells = boardCells(board)
  const layout = tableLayout({
    ...room,
    rows: Math.max(...cells.map(([r]) => r)) + 1,
    cols: Math.max(...cells.map(([, c]) => c)) + 1,
    count: board.dominoes.length,
  })
  const { size, board: origin, slots } = layout

  /** Keep the whole domino inside the viewport, including after rotation or resize. */
  const inBounds = ([x, y]: Point, turn: number): Point => {
    const [hx, hy] = upright(turn) ? [0.5, 1] : [1, 0.5]
    const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)
    return [
      clamp(
        x,
        hx - (room.left + origin[0]) / size,
        (window.innerWidth - room.left - origin[0]) / size - hx,
      ),
      clamp(
        y,
        hy + (room.contentTop - room.top - origin[1]) / size,
        (window.innerHeight - room.top - origin[1]) / size - hy,
      ),
    ]
  }

  /** Where a domino's center is, in cell units from the board's corner. */
  const centerOf = (i: number): Point => {
    const pair = placements[i]
    if (!pair) return inBounds(spots[i] ?? slots[i], turns[i] ?? 0)
    const [a, b] = pair
    return [(a[1] + b[1]) / 2 + 0.5, (a[0] + b[0]) / 2 + 0.5]
  }

  const down = (event: PointerEvent, index: number) => {
    if (solved || pointer.current) return
    event.currentTarget.setPointerCapture(event.pointerId)
    pointer.current = {
      index,
      id: event.pointerId,
      start: [event.clientX, event.clientY],
      moved: false,
    }
  }

  const move = (event: PointerEvent) => {
    const p = pointer.current
    if (!p || p.id !== event.pointerId) return
    const offset: Point = [event.clientX - p.start[0], event.clientY - p.start[1]]
    if (!p.moved && Math.hypot(...offset) < TAP_SLOP) return
    p.moved = true
    setDrag({ index: p.index, offset })
  }

  const up = (event: PointerEvent) => {
    const p = pointer.current
    if (!p || p.id !== event.pointerId) return
    pointer.current = undefined
    setDrag(undefined)
    if (!p.moved) return onTap(p.index)
    const [x, y] = centerOf(p.index)
    const offset = [event.clientX - p.start[0], event.clientY - p.start[1]]
    const turn = placements[p.index] ? directionOf(placements[p.index]!) : (turns[p.index] ?? 0)
    onDrop(p.index, inBounds([x + offset[0] / size, y + offset[1] / size], turn))
  }

  const cancel = () => {
    pointer.current = undefined
    setDrag(undefined)
  }

  return (
    <div ref={space} className="w-full">
      {room.width > 0 && (
        <div className="relative" style={{ height: solved ? layout.boardHeight : layout.height }}>
          <PipsGrid
            board={board}
            placements={placements}
            layer="base"
            size={size}
            origin={origin}
          />

          {!solved &&
            slots.map(([x, y], i) => (
              <div
                key={i}
                className="bg-muted absolute rounded-md"
                style={{
                  left: origin[0] + (x - 1) * size + INSET,
                  top: origin[1] + (y - 0.5) * size + INSET,
                  width: 2 * size - 2 * INSET,
                  height: size - 2 * INSET,
                }}
              />
            ))}

          {board.dominoes.map((domino, i) => {
            const [x, y] = centerOf(i)
            const pair = placements[i]
            const turn = pair ? turnTo(turns[i] ?? 0, directionOf(pair)) : (turns[i] ?? 0)
            const dragging = drag?.index === i
            const [dx, dy] = dragging ? drag.offset : [0, 0]
            return (
              <button
                key={i}
                type="button"
                tabIndex={-1}
                aria-label={`Domino ${domino.join("–")}`}
                className={cn(
                  // Fixed positioning lets loose dominoes escape the content scroller without enlarging it.
                  "fixed touch-none rounded-[14%/28%] outline-none",
                  solved
                    ? "z-10"
                    : dragging
                      ? "z-30 cursor-grabbing drop-shadow-lg"
                      : "z-10 cursor-grab",
                  !dragging && "transition-[left,top,transform] duration-150 ease-out",
                  i === selected && "ring-3 ring-(--game-pips)",
                )}
                style={{
                  left: room.left + origin[0] + (x - 1) * size,
                  top: room.top + origin[1] + (y - 0.5) * size,
                  width: 2 * size,
                  height: size,
                  transform: `translate(${dx}px, ${dy}px) rotate(${turn * 90}deg)`,
                }}
                onPointerDown={event => down(event, i)}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={cancel}
              >
                <DominoTile domino={domino} />
              </button>
            )
          })}

          <PipsGrid
            board={board}
            placements={placements}
            layer="overlay"
            size={size}
            origin={origin}
            cursor={cursor}
          />
        </div>
      )}
    </div>
  )
}

/** Whether a turn count leaves a domino standing upright. */
function upright(
  /** Quarter turns. */
  turn: number,
) {
  return Math.abs(turn) % 2 === 1
}

// CONSTANTS

/** How far a pointer can move, in pixels, and still count as a tap. */
const TAP_SLOP = 6

/** Space kept free below the table, in pixels. */
const BOTTOM_ROOM = 16

/** How far an empty tray slot sits inside its domino's outline, in pixels. */
const INSET = 2

// TYPES

type Props = {
  /** The board. */
  board: PipsBoard
  /** Where each domino sits on the board. */
  placements: Placements
  /** Quarter turns clockwise for each domino. */
  turns: number[]
  /** Where each loose domino lies, in cell units from the board's corner; empty when it is in its tray slot. */
  spots: (Point | null | undefined)[]
  /** Whether the board is solved, which stops play. */
  solved: boolean
  /** The keyboard cursor, when the keyboard is in use. */
  cursor?: Cell
  /** The domino picked with the keyboard, when the keyboard is in use. */
  selected?: number
  /** Called when a domino is tapped. */
  onTap: (index: number) => void
  /** Called when a domino is dragged and dropped, with its center in cell units from the board's corner. */
  onDrop: (index: number, center: Point) => void
}
