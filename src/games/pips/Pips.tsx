import { IconCheck, IconRotateClockwise } from "@tabler/icons-react"
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
import { DominoTile } from "./DominoTile"
import { PipsGrid } from "./PipsGrid"
import { boardCells } from "./logic/boardCells"
import { cellKey } from "./logic/cellKey"
import { DIRECTIONS } from "./logic/constants"
import { isSolved } from "./logic/isSolved"
import { placeAt } from "./logic/placeAt"
import { removeDomino } from "./logic/removeDomino"
import { type Placements } from "./logic/types"

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
    () => ({ placements: board.dominoes.map(() => null), elapsed: 0 }),
  )
  const { placements } = progress
  const [chosen, setSelected] = useState<number>()
  const [direction, setDirection] = useState(0)
  const [cursor, setCursor] = useState<Cell>(() => boardCells(board)[0])
  const solved = isSolved(placements, board)
  const allSolved = DIFFICULTIES.every(d => (d === difficulty ? solved : isStoredSolved(puzzle, d)))
  const anyStarted =
    placements.some(Boolean) || DIFFICULTIES.some(d => readStored(progressKey(puzzle.date, d)))
  useGameStatus("pips", puzzle.date, allSolved ? "solved" : anyStarted ? "started" : "new")
  useTimer(!solved, () => setProgress(p => ({ ...p, elapsed: p.elapsed + 1 })))

  const setPlacements = (next: Placements) => setProgress(p => ({ ...p, placements: next }))
  const unplaced = board.dominoes.map((_, i) => i).filter(i => !placements[i])
  // Fall back to the first domino in the tray when nothing in it is chosen.
  const selected = chosen !== undefined && !placements[chosen] ? chosen : unplaced[0]
  const dominoAt = (cell: Cell) =>
    placements.findIndex(cells => cells?.some(c => cellKey(c) === cellKey(cell)))

  const switchDifficulty = (d: PipsDifficulty) => {
    setDifficulty(d)
    setSelected(undefined)
    setDirection(0)
    setCursor(boardCells(puzzle.boards[d])[0])
  }

  /** Put the selected domino down at a cell, or pick up the domino already there. */
  const activate = (cell: Cell) => {
    if (solved) return
    setCursor(cell)
    const here = dominoAt(cell)
    if (here >= 0) {
      setPlacements(removeDomino(placements, here))
      setSelected(here)
      // Keep the domino's orientation relative to the half that was tapped.
      const [a, b] = placements[here]!
      const offset: Cell = [b[0] - a[0], b[1] - a[1]]
      setDirection(DIRECTIONS.findIndex(([r, c]) => r === offset[0] && c === offset[1]))
      return
    }
    if (selected === undefined) return
    const result = placeAt(placements, selected, cell, direction, board)
    if (!result) return
    setPlacements(result.placements)
    setDirection(result.direction)
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
      setPlacements(removeDomino(placements, here))
      setSelected(here)
    } else if (key === "[") cycle(-1)
    else if (key === "]") cycle(1)
    else if (key.toLowerCase() === "r") setDirection(d => (d + 1) % 4)
    else if (key.toLowerCase() === "e") switchDifficulty("easy")
    else if (key.toLowerCase() === "m") switchDifficulty("medium")
    else if (key.toLowerCase() === "h") switchDifficulty("hard")
    else return
    event.preventDefault()
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
      </div>

      <PipsGrid
        board={board}
        placements={placements}
        cursor={cursor}
        selected={selected}
        direction={direction}
        onCell={activate}
      />

      {solved ? (
        <p className="font-semibold">Solved in {formatDuration(progress.elapsed)}!</p>
      ) : (
        <div className="flex w-full flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-2" role="listbox" aria-label="Dominoes">
            {unplaced.map(i => (
              <button
                key={i}
                type="button"
                role="option"
                aria-selected={i === selected}
                aria-label={`Domino ${board.dominoes[i].join("–")}`}
                onClick={() => (i === selected ? setDirection(d => (d + 1) % 4) : setSelected(i))}
                className={cn(
                  "rounded-lg p-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  i === selected && "bg-(--game-pips)/20 ring-2 ring-(--game-pips)",
                )}
              >
                <DominoTile domino={board.dominoes[i]} direction={i === selected ? direction : 0} />
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => setDirection(d => (d + 1) % 4)}
            disabled={selected === undefined}
            title="Rotate (R)"
          >
            <IconRotateClockwise /> Rotate
          </Button>
        </div>
      )}
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

// CONSTANTS

/** Difficulty levels in display order. */
const DIFFICULTIES: PipsDifficulty[] = ["easy", "medium", "hard"]

// TYPES

/** Saved progress for one board. */
type PipsProgress = {
  /** Where each domino sits. */
  placements: Placements
  /** Seconds spent. */
  elapsed: number
}

type Props = {
  /** The puzzle. */
  puzzle: PipsPuzzle
}
