import { IconArrowBackUp, IconArrowForwardUp } from "@tabler/icons-react"
import { useState } from "react"
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
import { makeRoom } from "./logic/makeRoom"
import { placeAt } from "./logic/placeAt"
import { removeDomino } from "./logic/removeDomino"
import { restorePieces } from "./logic/restorePieces"
import { restingSpot } from "./logic/restingSpot"
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
  const turns = progress.turns ?? []
  const spots = progress.spots ?? []
  const pieces: Pieces = { placements, turns, spots }
  const table = useTable(board)

  /** Where a domino lies off the board, or null when it's on the board. */
  const looseIn = ({ placements, turns, spots }: Pieces, i: number): LooseDomino | null => {
    if (placements[i]) return null
    const turn = turns[i] ?? 0
    return { center: table.fit(spots[i] ?? table.layout.slots[i], turn), turn }
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

  const { change, undo, redo, canUndo, canRedo } = useUndo<Pieces>(puzzle.date, pieces, saved => {
    const restored = restorePieces(pieces, saved)
    // Dominoes that undo or redo takes off the board make room where they land.
    const back = board.dominoes
      .map((_, i) => i)
      .filter(i => placements[i] && !restored.placements[i])
    setProgress(p => ({ ...p, ...settle(restored, back) }))
  })
  /** Save new pieces, as an undo step only when the board changes. */
  const save = (next: Pieces) =>
    samePlacements(next.placements, placements)
      ? setProgress(p => ({ ...p, ...next }))
      : change(next)
  const [chosen, setSelected] = useState<number>()
  const [cursor, setCursor] = useState<Cell>(() => boardCells(board)[0])
  // The cursor and the picked domino only matter, and only show, while playing by keyboard.
  const [usingKeyboard, setUsingKeyboard] = useState(false)
  const solved = isSolved(placements, board)
  const started = placements.some(Boolean) || spots.some(Boolean)
  useGameStatus("pips", puzzle.date, solved ? "solved" : started ? "started" : "new")
  useTimer(!solved, () => setProgress(p => ({ ...p, elapsed: p.elapsed + 1 })))

  const unplaced = board.dominoes.map((_, i) => i).filter(i => !placements[i])
  // Fall back to the first domino in the tray when nothing in it is chosen.
  const selected = chosen !== undefined && !placements[chosen] ? chosen : unplaced[0]
  const dominoAt = (cell: Cell) =>
    placements.findIndex(cells => cells?.some(c => cellKey(c) === cellKey(cell)))
  const facing = (i: number) => {
    const pair = placements[i]
    return pair ? directionOf(pair) : mod4(turns[i] ?? 0)
  }

  /** Save new placements, turning each moved domino to match how it now lies. A domino on the board has no loose spot. */
  const update = (next: Placements) =>
    save({
      placements: next,
      turns: next.map((pair, i) => {
        const turn = turns[i] ?? 0
        return pair ? turnTo(turn, directionOf(pair)) : turn
      }),
      spots: next.map((pair, i) => (pair ? null : (spots[i] ?? null))),
    })

  /** Turn a domino off the board a quarter clockwise in place, pushing aside any it now covers. */
  const turn = (i: number) =>
    save(
      settle(
        {
          placements,
          spots,
          turns: board.dominoes.map((_, j) => (turns[j] ?? 0) + (i === j ? 1 : 0)),
        },
        [i],
      ),
    )

  /** Put every domino back in its tray slot, facing its starting way. */
  const clear = () => {
    save({ placements: board.dominoes.map(() => null), turns: [], spots: [] })
    setSelected(undefined)
  }
  const cleared = !placements.some(Boolean) && !spots.some(Boolean)

  /** Turn a domino a quarter clockwise; on the board, it pivots on its first half to the next spot that fits. */
  const rotate = (i: number) => {
    if (solved) return
    const pair = placements[i]
    if (!pair) return turn(i)
    const result = placeAt(placements, i, pair[0], (directionOf(pair) + 1) % 4, board)
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
      const at = restingSpot(center, turns[i] ?? 0, table.surface)
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
    setSelected(rest.find(i => i > selected) ?? rest[0])
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
  /** Quarter turns clockwise for each domino; missing in progress saved before dominoes could turn. */
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
