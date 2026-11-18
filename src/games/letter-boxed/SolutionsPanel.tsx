import { IconCheck } from "@tabler/icons-react"
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import type { LetterBoxedPuzzle } from "@/types"
import { twoWordSolutions } from "./logic/twoWordSolutions"
import { WordChain } from "./WordChain"

/** Every two-word solution in the NYT word list, with the official one first. */
export function SolutionsPanel(
  /** The component props. */
  { puzzle, history }: Props,
) {
  const solutions = useMemo(() => twoWordSolutions(puzzle), [puzzle])
  const official = puzzle.solution.join(" ")
  const found = new Set(history.map(words => words.join(" ")))
  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-sm">
        {solutions.length === 1
          ? "One two-word solution"
          : `${solutions.length} two-word solutions`}{" "}
        in the NYT word list.
      </p>
      <ul className="divide-y">
        {solutions.map(words => {
          const key = words.join(" ")
          const isOfficial = key === official
          return (
            <li
              key={key}
              className={cn(
                "flex items-center gap-2 px-1 py-2",
                isOfficial && "rounded bg-(--letter-boxed-background) font-semibold",
              )}
            >
              <span className="flex-1">
                <WordChain words={words} />
              </span>
              {isOfficial && <span className="text-xs">Official</span>}
              {found.has(key) && (
                <IconCheck className="size-4 text-(--solved)" aria-label="You found this" />
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

type Props = {
  /** The puzzle. */
  puzzle: LetterBoxedPuzzle
  /** Chains tried so far, to mark the solutions already found. */
  history: string[][]
}
