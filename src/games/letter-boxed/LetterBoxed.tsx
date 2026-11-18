import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Toast } from "@/components/Toast"
import { useGameStatus } from "@/lib/useGameStatus"
import { useKeydown } from "@/lib/useKeydown"
import { usePersistentState } from "@/lib/usePersistentState"
import { useToast } from "@/lib/useToast"
import type { LetterBoxedPuzzle } from "@/types"
import { LetterBox } from "./LetterBox"
import { addLetter } from "./logic/addLetter"
import { initialState } from "./logic/initialState"
import { isSolved } from "./logic/isSolved"
import { removeLetter } from "./logic/removeLetter"
import { submitWord } from "./logic/submitWord"
import { type LetterBoxedState } from "./logic/types"
import "./letter-boxed.css"

/** Letter Boxed: chain words that use every letter around the square. */
export function LetterBoxed(
  /** The component props. */
  { puzzle }: Props,
) {
  const [state, setState] = usePersistentState<LetterBoxedState>(
    `progress:letter-boxed:${puzzle.date}`,
    initialState,
  )
  const [showSolution, setShowSolution] = useState(false)
  const [acceptedWordIndex, setAcceptedWordIndex] = useState<number | null>(null)
  const toast = useToast()
  const solved = isSolved(state, puzzle)
  useGameStatus(
    "letter-boxed",
    puzzle.date,
    solved ? "solved" : state.words.length || state.current ? "started" : "new",
  )

  const add = (letter: string) => !solved && setState(s => addLetter(s, letter, puzzle))
  const remove = () => {
    if (solved) return
    setAcceptedWordIndex(null)
    setState(removeLetter)
  }
  /** Clear this puzzle's progress and all solution feedback. */
  const restart = () => {
    setState(initialState())
    setShowSolution(false)
    setAcceptedWordIndex(null)
  }
  const submit = () => {
    if (solved) return
    const result = submitWord(state, puzzle)
    if (result.error) return toast.show(result.error)
    setAcceptedWordIndex(state.words.length)
    setState(result.state)
  }

  useKeydown(event => {
    if (event.key === "Enter") submit()
    else if (event.key === "Backspace") remove()
    else if (/^[a-z]$/i.test(event.key)) add(event.key)
    else return
    event.preventDefault()
  })

  return (
    <div className="relative mx-auto flex max-w-md flex-col items-center gap-4 p-4 sm:pt-8">
      <Toast message={toast.message} />
      <div className="border-foreground/70 flex h-12 items-end gap-0.5 border-b-2 px-2 text-3xl font-semibold tracking-wide">
        {solved ? "" : state.current}
        {!solved && <span className="animate-blink mb-1 h-8 w-0.5 bg-(--game-letter-boxed)" />}
      </div>
      <p className="text-muted-foreground min-h-5 text-center text-sm">{state.words.join(" – ")}</p>

      <LetterBox
        puzzle={puzzle}
        state={state}
        onLetter={add}
        acceptedWordIndex={acceptedWordIndex}
      />

      {solved ? (
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="font-semibold">Solved in 2 words!</p>
          {showSolution ? (
            <p className="text-muted-foreground text-sm">
              The editor’s solution: {puzzle.solution.join(" – ")}
            </p>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowSolution(true)}>
              Show the editor’s solution
            </Button>
          )}
        </div>
      ) : null}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="rounded-full px-4"
          onClick={restart}
          disabled={!state.words.length && !state.current}
        >
          Restart
        </Button>
        {!solved && (
          <>
            <Button variant="outline" className="rounded-full px-4" onClick={remove}>
              Delete
            </Button>
            <Button className="rounded-full px-4" onClick={submit}>
              Enter
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

type Props = {
  /** The puzzle. */
  puzzle: LetterBoxedPuzzle
}
