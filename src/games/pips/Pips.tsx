import { IconArrowBackUp, IconArrowForwardUp } from "@tabler/icons-react"
import { useLayoutEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { SolvedMessage } from "@/components/SolvedMessage"
import { useGameStatus } from "@/lib/useGameStatus"
import { useKeydown } from "@/lib/useKeydown"
import { usePersistentState } from "@/lib/usePersistentState"
import { useTimer } from "@/lib/useTimer"
import { useUndo } from "@/lib/useUndo"
import type { Cell, PipsPuzzle } from "@/types"
import { PipsTable } from "./PipsTable"
import { boardCells } from "./logic/boardCells"
import { cellKey } from "./logic/cellKey"
import { directionOf } from "./logic/directionOf"
import { dropDomino } from "./logic/dropDomino"
import { isSolved } from "./logic/isSolved"
import { leftHalf } from "./logic/leftHalf"
import { makeRoom } from "./logic/makeRoom"
import { placeAt } from "./logic/placeAt"
import { removeDomino } from "./logic/removeDomino"
import { restorePieces } from "./logic/restorePieces"
import { restingSpot } from "./logic/restingSpot"
import { spreadOut } from "./logic/spreadOut"
import { startingTurn } from "./logic/startingTurn"
import { turnTo } from "./logic/turnTo"
import { type LooseDomino, type Pieces, type Placements, type Point } from "./logic/types"
import { useTable } from "./useTable"

/** Pips: place every domino so each region's rule holds. */
export function Pips(
  /** The component props. */
  { puzzle, toolbar }: Props,
) {
  const { board } = puzzle
  const [progress, setProgress] = usePersistentState<PipsProgress>(
    `progress:pips:${puzzle.date}`,
    () => ({ placements: board.dominoes.map(() => null), turns: [], spots: [], elapsed: 0 }),
  )
  const { placements } = progress
  const startingTurns = board.dominoes.map(startingTurn)
  const turns = startingTurns.map((start, i) => progress.turns?.[i] ?? start)
  const spots = progress.spots ?? []
  const pieces: Pieces = { placements, turns, spots }
  const table = useTable(board)

  /** Where a domino lies off the board, or null when it's on the board. */
  const looseIn = ({ placements, turns, spots }: Pieces, i: number): LooseDomino | null => {
    if (placements[i]) return null
    const turn = turns[i]
    return { center: table.fit(spots[i] ?? table.homes[i], turn), turn }
  }

  /** Push loose dominoes out from under the ones that just moved, giving each pushed domino its new spot. */
  const settle = (next: Pieces, movers: number[]): Pieces => {
    const loose = board.dominoes.map((_, i) => looseIn(next, i))
    const pushed = makeRoom(loose, movers, table.surface)
    return {
      ...next,
      spots: board.dominoes.map((_, i) => pushed.get(i) ?? next.spots[i] ?? null),
    }
  }

  // When the screen changes size, untangle any loose dominoes it pulls in on top of each other.
  const { width, height, left, top, contentTop } = table.room
  useLayoutEffect(() => {
    if (!width) return
    const loose = board.dominoes.map((_, i) => looseIn(pieces, i))
    const pulled = loose.flatMap((domino, i) =>
      domino && !samePoint(domino.center, spots[i] ?? table.homes[i]) ? [i] : [],
    )
    const moved = spreadOut(loose, pulled, table.surface)
    if (!moved.size) return
    setProgress(p => ({
      ...p,
      spots: board.dominoes.map((_, i) => moved.get(i) ?? p.spots?.[i] ?? null),
    }))
    // Only a change of screen pulls dominoes in; moves make room for themselves.
  }, [width, height, left, top, contentTop])

  /** Make room where dominoes that come off the board land. */
  const settleReturned = (next: Pieces) => {
    const returned = board.dominoes
      .map((_, i) => i)
      .filter(i => placements[i] && !next.placements[i])
    return settle(next, returned)
  }

  const setPieces = (next: Pieces) => setProgress(p => ({ ...p, ...next }))
  const { change, undo, redo, canUndo, canRedo } = useUndo(puzzle.date, pieces, setPieces, saved =>
    setPieces(settleReturned(restorePieces(pieces, saved))),
  )
  /** Save new pieces, as an undo step only when the board changes. */
  const save = (next: Pieces) =>
    samePlacements(next.placements, placements) ? setPieces(next) : change(next)
  const [chosen, setSelected] = useState<number>()
  const [cursor, setCursor] = useState<Cell>(() => boardCells(board)[0])
  // The cursor and the picked domino only matter, and only show, while playing by keyboard.
  const [usingKeyboard, setUsingKeyboard] = useState(false)
  const solved = isSolved(placements, board)
  const started = placements.some(Boolean) || spots.some(Boolean)
  useGameStatus("pips", puzzle.date, solved ? "solved" : started ? "started" : "new")
  useTimer(!solved, () => setProgress(p => ({ ...p, elapsed: p.elapsed + 1 })))

  const unplaced = table.order.filter(i => !placements[i])
  // Fall back to the first domino in the tray when nothing in it is chosen.
  const selected = chosen !== undefined && !placements[chosen] ? chosen : unplaced[0]
  const dominoAt = (cell: Cell) =>
    placements.findIndex(cells => cells?.some(c => cellKey(c) === cellKey(cell)))
  const facing = (i: number) => {
    const pair = placements[i]
    return pair ? directionOf(pair) : mod4(turns[i])
  }

  /** Save new placements, turning each moved domino to match how it now lies. A domino on the board has no loose spot. */
  const update = (next: Placements) =>
    save(
      settleReturned({
        placements: next,
        turns: next.map((pair, i) => (pair ? turnTo(turns[i], directionOf(pair)) : turns[i])),
        spots: next.map((pair, i) => (pair ? null : (spots[i] ?? null))),
      }),
    )

  /** Turn a domino off the board a quarter clockwise in place, pushing aside any it now covers. */
  const turn = (i: number) => {
    const turned = turns[i] + 1
    const from = looseIn(pieces, i)!.center
    // Turned to reach onto the board, it steps clear of it.
    const at = restingSpot(from, turned, table.surface)
    const moved = !samePoint(at, from)
    save(
      settle(
        {
          placements,
          spots: board.dominoes.map((_, j) => (moved && j === i ? at : (spots[j] ?? null))),
          turns: turns.map((t, j) => (i === j ? turned : t)),
        },
        [i],
      ),
    )
  }

  /** Put every domino back in its tray slot, facing its starting way. */
  const clear = () => {
    save({
      placements: board.dominoes.map(() => null),
      // The nearest count that faces the starting way, so none spins the long way back.
      turns: turns.map((t, i) => turnTo(t, startingTurns[i])),
      spots: [],
    })
    setSelected(undefined)
  }
  const cleared =
    !placements.some(Boolean) &&
    !spots.some(Boolean) &&
    turns.every((t, i) => mod4(t) === startingTurns[i])

  /** Turn a domino a quarter clockwise; on the board, it pivots on the half that starts on the left to the next spot that fits. */
  const rotate = (i: number) => {
    if (solved) return
    const pair = placements[i]
    if (!pair) return turn(i)
    const pivot = pair[leftHalf(board.dominoes[i])]
    const result = placeAt(placements, i, pivot, (directionOf(pair) + 1) % 4, board)
    if (result) update(result.placements)
  }

  /**
   * Put a dragged domino down: on the board in the nearest spot that fits, or loose on the snap
   * grid clear of the board where it was dropped, pushing aside any loose domino it lands on.
   */
  const drop = (i: number, center: Point) => {
    const result = dropDomino(placements, i, center, facing(i), board)
    if (result.kind === "placed") update(result.placements)
    else if (result.kind === "loose") {
      const at = restingSpot(center, turns[i], table.surface)
      const next = removeDomino(placements, i)
      save(
        settle(
          {
            placements: next,
            turns,
            spots: board.dominoes.map((_, j) => (j === i ? at : (spots[j] ?? null))),
          },
          [i],
        ),
      )
    }
  }

  /** Put the selected domino down at a cell, or pick up the domino already there. */
  const activate = (cell: Cell) => {
    if (solved) return
    setCursor(cell)
    const here = dominoAt(cell)
    if (here >= 0) {
      update(removeDomino(placements, here))
      setSelected(here)
      return
    }
    if (selected === undefined) return
    const result = placeAt(placements, selected, cell, facing(selected), board)
    if (!result) return
    update(result.placements)
    const rest = unplaced.filter(i => i !== selected)
    // On to the one that followed it in the tray.
    setSelected(rest[unplaced.indexOf(selected)] ?? rest[0])
  }

  const cycle = (step: number) => {
    if (!unplaced.length) return
    const at = selected === undefined ? -1 : unplaced.indexOf(selected)
    setSelected(unplaced[(at + step + unplaced.length) % unplaced.length])
  }

  const moveCursor = (dr: number, dc: number) => {
    const cells = boardCells(board)
    const keys = new Set(cells.map(cellKey))
    const maxSize = Math.max(...cells.flat()) + 1
    for (let step = 1; step <= maxSize; step++) {
      const next: Cell = [cursor[0] + dr * step, cursor[1] + dc * step]
      if (keys.has(cellKey(next))) return setCursor(next)
    }
  }

  useKeydown(
    event => {
      const key = event.key
      if ((event.metaKey || event.ctrlKey) && key.toLowerCase() === "z") {
        event.preventDefault()
        if (solved) return
        if (event.shiftKey) redo()
        else undo()
        return
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const arrows: Record<string, [number, number]> = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      }
      if (arrows[key]) moveCursor(...arrows[key])
      else if (key === "Enter" || key === " ") activate(cursor)
      else if (key === "Backspace") {
        const here = dominoAt(cursor)
        if (here < 0 || solved) return
        update(removeDomino(placements, here))
        setSelected(here)
      } else if (key === "[") cycle(-1)
      else if (key === "]") cycle(1)
      else if (key.toLowerCase() === "r") {
        if (selected !== undefined && !solved) turn(selected)
      } else return
      event.preventDefault()
      setUsingKeyboard(true)
    },
    { withModifiers: true },
  )

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 p-4 sm:pt-6">
      {toolbar &&
        createPortal(
          <div className="ml-auto flex items-center">
            <Button variant="ghost" className="px-2" disabled={solved || cleared} onClick={clear}>
              Clear
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-10"
              aria-label="Redo"
              title="Redo (⇧⌘Z)"
              disabled={solved || !canRedo}
              onClick={redo}
            >
              <IconArrowForwardUp className="size-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-10"
              aria-label="Undo"
              title="Undo (⌘Z)"
              disabled={solved || !canUndo}
              onClick={undo}
            >
              <IconArrowBackUp className="size-6" />
            </Button>
          </div>,
          toolbar,
        )}

      <div className="w-full" onPointerDown={() => setUsingKeyboard(false)}>
        <PipsTable
          board={board}
          table={table}
          placements={placements}
          turns={turns}
          spots={spots}
          solved={solved}
          cursor={usingKeyboard && !solved ? cursor : undefined}
          selected={usingKeyboard && !solved ? selected : undefined}
          onTap={rotate}
          onDrop={drop}
        />
      </div>

      {solved && <SolvedMessage seconds={progress.elapsed} />}
    </div>
  )
}

/** Whether two sets of placements put every domino in the same cells. */
function samePlacements(
  /** One set. */
  a: Placements,
  /** The other. */
  b: Placements,
) {
  return JSON.stringify(a) === JSON.stringify(b)
}

/** Whether two points are the same, give or take a rounding error. */
function samePoint(
  /** One. */
  a: Point,
  /** The other. */
  b: Point,
) {
  return Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6
}

/** A turn count as a direction, 0 to 3. */
function mod4(
  /** Quarter turns. */
  n: number,
) {
  return ((n % 4) + 4) % 4
}

// TYPES

/** Saved progress for one board. */
type PipsProgress = {
  /** Where each domino sits. */
  placements: Placements
  /** Quarter turns clockwise for each domino; empty or missing until it first changes, meaning its starting turn. */
  turns?: number[]
  /** Where each loose domino lies, in cell units from the board's corner; null when it is in its tray slot. */
  spots?: (Point | null)[]
  /** Seconds spent. */
  elapsed: number
}

type Props = {
  /** The puzzle. */
  puzzle: PipsPuzzle
  /** Header element to render the board controls into. */
  toolbar: HTMLElement | null
}
