import { IconCircleCheckFilled, IconStarFilled } from "@tabler/icons-react"
import type { LetterBoxedPuzzle } from "@/types"
import { WordChain } from "./WordChain"

/** Every two-word solution in the NYT word list, with NYT's own starred. */
export function SolutionsPanel(
  /** The component props. */
  { puzzle, solutions, history }: Props,
) {
  const nyt = puzzle.solution.join(" ")
  const found = new Set(history.map(words => words.join(" ")))
  return (
    <ul className="divide-y">
      {solutions.map(words => {
        const key = words.join(" ")
        return (
          <li key={key} className="flex items-center gap-3 px-1 py-2">
            {/* Fixed slots, so the words line up whichever marks a row has. */}
            <span className="flex shrink-0 gap-1">
              <span className="size-5">
                {key === nyt && (
                  <IconStarFilled
                    className="size-5 text-(--nyt-star)"
                    aria-label="NYT solution"
                    role="img"
                  />
                )}
              </span>
              <span className="size-5">
                {found.has(key) && (
                  <IconCircleCheckFilled
                    className="size-5 text-(--solved)"
                    aria-label="You found this"
                    role="img"
                  />
                )}
              </span>
            </span>
            <WordChain words={words} />
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
}
