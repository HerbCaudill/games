import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { formatDuration } from "@/lib/formatDuration"
import { useGameStatus } from "@/lib/useGameStatus"
import { useKeydown } from "@/lib/useKeydown"
import { usePersistentState } from "@/lib/usePersistentState"
import { useTimer } from "@/lib/useTimer"
import type { CrosswordPuzzle } from "@/types"
import { ClueLists } from "./ClueLists"
import { ClueText } from "./ClueText"
import { CrosswordGrid } from "./CrosswordGrid"
import { arrow } from "./logic/arrow"
import { backspace } from "./logic/backspace"
import { clueAt } from "./logic/clueAt"
import { initialState } from "./logic/initialState"
import { isSolved } from "./logic/isSolved"
import { nextClue } from "./logic/nextClue"
import { selectCell } from "./logic/selectCell"
import { setAutocheck } from "./logic/setAutocheck"
import { toggleDirection } from "./logic/toggleDirection"
import { typeEntry } from "./logic/typeEntry"
import { type CrosswordState } from "./logic/types"
import { OnScreenKeyboard } from "./OnScreenKeyboard"

/** The daily crossword. */
export function Crossword(
  /** The component props. */
  { puzzle }: Props,
) {
  const [progress, setProgress] = usePersistentState<CrosswordProgress>(
    `progress:crossword:${puzzle.date}`,
    () => ({ ...initialState(puzzle), elapsed: 0 }),
  )
  const [rebus, setRebus] = useState<string>()
  const solved = isSolved(progress, puzzle)
  const full = progress.entries.every((entry, i) => !puzzle.cells[i] || entry)
  useGameStatus(
    "crossword",
    puzzle.date,
    solved ? "solved" : progress.entries.some(Boolean) ? "started" : "new",
  )
  useTimer(!solved, () => setProgress(p => ({ ...p, elapsed: p.elapsed + 1 })))

  /** Apply a state change, keeping the elapsed time. */
  const update = (change: (state: CrosswordState) => CrosswordState) =>
    setProgress(p => ({ ...change(p), elapsed: p.elapsed }))

  const clue = clueAt(puzzle, progress.cursor, progress.direction)
  const crossing = clueAt(
    puzzle,
    progress.cursor,
    progress.direction === "across" ? "down" : "across",
  )

  /** Save the whole rebus in its square, then return to normal entry. */
  const commitRebus = () => {
    if (rebus !== undefined && (rebus || progress.entries[progress.cursor]))
      update(s => (rebus ? typeEntry(s, puzzle, rebus) : backspace(s, puzzle)))
    setRebus(undefined)
  }

  /** Start a rebus on a square without changing its direction or editing a locked entry. */
  const startRebus = (cell = progress.cursor) => {
    if (progress.marks[cell] === "correct" || progress.marks[cell] === "revealed") return
    commitRebus()
    update(s => (s.cursor === cell ? s : selectCell(s, puzzle, cell)))
    setRebus(progress.entries[cell])
  }

  /** Handle a key from the physical or on-screen keyboard; returns whether it was used. */
  const handleKey = (key: string, shift = false) => {
    if (rebus !== undefined) {
      if (key === "Enter" || key === "Rebus") commitRebus()
      else if (key === "Escape") setRebus(undefined)
      else if (key === "Backspace") setRebus(r => r!.slice(0, -1))
      else if (/^[a-z0-9]$/i.test(key)) setRebus(r => (r! + key).toUpperCase().slice(0, 10))
      else return false
      return true
    }
    if (/^[a-z]$/i.test(key)) update(s => typeEntry(s, puzzle, key))
    else if (key === "Backspace" || key === "Delete") update(s => backspace(s, puzzle))
    else if (key === "ArrowUp") update(s => arrow(s, puzzle, -1, 0))
    else if (key === "ArrowDown") update(s => arrow(s, puzzle, 1, 0))
    else if (key === "ArrowLeft") update(s => arrow(s, puzzle, 0, -1))
    else if (key === "ArrowRight") update(s => arrow(s, puzzle, 0, 1))
    else if (key === "Tab" || key === "Enter") update(s => nextClue(s, puzzle, shift ? -1 : 1))
    else if (key === " ") update(s => toggleDirection(s, puzzle))
    else if (key === "Escape" || key === "Rebus") startRebus()
    else return false
    return true
  }

  useKeydown(event => {
    // Let native toolbar controls keep their Tab, Space and Enter behavior.
    if (
      (event.key === "Tab" || event.key === "Enter" || event.key === " ") &&
      (event.target as HTMLElement | null)?.closest("button, [role='switch']")
    )
      return
    if (handleKey(event.key, event.shiftKey)) event.preventDefault()
  })

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b px-3 py-1.5">
        <span className="text-muted-foreground mr-auto font-mono text-sm tabular-nums">
          {formatDuration(progress.elapsed)}
        </span>
        <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            role="switch"
            checked={progress.autocheck ?? false}
            onChange={event => {
              commitRebus()
              update(s => setAutocheck(s, puzzle, event.target.checked))
            }}
            className="accent-primary size-4"
          />
          Autocheck
          <span aria-hidden="true" className="text-muted-foreground w-5 text-xs">
            {progress.autocheck ? "On" : "Off"}
          </span>
        </label>
        <Button
          variant={rebus === undefined ? "ghost" : "default"}
          aria-label={rebus === undefined ? "Enter rebus" : "Save rebus"}
          aria-pressed={rebus !== undefined}
          disabled={
            progress.marks[progress.cursor] === "correct" ||
            progress.marks[progress.cursor] === "revealed"
          }
          title={rebus === undefined ? "Rebus (Esc)" : "Save rebus (Enter); cancel (Esc)"}
          className="min-h-10"
          onClick={event => {
            if (rebus === undefined) startRebus()
            else commitRebus()
            event.currentTarget.blur()
          }}
        >
          {rebus === undefined ? "Rebus" : "Done"}
        </Button>
      </div>

      {solved && (
        <p className="bg-(--game-crossword) px-4 py-2 text-center text-sm font-medium text-(--game-crossword-foreground)">
          Solved in {formatDuration(progress.elapsed)}!
        </p>
      )}
      {full && !solved && (
        <p className="bg-muted px-4 py-2 text-center text-sm">
          The grid is full, but something isn’t right yet.
        </p>
      )}

      <div className="flex min-h-0 flex-1 flex-col pointer-coarse:landscape:flex-row">
        <div className="mx-auto flex min-h-0 w-full max-w-7xl min-w-0 flex-1 flex-col gap-4 md:pointer-fine:flex-row md:pointer-fine:p-4">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col md:pointer-fine:gap-3">
            <ClueBar
              text={clue && <ClueText clue={clue} />}
              label={clue && `${clue.label}${clue.direction === "across" ? "A" : "D"}`}
              onPrevious={() => update(s => nextClue(s, puzzle, -1))}
              onNext={() => update(s => nextClue(s, puzzle, 1))}
              onToggle={() => update(s => toggleDirection(s, puzzle))}
            />
            <div
              className="grid min-h-0 flex-1 content-start justify-items-center p-2 md:p-0"
              style={{ containerType: "size" }}
            >
              <CrosswordGrid
                puzzle={puzzle}
                state={progress}
                rebus={rebus}
                onRebus={startRebus}
                onCell={cell => {
                  commitRebus()
                  update(s => selectCell(s, puzzle, cell))
                }}
              />
            </div>
            <p className="text-muted-foreground hidden truncate text-xs md:pointer-fine:block">
              {puzzle.title && <span className="font-semibold">{puzzle.title} · </span>}
              By {puzzle.constructors.join(" and ")} · Edited by {puzzle.editor}
            </p>
          </div>
          <aside className="hidden min-h-0 md:w-72 md:flex-col lg:w-[34rem] md:pointer-fine:flex">
            <ClueLists
              puzzle={puzzle}
              entries={progress.entries}
              active={clue?.id}
              crossing={crossing?.id}
              onClue={c => {
                commitRebus()
                update(s => ({
                  ...s,
                  direction: c.direction,
                  cursor: c.cells.find(cell => !s.entries[cell]) ?? c.cells[0],
                }))
              }}
            />
          </aside>
        </div>

        <OnScreenKeyboard rebus={rebus !== undefined} onKey={key => handleKey(key)} />
      </div>
    </div>
  )
}

/** The current clue, with buttons to move between clues; tapping it switches direction. */
function ClueBar({ label, text, onPrevious, onNext, onToggle }: ClueBarProps) {
  return (
    <div className="flex min-h-14 items-stretch bg-(--xw-word) text-(--xw-highlight-foreground) md:rounded-lg">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Previous clue"
        className="px-2"
        onClick={onPrevious}
      >
        <IconChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        tabIndex={-1}
        onClick={onToggle}
        className="flex flex-1 items-center gap-2 py-2 text-left text-sm leading-snug md:text-base"
      >
        <span className="shrink-0 font-semibold">{label}</span>
        <span className="line-clamp-3">{text}</span>
      </button>
      <button type="button" tabIndex={-1} aria-label="Next clue" className="px-2" onClick={onNext}>
        <IconChevronRight className="size-5" />
      </button>
    </div>
  )
}

// TYPES

/** Saved crossword progress. */
type CrosswordProgress = CrosswordState & {
  /** Seconds spent. */
  elapsed: number
}

type ClueBarProps = {
  /** Clue number and direction, like 12A. */
  label?: string
  /** Clue text. */
  text?: React.ReactNode
  /** Go to the previous clue. */
  onPrevious: () => void
  /** Go to the next clue. */
  onNext: () => void
  /** Switch direction. */
  onToggle: () => void
}

type Props = {
  /** The puzzle. */
  puzzle: CrosswordPuzzle
}
