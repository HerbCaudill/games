import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Toast } from "@/components/Toast"
import { shuffle } from "@/lib/shuffle"
import { useGameStatus } from "@/lib/useGameStatus"
import { useKeydown } from "@/lib/useKeydown"
import { usePersistentState } from "@/lib/usePersistentState"
import { useToast } from "@/lib/useToast"
import { cn } from "@/lib/utils"
import type { ConnectionsGroup, ConnectionsPuzzle } from "@/types"
import {
  initialState,
  isOver,
  MAX_MISTAKES,
  remainingWords,
  submitGuess,
  type ConnectionsState,
} from "./connectionsRules"

/** Connections: sort sixteen words into four groups of four. */
export function Connections({ puzzle }: Props) {
  const [state, setState] = usePersistentState<ConnectionsState>(
    `progress:connections:${puzzle.date}`,
    () => initialState(puzzle),
  )
  const [selected, setSelected] = useState<string[]>([])
  const toast = useToast()
  const over = isOver(state, puzzle)
  const won = state.solved.length === puzzle.groups.length
  useGameStatus(
    "connections",
    puzzle.date,
    won ? "solved" : over ? "failed" : state.guesses.length ? "started" : "new",
  )

  const words = remainingWords(state, puzzle)
  // After a loss, show the groups the player missed, easiest first.
  const shownGroups = [
    ...state.solved,
    ...(over ? puzzle.groups.map((_, i) => i).filter(i => !state.solved.includes(i)) : []),
  ]

  const toggle = (word: string) =>
    setSelected(s =>
      s.includes(word) ? s.filter(w => w !== word) : s.length < 4 ? [...s, word] : s,
    )
  const submit = () => {
    if (selected.length !== 4 || over) return
    const { state: next, result } = submitGuess(state, selected, puzzle)
    setState(next)
    if (result === "correct") setSelected([])
    if (result === "one-away") toast.show("One away…")
    if (result === "already-guessed") toast.show("Already guessed!")
    if (result === "wrong" && next.mistakes >= MAX_MISTAKES) toast.show("Next time!")
  }
  const mix = () => setState(s => ({ ...s, order: shuffle(s.order) }))

  useKeydown(event => {
    if (over) return
    if (event.key === "Enter") submit()
    else if (event.key.toLowerCase() === "s") mix()
    else if (event.key.toLowerCase() === "d") setSelected([])
    else return
    event.preventDefault()
  })

  return (
    <div className="relative mx-auto flex max-w-xl flex-col gap-4 p-4 sm:pt-8">
      <Toast message={toast.message} />
      <p className="text-muted-foreground text-center text-sm">Create four groups of four!</p>

      <div className="grid gap-2">
        {shownGroups.map(i => (
          <SolvedGroup key={i} group={puzzle.groups[i]} missed={!state.solved.includes(i)} />
        ))}
        {!over && (
          <div className="grid grid-cols-4 gap-2" role="group" aria-label="Words">
            {words.map(word => (
              <button
                key={word}
                type="button"
                aria-pressed={selected.includes(word)}
                onClick={() => toggle(word)}
                className={cn(
                  "flex h-16 items-center justify-center rounded-lg px-1 text-center leading-tight font-semibold uppercase transition-colors outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/60 sm:h-20",
                  word.length > 9
                    ? "text-[0.65rem] sm:text-xs"
                    : word.length > 6
                      ? "text-xs sm:text-sm"
                      : "text-sm sm:text-base",
                  selected.includes(word)
                    ? "bg-(--game-connections) text-white"
                    : "bg-muted hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_6%)]",
                )}
              >
                {word}
              </button>
            ))}
          </div>
        )}
      </div>

      {!over && (
        <>
          <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
            Mistakes remaining:
            <span className="flex gap-1.5" aria-label={`${MAX_MISTAKES - state.mistakes} left`}>
              {Array.from({ length: MAX_MISTAKES - state.mistakes }, (_, i) => (
                <span key={i} className="bg-foreground/70 size-3 rounded-full" />
              ))}
            </span>
          </div>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              className="rounded-full px-4"
              onClick={mix}
              title="Shuffle (S)"
            >
              Shuffle
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-4"
              onClick={() => setSelected([])}
              disabled={!selected.length}
              title="Deselect all (D)"
            >
              Deselect all
            </Button>
            <Button
              className="rounded-full px-4"
              onClick={submit}
              disabled={selected.length !== 4}
              title="Submit (Enter)"
            >
              Submit
            </Button>
          </div>
        </>
      )}

      {over && (
        <p className="text-center font-semibold">
          {won ? (state.mistakes === 0 ? "Perfect!" : "Solved!") : "Better luck next time"}
        </p>
      )}
    </div>
  )
}

/** A solved or revealed group, colored by difficulty. */
function SolvedGroup({ group, missed }: { group: ConnectionsGroup; missed: boolean }) {
  return (
    <div
      className={cn(
        "flex h-16 animate-in flex-col items-center justify-center rounded-lg px-2 text-center zoom-in-95 sm:h-20",
        missed && "opacity-75",
      )}
      style={{ background: `var(--group-${group.level})` }}
    >
      <span className="text-sm font-bold uppercase sm:text-base">{group.title}</span>
      <span className="text-xs uppercase sm:text-sm">{group.words.join(", ")}</span>
    </div>
  )
}

type Props = {
  /** The puzzle. */
  puzzle: ConnectionsPuzzle
}
