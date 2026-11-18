import { IconArrowsShuffle, IconBackspace, IconBulb, IconLayoutGrid } from "@tabler/icons-react"
import { useState } from "react"
import { createPortal } from "react-dom"
import { Panel } from "@/components/Panel"
import { Button } from "@/components/ui/button"
import { Toast } from "@/components/Toast"
import { useGameStatus } from "@/lib/useGameStatus"
import { useKeydown } from "@/lib/useKeydown"
import { usePersistentState } from "@/lib/usePersistentState"
import { shuffle } from "@/lib/shuffle"
import { useToast } from "@/lib/useToast"
import type { SpellingBeePuzzle } from "@/types"
import { GridPanel } from "./GridPanel"
import { HintsPanel } from "./HintsPanel"
import { Hive } from "./Hive"
import { RankMeter } from "./RankMeter"
import { checkGuess } from "./logic/checkGuess"
import { rankFor } from "./logic/rankFor"
import { totalScore } from "./logic/totalScore"

/** Spelling Bee: make words from seven letters, always using the center one. */
export function SpellingBee(
  /** The component props. */
  { puzzle, token, toolbar }: Props,
) {
  const [panel, setPanel] = useState<"hints" | "grid">()
  const [found, setFound] = usePersistentState<string[]>(
    `progress:spelling-bee:${puzzle.date}`,
    () => [],
  )
  const [guess, setGuess] = useState("")
  const [outer, setOuter] = useState(puzzle.outer)
  const toast = useToast()
  const score = totalScore(found, puzzle)
  const rank = rankFor(score, puzzle)
  useGameStatus(
    "spelling-bee",
    puzzle.date,
    score === rank.max ? "solved" : found.length ? "started" : "new",
  )

  const letters = new Set([puzzle.center, ...puzzle.outer])
  const add = (letter: string) => setGuess(g => (g.length < 19 ? g + letter.toLowerCase() : g))
  const remove = () => setGuess(g => g.slice(0, -1))
  const submit = () => {
    if (!guess) return
    const result = checkGuess(guess, puzzle, found)
    setGuess("")
    if (!result.ok) return toast.show(result.message)
    setFound(f => [...f, result.word])
    toast.show(
      result.pangram
        ? `Pangram! +${result.score}`
        : result.score === 1
          ? "Good! +1"
          : result.word.length < 7
            ? `Nice! +${result.score}`
            : `Awesome! +${result.score}`,
    )
  }
  const mix = () => setOuter(o => shuffle(o))

  useKeydown(event => {
    if (event.key === "Enter") submit()
    else if (event.key === "Backspace") remove()
    else if (event.key === " ") mix()
    else if (/^[a-z]$/i.test(event.key)) add(event.key)
    else return
    event.preventDefault()
  })

  const sorted = [...found].sort()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 md:flex-row-reverse md:items-start md:pt-8">
      {toolbar &&
        createPortal(
          <div className="ml-auto flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="size-10"
              aria-label="Hints"
              title="Hints"
              onClick={() => setPanel("hints")}
            >
              <IconBulb className="size-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-10"
              aria-label="Word grid and stats"
              title="Word grid and stats"
              onClick={() => setPanel("grid")}
            >
              <IconLayoutGrid className="size-6" />
            </Button>
          </div>,
          toolbar,
        )}
      <Panel open={panel === "hints"} title="Hints" onClose={() => setPanel(undefined)}>
        <HintsPanel date={puzzle.date} token={token} found={found} />
      </Panel>
      <Panel
        open={panel === "grid"}
        title="Word grid and stats"
        onClose={() => setPanel(undefined)}
      >
        <GridPanel puzzle={puzzle} token={token} found={found} />
      </Panel>
      <section className="flex-1 md:max-w-sm">
        <RankMeter
          score={score}
          rank={rank}
          pangrams={{
            found: puzzle.pangrams.filter(word => found.includes(word)).length,
            total: puzzle.pangrams.length,
          }}
        />
        <details className="bg-card mt-4 rounded-lg border">
          <summary className="cursor-pointer px-3 py-2 text-sm">
            You have found {found.length} {found.length === 1 ? "word" : "words"}
          </summary>
          <ul className="columns-2 gap-4 px-3 pb-3 text-sm sm:columns-3 md:columns-2">
            {sorted.map(word => (
              <li
                key={word}
                className={puzzle.pangrams.includes(word) ? "font-semibold" : undefined}
              >
                {word[0].toUpperCase() + word.slice(1)}
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section className="flex flex-1 flex-col items-center">
        {/* Messages get their own place above the word, so they never cover it. */}
        <div className="relative h-9 w-full">
          <Toast message={toast.message} />
        </div>
        <div
          className="flex h-12 items-center text-3xl font-semibold tracking-wide uppercase"
          aria-live="polite"
          aria-label="Current word"
        >
          {[...guess].map((letter, i) => (
            <span
              key={i}
              className={
                letter === puzzle.center
                  ? "text-(--game-spelling-bee)"
                  : letters.has(letter)
                    ? undefined
                    : "text-muted-foreground/50"
              }
            >
              {letter}
            </span>
          ))}
          <span className="animate-blink ml-0.5 h-9 w-0.5 bg-(--game-spelling-bee)" />
        </div>
        <div className="mt-6">
          <Hive center={puzzle.center} outer={outer} onLetter={add} />
        </div>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="h-12 rounded-full px-6 text-base" onClick={remove}>
            <IconBackspace /> Delete
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-12 rounded-full [&_svg:not([class*='size-'])]:size-5"
            onClick={mix}
            aria-label="Shuffle"
            title="Shuffle (Space)"
          >
            <IconArrowsShuffle />
          </Button>
          <Button variant="outline" className="h-12 rounded-full px-6 text-base" onClick={submit}>
            Enter
          </Button>
        </div>
      </section>
    </div>
  )
}

type Props = {
  /** The puzzle. */
  puzzle: SpellingBeePuzzle
  /** The NYT-S cookie value saved on this device, for hints and player stats. */
  token: string
  /** Header element to render the hints and grid buttons into. */
  toolbar: HTMLElement | null
}
