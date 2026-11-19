import { IconEye, IconHistory } from "@tabler/icons-react"
import { useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { Panel } from "@/components/Panel"
import { Button } from "@/components/ui/button"
import { useElapsed } from "@/lib/useElapsed"
import { useGameStatus } from "@/lib/useGameStatus"
import { useKeydown } from "@/lib/useKeydown"
import { usePersistentState } from "@/lib/usePersistentState"
import { cn } from "@/lib/utils"
import type { LetterBoxedPuzzle } from "@/types"
import { HistoryPanel } from "./HistoryPanel"
import { LetterBox } from "./LetterBox"
import { addLetter } from "./logic/addLetter"
import { initialState } from "./logic/initialState"
import { isSolution } from "./logic/isSolution"
import { isSolved } from "./logic/isSolved"
import { removeLetter } from "./logic/removeLetter"
import { restoreChain } from "./logic/restoreChain"
import { submitWord } from "./logic/submitWord"
import { type LetterBoxedState } from "./logic/types"
import { Message, type LetterBoxedMessage } from "./Message"
import { SolutionsPanel } from "./SolutionsPanel"
import { twoWordSolutions } from "./logic/twoWordSolutions"
import { WordChain } from "./WordChain"
import "./letter-boxed.css"

/** Letter Boxed: chain words that use every letter around the square. */
export function LetterBoxed(
  /** The component props. */
  { puzzle, toolbar }: Props,
) {
  const [saved, setSaved] = usePersistentState<LetterBoxedState>(
    `progress:letter-boxed:${puzzle.date}`,
    initialState,
  )
  // Progress saved before the history existed has none.
  const state = { ...initialState(), ...saved }
  const setState = (change: (s: LetterBoxedState) => LetterBoxedState) =>
    setSaved(s => change({ ...initialState(), ...s }))
  const [panel, setPanel] = useState<"history" | "solutions">()
  const solutions = useMemo(() => twoWordSolutions(puzzle), [puzzle])
  const [acceptedWordIndex, setAcceptedWordIndex] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<LetterBoxedMessage>()
  const finished = isSolution(state.words, puzzle)
  const solved = isSolved(state, puzzle)
  const elapsed = useElapsed(`time:letter-boxed:${puzzle.date}`, !solved)
  useGameStatus(
    "letter-boxed",
    puzzle.date,
    solved ? "solved" : state.history.length || state.current ? "started" : "new",
  )

  // A finished chain keeps its message until a new chain starts.
  const message: LetterBoxedMessage | undefined = finished
    ? {
        id: 0,
        kind: "solution",
        words: state.words.length,
        isNew: feedback?.kind === "solution",
      }
    : feedback

  /** Change the board, dropping the accept animation and any finished-chain celebration. */
  const update = (change: (s: LetterBoxedState) => LetterBoxedState) => {
    setAcceptedWordIndex(null)
    setFeedback(f => (f?.kind === "solution" ? undefined : f))
    setState(change)
  }
  const add = (letter: string) => {
    if (finished) update(s => addLetter(s, letter, puzzle))
    else setState(s => addLetter(s, letter, puzzle))
  }
  const remove = () => update(removeLetter)
  const restart = () => {
    update(s => ({ ...s, words: [], current: "" }))
    setFeedback(undefined)
  }
  const restore = (words: string[]) => {
    update(s => restoreChain(s, words, puzzle))
    setFeedback(undefined)
    setPanel(undefined)
  }
  const submit = () => {
    if (!state.current) return
    const result = submitWord(state, puzzle)
    const id = Date.now()
    if (result.error) return setFeedback({ id, kind: "error", text: result.error })
    setAcceptedWordIndex(state.words.length)
    setState(() => result.state)
    setFeedback(
      result.solution
        ? { id, kind: "solution", words: result.state.words.length, isNew: true }
        : { id, kind: "word", text: praise(state.current) },
    )
  }

  useKeydown(event => {
    if (event.key === "Enter") submit()
    else if (event.key === "Backspace") remove()
    else if (event.key === "Escape") restart()
    else if (/^[a-z]$/i.test(event.key)) add(event.key)
    else return
    event.preventDefault()
  })

  const shaking = feedback?.kind === "error"
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-3 px-8 pt-6 pb-12 text-black select-none">
      {toolbar &&
        createPortal(
          <div className="ml-auto flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="size-10"
              aria-label="History"
              title="History"
              onClick={() => setPanel("history")}
            >
              <IconHistory className="size-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-10"
              aria-label="Solutions"
              title="Solutions"
              onClick={() => setPanel("solutions")}
            >
              <IconEye className="size-6" />
            </Button>
          </div>,
          toolbar,
        )}
      <Panel open={panel === "history"} title="History" onClose={() => setPanel(undefined)}>
        <HistoryPanel puzzle={puzzle} history={state.history} onRestore={restore} />
      </Panel>
      <Panel
        open={panel === "solutions"}
        title={`Solutions (${solutions.length})`}
        onClose={() => setPanel(undefined)}
      >
        <SolutionsPanel
          puzzle={puzzle}
          solutions={solutions}
          history={state.history}
          solved={solved}
        />
      </Panel>

      <div className="flex h-10 items-center justify-center">
        <WordChain words={state.words} />
      </div>
      <div className="h-12 px-4">
        <div
          key={shaking ? feedback.id : undefined}
          className={cn(
            "flex h-[50px] w-full items-center justify-center border-b-[3px] border-black",
            shaking && "letter-boxed-shake",
          )}
          aria-label="Current word"
          aria-live="polite"
        >
          <span className="font-condensed text-[30px] font-bold tracking-widest">
            {state.current}
          </span>
          {!finished && <span className="animate-blink ml-1 h-8 w-[3px] bg-black" />}
        </div>
      </div>
      <Message message={message} seconds={elapsed} />
      <div className="p-4 sm:p-12">
        <LetterBox
          puzzle={puzzle}
          state={state}
          onLetter={add}
          acceptedWordIndex={acceptedWordIndex}
        />
      </div>
      <div className="flex justify-center gap-8">
        <button
          className="letter-boxed-button"
          onClick={restart}
          disabled={!state.words.length && !state.current}
        >
          Restart
        </button>
        <button className="letter-boxed-button" onClick={remove}>
          Delete
        </button>
        <button className="letter-boxed-button" onClick={submit}>
          Enter
        </button>
      </div>
    </div>
  )
}

/** A random cheer for an accepted word, bigger for longer words. */
function praise(
  /** The word. */
  word: string,
) {
  const options =
    word.length < 4
      ? ["OK", "Not bad"]
      : word.length < 7
        ? ["Nice!", "Awesome!", "Sweet!"]
        : ["Genius!!", "Amazing!!", "Incredible!!"]
  return options[Math.floor(Math.random() * options.length)]
}

type Props = {
  /** The puzzle. */
  puzzle: LetterBoxedPuzzle
  /** Header element to render the history and solutions buttons into. */
  toolbar: HTMLElement | null
}
