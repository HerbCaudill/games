import type { LetterBoxedPuzzle } from "@/types"
import { isSolution } from "./logic/isSolution"
import { remainingLetters } from "./logic/remainingLetters"
import { WordChain } from "./WordChain"

/** Every chain tried so far; tapping one brings it back to the board. */
export function HistoryPanel(
  /** The component props. */
  { puzzle, history, onRestore }: Props,
) {
  if (!history.length) return <p className="text-muted-foreground text-sm">No words yet.</p>
  return (
    <ul className="divide-y">
      {history.map((words, i) => {
        const remaining = remainingLetters(words, puzzle)
        return (
          <li key={i}>
            <button
              className="hover:bg-muted flex w-full items-center gap-2 rounded px-1 py-2 text-left"
              title="Bring back this chain"
              onClick={() => onRestore(words)}
            >
              <span className="flex-1">
                <WordChain words={words} />
              </span>
              {isSolution(words, puzzle) ? (
                <span className="flex items-center gap-2 font-black">
                  {words.length === 2 && <span className="text-xl">🎉</span>}
                  <span
                    className="rounded bg-(--solved) px-2 text-xs text-white"
                    aria-label={`Solved in ${words.length} words`}
                  >
                    {words.length}
                  </span>
                </span>
              ) : (
                // Only worth showing once most letters are used.
                remaining.length < 3 && (
                  <span
                    className="text-muted-foreground font-mono font-bold"
                    aria-label={`Missing ${remaining}`}
                  >
                    {remaining}
                  </span>
                )
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

type Props = {
  /** The puzzle. */
  puzzle: LetterBoxedPuzzle
  /** Chains tried so far, oldest first. */
  history: string[][]
  /** Called with a chain to bring back. */
  onRestore: (words: string[]) => void
}
