import { IconArrowsShuffle, IconBackspace } from "@tabler/icons-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Toast } from "@/components/Toast"
import { useGameStatus } from "@/lib/useGameStatus"
import { useKeydown } from "@/lib/useKeydown"
import { usePersistentState } from "@/lib/usePersistentState"
import { shuffle } from "@/lib/shuffle"
import { useToast } from "@/lib/useToast"
import type { SpellingBeePuzzle } from "@/types"
import { Hive } from "./Hive"
import { RankMeter } from "./RankMeter"
import { checkGuess, rankFor, totalScore } from "./spellingBeeRules"

/** Spelling Bee: make words from seven letters, always using the center one. */
export function SpellingBee({ puzzle }: Props) {
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
      <section className="flex-1 md:max-w-sm">
        <RankMeter score={score} rank={rank} />
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

      <section className="relative flex flex-1 flex-col items-center gap-5">
        <Toast message={toast.message} />
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
          <span className="ml-0.5 h-9 w-0.5 animate-pulse bg-(--game-spelling-bee)" />
        </div>
        <Hive center={puzzle.center} outer={outer} onLetter={add} />
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="rounded-full px-5" onClick={remove}>
            <IconBackspace /> Delete
          </Button>
          <Button
            variant="outline"
            size="icon-lg"
            className="rounded-full"
            onClick={mix}
            aria-label="Shuffle"
            title="Shuffle (Space)"
          >
            <IconArrowsShuffle />
          </Button>
          <Button variant="outline" size="lg" className="rounded-full px-5" onClick={submit}>
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
}
