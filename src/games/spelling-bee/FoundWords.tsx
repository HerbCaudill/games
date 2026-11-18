import { IconChevronDown } from "@tabler/icons-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

/**
 * The words found so far, behind a bar that opens them. On phones the open list covers the board
 * instead of pushing it down, as in the NYT app.
 */
export function FoundWords(
  /** The component props. */
  { found, pangrams }: Props,
) {
  const [open, setOpen] = useState(false)
  const sorted = [...found].sort()
  // Fill the first column before starting the second, like the NYT list.
  const rows = Math.max(MIN_ROWS, Math.ceil(sorted.length / 2))
  return (
    <div className="relative h-10 md:h-auto">
      <div
        className={cn(
          "bg-card rounded-lg border max-md:absolute max-md:inset-x-0 max-md:top-0 max-md:z-20",
          open && "max-md:shadow-lg",
        )}
      >
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
          className="flex h-10 w-full items-center justify-between px-3 text-left text-sm"
        >
          You have found {found.length} {found.length === 1 ? "word" : "words"}
          <IconChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </button>
        {open && (
          <ul
            aria-label="Found words"
            className="grid grid-flow-col grid-cols-2 content-start gap-x-8 overflow-auto px-3 pb-3 max-md:h-[60svh]"
            style={{ gridTemplateRows: `repeat(${rows}, auto)` }}
          >
            {sorted.map(word => (
              <li
                key={word}
                className={cn("border-b py-2", pangrams.includes(word) && "font-semibold")}
              >
                {word[0].toUpperCase() + word.slice(1)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// CONSTANTS

/** Rows a column holds before the list starts its second column. */
const MIN_ROWS = 10

type Props = {
  /** Words found so far, lowercase. */
  found: string[]
  /** The puzzle's pangrams, shown bold. */
  pangrams: string[]
}
