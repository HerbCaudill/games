import { IconCheck } from "@tabler/icons-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { formatDuration } from "@/lib/formatDuration"
import { readStored } from "@/lib/readStored"
import { useGameStatus } from "@/lib/useGameStatus"
import { useKeydown } from "@/lib/useKeydown"
import { usePersistentState } from "@/lib/usePersistentState"
import { useTimer } from "@/lib/useTimer"
import { cn } from "@/lib/utils"
import type { Cell, PipsDifficulty, PipsPuzzle } from "@/types"
import { PipsTable } from "./PipsTable"
import { boardCells } from "./logic/boardCells"
import { cellKey } from "./logic/cellKey"
import { directionOf } from "./logic/directionOf"
import { dropDomino } from "./logic/dropDomino"
import { isSolved } from "./logic/isSolved"
import { placeAt } from "./logic/placeAt"
import { removeDomino } from "./logic/removeDomino"
import { turnTo } from "./logic/turnTo"
import { type Placements, type Point } from "./logic/types"

/** Pips: place every domino so each region's rule holds. */
export function Pips(
  /** The component props. */
  { puzzle }: Props,
) {
  const [difficulty, setDifficulty] = usePersistentState<PipsDifficulty>(
    `progress:pips:${puzzle.date}:difficulty`,
    () => "easy",
  )
  const board = puzzle.boards[difficulty]
  const [progress, setProgress] = usePersistentState<PipsProgress>(
    progressKey(puzzle.date, difficulty),
    () => ({ placements: board.dominoes.map(() => null), turns: [], spots: [], elapsed: 0 }),
  )
  const { placements } = progress
  const turns = progress.turns ?? []
  const [chosen, setSelected] = useState<number>()
  const [cursor, setCursor] = useState<Cell>(() => boardCells(board)[0])
  // The cursor and the picked domino only matter, and only show, while playing by keyboard.
  const [usingKeyboard, setUsingKeyboard] = useState(false)
  const solved = isSolved(placements, board)
  const allSolved = DIFFICULTIES.every(d => (d === difficulty ? solved : isStoredSolved(puzzle, d)))
  const anyStarted =
    placements.some(Boolean) || DIFFICULTIES.some(d => readStored(progressKey(puzzle.date, d)))
  useGameStatus("pips", puzzle.date, allSolved ? "solved" : anyStarted ? "started" : "new")
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
  const update = (next: Placements, loose?: { index: number; at: Point }) =>
    setProgress(p => ({
      ...p,
      placements: next,
      turns: next.map((pair, i) => {
        const turn = p.turns?.[i] ?? 0
        return pair ? turnTo(turn, directionOf(pair)) : turn
      }),
      spots: next.map((pair, i) =>
        i === loose?.index ? loose.at : pair ? null : (p.spots?.[i] ?? null),
      ),
    }))

  const turn = (i: number) =>
    setProgress(p => ({
      ...p,
      turns: board.dominoes.map((_, j) => (p.turns?.[j] ?? 0) + (i === j ? 1 : 0)),
    }))

  /** Put every domino back in its tray slot, facing its starting way. */
  const clear = () => {
    setProgress(p => ({ ...p, placements: board.dominoes.map(() => null), turns: [], spots: [] }))
    setSelected(undefined)
  }
  const cleared = !placements.some(Boolean) && !(progress.spots ?? []).some(Boolean)

  const switchDifficulty = (d: PipsDifficulty) => {
    setDifficulty(d)
    setSelected(undefined)
    setCursor(boardCells(puzzle.boards[d])[0])
  }

  /** Turn a domino a quarter clockwise; on the board, it pivots on its first half to the next spot that fits. */
  const rotate = (i: number) => {
    if (solved) return
    const pair = placements[i]
    if (!pair) return turn(i)
    const result = placeAt(placements, i, pair[0], (directionOf(pair) + 1) % 4, board)
    if (result) update(result.placements)
  }

  /** Put a dragged domino down: on the board in the nearest spot that fits, or loose where it was dropped. */
  const drop = (i: number, center: Point) => {
    const result = dropDomino(placements, i, center, facing(i), board)
    if (result.kind === "placed") update(result.placements)
    else if (result.kind === "loose") update(removeDomino(placements, i), { index: i, at: center })
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

  useKeydown(event => {
    const key = event.key
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
    } else if (key.toLowerCase() === "e") switchDifficulty("easy")
    else if (key.toLowerCase() === "m") switchDifficulty("medium")
    else if (key.toLowerCase() === "h") switchDifficulty("hard")
    else return
    event.preventDefault()
    setUsingKeyboard(true)
  })

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 p-4 sm:pt-6">
      <div className="flex w-full items-center gap-3">
        <div className="bg-muted flex rounded-full p-1" role="tablist" aria-label="Difficulty">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={d === difficulty}
              onClick={() => switchDifficulty(d)}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1 text-sm capitalize outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                d === difficulty ? "bg-card font-semibold shadow-sm" : "text-muted-foreground",
              )}
            >
              {d}
              {(d === difficulty ? solved : isStoredSolved(puzzle, d)) && (
                <IconCheck className="size-3.5" aria-label="solved" />
              )}
            </button>
          ))}
        </div>
        <span className="text-muted-foreground ml-auto font-mono text-sm tabular-nums">
          {formatDuration(progress.elapsed)}
        </span>
        <Button variant="ghost" disabled={solved || cleared} onClick={clear}>
          Clear
        </Button>
      </div>

      <div className="w-full" onPointerDown={() => setUsingKeyboard(false)}>
        <PipsTable
          board={board}
          placements={placements}
          turns={turns}
          spots={progress.spots ?? []}
          solved={solved}
          cursor={usingKeyboard && !solved ? cursor : undefined}
          selected={usingKeyboard && !solved ? selected : undefined}
          onTap={rotate}
          onDrop={drop}
        />
      </div>

      {solved && <p className="font-semibold">Solved in {formatDuration(progress.elapsed)}!</p>}
    </div>
  )
}

/** Storage key for one board's progress. */
function progressKey(
  /** Puzzle date. */
  date: string,
  /** Difficulty. */
  difficulty: PipsDifficulty,
) {
  return `progress:pips:${date}:${difficulty}`
}

/** Whether a board not currently shown has been solved, from its saved progress. */
function isStoredSolved(
  /** The puzzle. */
  puzzle: PipsPuzzle,
  /** Difficulty. */
  difficulty: PipsDifficulty,
) {
  const saved = readStored<PipsProgress>(progressKey(puzzle.date, difficulty))
  return Boolean(saved && isSolved(saved.placements, puzzle.boards[difficulty]))
}

/** A turn count as a direction, 0 to 3. */
function mod4(
  /** Quarter turns. */
  n: number,
) {
  return ((n % 4) + 4) % 4
}

// CONSTANTS

/** Difficulty levels in display order. */
const DIFFICULTIES: PipsDifficulty[] = ["easy", "medium", "hard"]

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
}
