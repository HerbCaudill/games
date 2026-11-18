import { useRef, useState } from "react"
import { flushSync } from "react-dom"
import { Button } from "@/components/ui/button"
import { Toast } from "@/components/Toast"
import { shuffle } from "@/lib/shuffle"
import { useGameStatus } from "@/lib/useGameStatus"
import { useKeydown } from "@/lib/useKeydown"
import { usePersistentState } from "@/lib/usePersistentState"
import { useToast } from "@/lib/useToast"
import { cn } from "@/lib/utils"
import type { ConnectionsGroup, ConnectionsPuzzle } from "@/types"
import { initialState } from "./logic/initialState"
import { isOver } from "./logic/isOver"
import { MAX_MISTAKES } from "./logic/constants"
import { remainingWords } from "./logic/remainingWords"
import { submitGuess } from "./logic/submitGuess"
import { type ConnectionsState } from "./logic/types"
import { useConnectionsAnimation } from "./useConnectionsAnimation"
import "./connections.css"

/** Connections: sort sixteen words into four groups of four. */
export function Connections(
  /** The component props. */
  { puzzle }: Props,
) {
  const [state, setState] = usePersistentState<ConnectionsState>(
    `progress:connections:${puzzle.date}`,
    () => initialState(puzzle),
  )
  const [selected, setSelected] = useState<string[]>([])
  const [displayOrder, setDisplayOrder] = useState<string[]>()
  const [merging, setMerging] = useState<ConnectionsGroup>()
  const grid = useRef<HTMLDivElement>(null)
  const mergingBand = useRef<HTMLDivElement>(null)
  const submitting = useRef(false)
  const [busy, setBusy] = useState(false)
  const animate = useConnectionsAnimation()
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
  const submit = async () => {
    if (selected.length !== 4 || over || submitting.current) return
    submitting.current = true
    setBusy(true)
    const tiles = [
      ...(grid.current?.querySelectorAll<HTMLButtonElement>("button[aria-pressed=true]") ?? []),
    ]
    if (
      !(await animate(
        tiles.map((element, index) => ({
          element,
          keyframes: [0, -10, 0].map(y => ({ transform: `translateY(${y}px)` })),
          options: { duration: 200, delay: index * 55, easing: "ease-in-out", fill: "both" },
        })),
      ))
    )
      return
    const { state: next, result } = submitGuess(state, selected, puzzle)
    if (
      result === "correct" &&
      grid.current &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const allTiles = [...grid.current.querySelectorAll<HTMLButtonElement>("button")]
      const starts = allTiles.map(element => ({ element, from: element.getBoundingClientRect() }))
      // Reorder first, then animate from each tile's old position into its new slot.
      flushSync(() =>
        setDisplayOrder([
          ...words.filter(word => selected.includes(word)),
          ...words.filter(word => !selected.includes(word)),
        ]),
      )
      if (
        !(await animate(
          starts.map(({ element, from }) => {
            const to = element.getBoundingClientRect()
            return {
              element,
              keyframes: [
                {
                  transform: `translate(${from.x - to.x}px, ${from.y - to.y}px)`,
                  zIndex: selected.includes(element.textContent!) ? 1 : 0,
                },
                {
                  transform: "translate(0px, 0px)",
                  zIndex: selected.includes(element.textContent!) ? 1 : 0,
                },
              ],
              options: { duration: 240, easing: "ease-in-out" },
            }
          }),
        ))
      )
        return
      const group = puzzle.groups[next.solved.at(-1)!]
      flushSync(() => setMerging(group))
      const bounds = grid.current.getBoundingClientRect()
      if (
        !(await animate([
          ...tiles.map((element, index) => {
            const box = element.getBoundingClientRect()
            const width = bounds.width / 4
            return {
              element,
              keyframes: [
                { transform: "translateX(0px) scaleX(1)", transformOrigin: "left center" },
                {
                  transform: `translateX(${bounds.x + index * width - box.x}px) scaleX(${width / box.width})`,
                  transformOrigin: "left center",
                  backgroundColor: `var(--group-${group.level})`,
                  color: "transparent",
                  borderRadius: "0px",
                },
              ],
              options: { duration: 200, easing: "ease-in-out", fill: "forwards" as const },
            }
          }),
          {
            element: mergingBand.current!,
            keyframes: [{ opacity: 0 }, { opacity: 0, offset: 0.4 }, { opacity: 1 }],
            options: { duration: 200, fill: "forwards" },
          },
        ]))
      )
        return
    }
    if (result === "one-away") toast.show("One away…")
    if (result === "already-guessed") toast.show("Already guessed!")
    if (result === "wrong" && next.mistakes >= MAX_MISTAKES) toast.show("Next time!")
    if (result === "wrong" || result === "one-away") {
      if (
        !(await animate(
          tiles.map(element => ({
            element,
            keyframes: [0, -7, 7, -5, 5, 0].map(x => ({ transform: `translateX(${x}px)` })),
            options: { duration: 320, easing: "ease-in-out" },
          })),
        ))
      )
        return
    }
    setState(next)
    if (result === "correct") setSelected([])
    setDisplayOrder(undefined)
    setMerging(undefined)
    submitting.current = false
    setBusy(false)
  }
  const mix = () => setState(s => ({ ...s, order: shuffle(s.order) }))

  useKeydown(event => {
    if (over || submitting.current) return
    if (event.key === "Enter") submit()
    else if (event.key.toLowerCase() === "s") mix()
    else if (event.key.toLowerCase() === "d") setSelected([])
    else return
    event.preventDefault()
  })

  return (
    <div className="connections-feedback relative mx-auto flex max-w-md flex-col gap-4 p-4 sm:pt-8">
      <Toast message={toast.message} />
      <p className="text-muted-foreground text-center text-sm">Create four groups of four!</p>

      {/* A container, so a solved group's band can be exactly one square tile tall. */}
      <div className="@container grid gap-2">
        {shownGroups.map(i => (
          <SolvedGroup key={i} group={puzzle.groups[i]} missed={!state.solved.includes(i)} />
        ))}
        {!over && (
          <div
            ref={grid}
            className="relative grid grid-cols-4 gap-2"
            role="group"
            aria-label="Words"
            aria-busy={busy}
          >
            {(displayOrder ?? words).map(word => (
              <button
                key={word}
                type="button"
                aria-pressed={selected.includes(word)}
                disabled={busy}
                onClick={() => toggle(word)}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg px-1 text-center leading-tight font-semibold uppercase transition-colors outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/60",
                  word.length > 9
                    ? "text-[0.65rem] sm:text-xs"
                    : word.length > 6
                      ? "text-xs sm:text-sm"
                      : "text-sm sm:text-base",
                  selected.includes(word)
                    ? "bg-(--connections-selected) text-white"
                    : "bg-muted hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_6%)]",
                )}
              >
                {word}
              </button>
            ))}
            {merging && (
              <div
                ref={mergingBand}
                className="pointer-events-none absolute inset-x-0 top-0 opacity-0"
                aria-hidden="true"
              >
                <SolvedGroup group={merging} missed={false} />
              </div>
            )}
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
              className="h-12 rounded-full px-6 text-base"
              onClick={mix}
              disabled={busy}
              title="Shuffle (S)"
            >
              Shuffle
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-full px-6 text-base"
              onClick={() => setSelected([])}
              disabled={busy || !selected.length}
              title="Deselect all (D)"
            >
              Deselect all
            </Button>
            <Button
              className="h-12 rounded-full px-6 text-base"
              onClick={submit}
              disabled={busy || selected.length !== 4}
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
        "text-(--group-foreground) flex h-[calc((100cqw-1.5rem)/4)] flex-col items-center justify-center rounded-lg px-2 text-center",
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
