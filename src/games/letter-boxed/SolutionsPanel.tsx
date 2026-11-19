import { IconCircleCheckFilled } from "@tabler/icons-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LetterBoxedPuzzle } from "@/types"
import { WordChain } from "./WordChain"

/** Every two-word solution in the NYT word list, with NYT's own in bold. Until the puzzle is solved, they stay hidden behind a button. */
export function SolutionsPanel(
  /** The component props. */
  { puzzle, solutions, history, solved }: Props,
) {
  const [revealed, setRevealed] = useState(false)
  if (!solved && !revealed)
    return (
      <div className="flex justify-center py-8">
        <Button variant="outline" onClick={() => setRevealed(true)}>
          Show solutions
        </Button>
      </div>
    )

  const nyt = puzzle.solution.join(" ")
  const found = new Set(history.map(words => words.join(" ")))
  return (
    <ul className="divide-y text-sm">
      {solutions.map(words => {
        const key = words.join(" ")
        return (
          <li
            key={key}
            className={cn("flex items-center gap-3 px-1 py-2", key === nyt && "font-bold")}
          >
            {/* A fixed slot, so the words line up whether or not a row is marked. */}
            <span className="size-5 shrink-0">
              {found.has(key) && (
                <IconCircleCheckFilled
                  className="size-5 text-(--solved)"
                  aria-label="You found this"
                  role="img"
                />
              )}
            </span>
            <WordChain words={words} />
            {key === nyt && <span className="sr-only">NYT’s solution</span>}
          </li>
        )
      })}
    </ul>
  )
}

type Props = {
  /** The puzzle. */
  puzzle: LetterBoxedPuzzle
  /** Every two-word solution, in the order to list them. */
  solutions: string[][]
  /** Chains tried so far, to mark the solutions already found. */
  history: string[][]
  /** Whether the puzzle is solved, so the solutions can show without asking. */
  solved: boolean
}
