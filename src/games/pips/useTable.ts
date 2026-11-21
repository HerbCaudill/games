import { useLayoutEffect, useState } from "react"
import type { PipsBoard } from "@/types"
import { boardCells } from "./logic/boardCells"
import { boardWalls } from "./logic/boardWalls"
import { tableLayout, type Layout } from "./logic/tableLayout"
import type { Point, Surface } from "./logic/types"

/** Measure the space the table has on screen, and lay the board and tray out in it. */
export function useTable(
  /** The board. */
  board: PipsBoard,
): Table {
  const [space, setSpace] = useState<HTMLDivElement | null>(null)
  const [room, setRoom] = useState<Room>({ width: 0, height: 0, left: 0, top: 0, contentTop: 0 })

  useLayoutEffect(() => {
    if (!space) return
    const measure = () => {
      const { left, top } = space.getBoundingClientRect()
      const content = space.closest("main")
      setRoom({
        width: space.clientWidth,
        // Scrolling moves the table, but must not change its scale.
        height: window.innerHeight - top - (content?.scrollTop ?? 0) - BOTTOM_ROOM,
        left,
        top,
        contentTop: content?.getBoundingClientRect().top ?? 0,
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(space)
    window.addEventListener("resize", measure)
    window.addEventListener("scroll", measure, true)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
      window.removeEventListener("scroll", measure, true)
    }
  }, [space])

  const cells = boardCells(board)
  const layout = tableLayout({
    ...room,
    rows: Math.max(...cells.map(([r]) => r)) + 1,
    cols: Math.max(...cells.map(([, c]) => c)) + 1,
    count: board.dominoes.length,
  })
  const { size, board: origin } = layout

  /** Keep the whole domino inside the viewport, including after rotation or resize. */
  const fit = ([x, y]: Point, turn: number): Point => {
    const [hx, hy] = Math.abs(turn) % 2 === 1 ? [0.5, 1] : [1, 0.5]
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

  const surface: Surface = {
    walls: boardWalls(board),
    grid: layout.grid,
    fit,
  }

  return { space, setSpace, room, layout, fit, surface }
}

// CONSTANTS

/** Space kept free below the table, in pixels. */
const BOTTOM_ROOM = 16

// TYPES

/** Where the table sits on screen, in pixels. */
type Room = {
  /** Width of the table's space. */
  width: number
  /** Height available below the table's top. */
  height: number
  /** The space's left edge in the viewport. */
  left: number
  /** The space's top edge in the viewport. */
  top: number
  /** The top of the scrolling content, below the header. */
  contentTop: number
}

/** The table's place on screen and what goes where on it. */
export type Table = {
  /** The element the table is drawn in, once mounted. */
  space: HTMLDivElement | null
  /** Ref callback for that element. */
  setSpace: (element: HTMLDivElement | null) => void
  /** Where the table sits on screen. */
  room: Room
  /** Where the board and tray go. */
  layout: Layout
  /** Bring a domino's center back inside the viewport, given its quarter turns. */
  fit: (center: Point, turn: number) => Point
  /** What loose dominoes have to fit around: the board, the snap grid and the screen. */
  surface: Surface
}
