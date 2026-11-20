import { IconArrowsShuffle, IconBackspace, IconBulb, IconLayoutGrid } from "@tabler/icons-react"
import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Panel } from "@/components/Panel"
import { SolvedMessage } from "@/components/SolvedMessage"
import { Button } from "@/components/ui/button"
import { Toast } from "@/components/Toast"
import { useElapsed } from "@/lib/useElapsed"
import { useCelebration } from "@/lib/useCelebration"
import { useGameStatus } from "@/lib/useGameStatus"
import { useKeydown } from "@/lib/useKeydown"
import { useNytSync } from "@/lib/useNytSync"
import { usePersistentState } from "@/lib/usePersistentState"
import { cn } from "@/lib/utils"
import { shuffle } from "@/lib/shuffle"
import { useToast } from "@/lib/useToast"
import type { SpellingBeePuzzle } from "@/types"
import { FoundWords } from "./FoundWords"
import { GridPanel } from "./GridPanel"
import { HintsPanel } from "./HintsPanel"
import { Hive } from "./Hive"
import { RankMeter } from "./RankMeter"
import { checkGuess } from "./logic/checkGuess"
import { mergeSync } from "./logic/mergeSync"
import { rankFor } from "./logic/rankFor"
import { toSync } from "./logic/toSync"
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
  useNytSync("spelling-bee", puzzle.date, token, found, setFound, {
    toSync: f => toSync(f, puzzle),
    merge: (f, remote) => mergeSync(f, remote, puzzle),
  })
  const [guess, setGuess] = useState("")
  // A word that wasn't accepted shakes for a moment before it clears.
  const [rejected, setRejected] = useState(false)
  useEffect(() => {
    if (!rejected) return
    const timer = setTimeout(() => {
      setGuess("")
      setRejected(false)
    }, SHAKE_MS)
    return () => clearTimeout(timer)
  }, [rejected])
  const [outer, setOuter] = useState(puzzle.outer)
  const toast = useToast()
  const score = totalScore(found, puzzle)
  const rank = rankFor(score, puzzle)
  const reached = (name: string) => score >= rank.ranks.find(r => r.name === name)!.score
  // Genius counts as solved: it stops the clock and gets the big celebration, which Queen Bee gets too.
  const solved = reached("Genius")
  // The word grid and stats show only once the player reaches Amazing, and hints once they reach Genius.
  const gridAllowed = reached("Amazing")
  const hintsAllowed = reached("Genius")
  // Counts each new rank reached by playing, so it gets its own small celebration.
  const [rankUp, setRankUp] = useState<number>()
  const endRankUp = useCallback(() => setRankUp(undefined), [])
  const elapsed = useElapsed(`time:spelling-bee:${puzzle.date}`, !solved)
  useGameStatus("spelling-bee", puzzle.date, solved ? "solved" : found.length ? "started" : "new")
  useCelebration("spelling-bee", `queen-bee:${puzzle.date}`, score === rank.max)

  const letters = new Set([puzzle.center, ...puzzle.outer])
  // Typing over a shaking word starts a new one.
  const add = (letter: string) => {
    setRejected(false)
    setGuess(g => {
      const word = rejected ? "" : g
      return word.length < 19 ? word + letter.toLowerCase() : word
    })
  }
  const remove = () => {
    setRejected(false)
    setGuess(g => (rejected ? "" : g.slice(0, -1)))
  }
  const submit = () => {
    if (!guess || rejected) return
    const result = checkGuess(guess, puzzle, found)
    if (!result.ok) {
      setRejected(true)
      return toast.show(result.message)
    }
    setGuess("")
    setFound(f => [...f, result.word])
    if (rankFor(score + result.score, puzzle).name !== rank.name) setRankUp(n => (n ?? 0) + 1)
    toast.show(
      result.pangram
        ? "Pangram!"
        : result.score === 1
          ? "Good!"
          : result.word.length < 7
            ? "Nice!"
            : "Awesome!",
      { success: true, points: result.score },
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

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 md:flex-row-reverse md:items-start md:pt-8">
      {toolbar &&
        createPortal(
          <div className="ml-auto flex items-center">
            {hintsAllowed && (
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
            )}
            {gridAllowed && (
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
            )}
          </div>,
          toolbar,
        )}
      <Panel
        open={panel === "hints" && hintsAllowed}
        title="Hints"
        onClose={() => setPanel(undefined)}
      >
        <HintsPanel date={puzzle.date} token={token} found={found} />
      </Panel>
      <Panel
        open={panel === "grid" && gridAllowed}
        title="Word grid and stats"
        onClose={() => setPanel(undefined)}
      >
        <GridPanel puzzle={puzzle} token={token} found={found} />
      </Panel>
      <section className="flex-1 md:max-w-sm">
        <RankMeter
          score={score}
          rank={rank}
          rankUp={rankUp}
          onRankUpDone={endRankUp}
          pangrams={{
            found: puzzle.pangrams.filter(word => found.includes(word)).length,
            total: puzzle.pangrams.length,
          }}
        />
        <div className="mt-4">
          <FoundWords found={found} pangrams={puzzle.pangrams} />
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center">
        {/* Messages get their own place above the word, so they never cover it. */}
        <div className="relative h-9 w-full">
          <Toast message={toast.message} />
        </div>
        <div
          className={cn(
            "flex h-12 items-center text-3xl font-bold tracking-wide uppercase",
            rejected && "motion-safe:animate-shake",
          )}
          style={{ animationDuration: `${SHAKE_MS}ms` }}
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
        {/* Below the puzzle, so it doesn't move anything when it appears. */}
        {solved && (
          <div className="mt-6">
            <SolvedMessage seconds={elapsed} />
          </div>
        )}
      </section>
    </div>
  )
}

// CONSTANTS

/** How long a word that wasn't accepted shakes before it clears. */
const SHAKE_MS = 500

// TYPES

type Props = {
  /** The puzzle. */
  puzzle: SpellingBeePuzzle
  /** The NYT-S cookie value saved on this device, for hints and player stats. */
  token: string
  /** Header element to render the hints and grid buttons into. */
  toolbar: HTMLElement | null
}
