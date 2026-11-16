import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import type { CrosswordClue, CrosswordPuzzle, Direction } from "@/types"
import { ClueText } from "./ClueText"

/** The across and down clue lists, keeping the current clues in view. */
export function ClueLists({ puzzle, entries, active, crossing, onClue }: Props) {
  return (
    <div className="grid min-h-0 gap-4 lg:grid-cols-2">
      {(["across", "down"] as Direction[]).map(direction => (
        <ClueList
          key={direction}
          title={direction === "across" ? "Across" : "Down"}
          clues={puzzle.clues.filter(c => c.direction === direction)}
          entries={entries}
          active={active}
          crossing={crossing}
          onClue={onClue}
        />
      ))}
    </div>
  )
}

/** One direction's clues. */
function ClueList({
  title,
  clues,
  entries,
  active,
  crossing,
  onClue,
}: Omit<Props, "puzzle"> & { title: string; clues: CrosswordClue[] }) {
  const list = useRef<HTMLOListElement>(null)
  const ids = clues.map(c => c.id)
  const current = ids.includes(active ?? -1)
    ? active
    : ids.includes(crossing ?? -1)
      ? crossing
      : undefined

  useEffect(() => {
    list.current?.querySelector(`[data-clue="${current}"]`)?.scrollIntoView({ block: "nearest" })
  }, [current])

  return (
    <section className="flex min-h-0 flex-col">
      <h2 className="text-muted-foreground border-b pb-1 text-xs font-semibold tracking-wide uppercase">
        {title}
      </h2>
      <ol ref={list} className="min-h-0 flex-1 overflow-y-auto py-1">
        {clues.map(clue => {
          const filled = clue.cells.every(c => entries[c])
          return (
            <li key={clue.id} data-clue={clue.id}>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => onClue(clue)}
                className={cn(
                  "flex w-full gap-2 rounded-md border-l-4 border-transparent px-2 py-1 text-left text-sm",
                  clue.id === active && "border-(--game-crossword) bg-(--xw-word)",
                  clue.id === crossing && "border-(--xw-word)",
                  filled && clue.id !== active && "text-muted-foreground",
                )}
              >
                <span className="w-6 shrink-0 text-right font-semibold">{clue.label}</span>
                <ClueText clue={clue} />
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

type Props = {
  /** The puzzle. */
  puzzle: CrosswordPuzzle
  /** Entries, to dim finished clues. */
  entries: string[]
  /** ID of the clue being typed. */
  active?: number
  /** ID of the clue crossing the current square. */
  crossing?: number
  /** Called when a clue is chosen. */
  onClue: (clue: CrosswordClue) => void
}
