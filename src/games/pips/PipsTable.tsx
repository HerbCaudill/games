import { useLayoutEffect, useRef, useState, type PointerEvent } from "react"
import { cn } from "@/lib/utils"
import type { Cell, PipsBoard } from "@/types"
import { DominoTile } from "./DominoTile"
import { dominoGeometry } from "./dominoGeometry"
import { PipsGrid } from "./PipsGrid"
import { directionOf } from "./logic/directionOf"
import { halfRegions } from "./logic/halfRegions"
import { isOverBoard } from "./logic/isOverBoard"
import { TRAY_SCALE } from "./logic/constants"
import { turnTo } from "./logic/turnTo"
import type { Placements, Point } from "./logic/types"
import type { Table } from "./useTable"

/**
 * The board and the tray of dominoes. Dominoes off the board are drawn smaller, and one being
 * dragged grows to the board's scale while it's over the board. Drag a domino anywhere to move it;
 * tap it to turn it.
 */
export function PipsTable(
  /** The component props. */
  { board, table, placements, turns, spots, solved, cursor, selected, onTap, onDrop }: Props,
) {
  const [drag, setDrag] = useState<{ index: number; offset: Point }>()
  // A just-dropped domino, held where it was let go for one frame so only its translation animates to where it lands.
  const [landing, setLanding] = useState<{ index: number; from: Point }>()
  const pointer = useRef<{ index: number; id: number; start: Point; moved: boolean }>(undefined)
  const { room, layout, fit } = table
  const { size, board: origin, slots } = layout

  useLayoutEffect(() => {
    if (!landing) return
    // Flush the held position as the transition's starting point before letting go of it.
    table.space?.getBoundingClientRect()
    setLanding(undefined)
  }, [landing, table.space])

  /** Where a domino's center is, in cell units from the board's corner. */
  const centerOf = (i: number): Point => {
    const pair = placements[i]
    if (!pair) return fit(spots[i] ?? slots[i], turns[i] ?? 0)
    const [a, b] = pair
    return [(a[1] + b[1]) / 2 + 0.5, (a[0] + b[0]) / 2 + 0.5]
  }

  /** Where a domino's center has been dragged to. */
  const draggedTo = (i: number, [dx, dy]: Point): Point => {
    const [x, y] = centerOf(i)
    return [x + dx / size, y + dy / size]
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
    const from = draggedTo(p.index, [event.clientX - p.start[0], event.clientY - p.start[1]])
    const turn = placements[p.index] ? directionOf(placements[p.index]!) : (turns[p.index] ?? 0)
    setLanding({ index: p.index, from })
    onDrop(p.index, fit(from, turn))
  }

  const cancel = () => {
    pointer.current = undefined
    setDrag(undefined)
  }

  return (
    <div ref={table.setSpace} className="w-full">
      {room.width > 0 && (
        <div className="relative" style={{ height: solved ? layout.boardHeight : layout.height }}>
          <PipsGrid
            board={board}
            placements={placements}
            layer="base"
            size={size}
            origin={origin}
          />

          {board.dominoes.map((domino, i) => {
            const [x, y] = centerOf(i)
            const pair = placements[i]
            const turn = pair ? turnTo(turns[i] ?? 0, directionOf(pair)) : (turns[i] ?? 0)
            const dragging = drag?.index === i
            const fullSize = dragging
              ? isOverBoard(fit(draggedTo(i, drag.offset), turn), turn, board)
              : !!pair
            const held = landing?.index === i
            const [dx, dy] = dragging
              ? drag.offset
              : held
                ? [(landing.from[0] - x) * size, (landing.from[1] - y) * size]
                : [0, 0]
            return (
              <button
                key={i}
                type="button"
                tabIndex={-1}
                aria-label={`Domino ${domino.join("–")}`}
                className={cn(
                  // Fixed positioning lets loose dominoes escape the content scroller without enlarging it.
                  "fixed touch-none outline-none",
                  solved
                    ? "z-10"
                    : dragging
                      ? "z-40 cursor-grabbing drop-shadow-lg"
                      : "z-10 cursor-grab",
                  "duration-150 ease-out",
                  // Under the pointer, or held where it was let go, only its size eases.
                  dragging || held
                    ? "transition-[scale]"
                    : "transition-[left,top,translate,rotate,scale]",
                  i === selected && "ring-3 ring-(--game-pips)",
                )}
                style={{
                  left: room.left + origin[0] + (x - 1) * size,
                  top: room.top + origin[1] + (y - 0.5) * size,
                  width: 2 * size,
                  height: size,
                  // Round the button like the domino inside it, so the selection ring follows its corners.
                  borderRadius:
                    ((dominoGeometry.radius + dominoGeometry.inset) / dominoGeometry.unit) * size,
                  // Separate properties, so size can ease while position follows the pointer.
                  translate: `${dx}px ${dy}px`,
                  rotate: `${turn * 90}deg`,
                  scale: fullSize ? 1 : TRAY_SCALE,
                }}
                onPointerDown={event => down(event, i)}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={cancel}
              >
                <DominoTile
                  domino={domino}
                  turn={turn}
                  regions={pair && !dragging ? halfRegions(board, pair) : undefined}
                />
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
          <PipsGrid
            board={board}
            placements={placements}
            layer="badges"
            size={size}
            origin={origin}
          />
        </div>
      )}
    </div>
  )
}

// CONSTANTS

/** How far a pointer can move, in pixels, and still count as a tap. */
const TAP_SLOP = 6

// TYPES

type Props = {
  /** The board. */
  board: PipsBoard
  /** The table's place on screen and its layout. */
  table: Table
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
