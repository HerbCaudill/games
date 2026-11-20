import { IconChevronDown } from "@tabler/icons-react"
import { useLayoutEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * The words found so far, behind a bar that opens them. Closed, the bar shows the newest words that
 * fit; open, it gives the count. On phones the open list covers the board instead of pushing it
 * down, as in the NYT app.
 */
export function FoundWords(
  /** The component props. */
  { found, pangrams }: Props,
) {
  const [open, setOpen] = useState(false)
  const recent = useRecentWordMotion(found, open)
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
          aria-label={`You have found ${found.length} ${found.length === 1 ? "word" : "words"}`}
          className="flex h-10 w-full items-center justify-between gap-3 px-3 text-left text-sm"
        >
          {open ? (
            <span>
              You have found {found.length} {found.length === 1 ? "word" : "words"}
            </span>
          ) : found.length ? (
            // Newest first, laid out from the right: whole words that don't fit wrap out of sight.
            <span className="flex h-10 min-w-0 flex-1 flex-row-reverse flex-wrap justify-end gap-x-2 overflow-hidden">
              {[...found].reverse().map(word => (
                <span
                  key={word}
                  ref={recent(word)}
                  className={cn(
                    "flex h-10 items-center whitespace-nowrap",
                    pangrams.includes(word) && "font-semibold",
                  )}
                >
                  {capitalize(word)}
                </span>
              ))}
            </span>
          ) : (
            <span className="text-muted-foreground">Your words</span>
          )}
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
                {capitalize(word)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/**
 * Animate the closed bar when a word is found: the older words slide over to make room, then the
 * new word types in. Returns a ref for each word's element.
 */
function useRecentWordMotion(
  /** Words found so far, in the order found. */
  found: string[],
  /** Whether the list is open, hiding the bar's words. */
  open: boolean,
) {
  const elements = useRef(new Map<string, HTMLElement>())
  const lefts = useRef(new Map<string, number>())
  // The words the bar last showed; unset when it first shows or closes again, so nothing animates then.
  const shown = useRef<Set<string>>(undefined)

  useLayoutEffect(() => {
    const before = lefts.current
    lefts.current = new Map(
      [...elements.current].map(([word, el]) => [word, el.getBoundingClientRect().left]),
    )
    const known = shown.current
    shown.current = open ? undefined : new Set(found)
    if (!known || matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const moves = [...elements.current].flatMap(([word, el]) => {
      const was = before.get(word)
      const now = lefts.current.get(word)!
      return known.has(word) && was !== undefined && was !== now ? [{ el, by: was - now }] : []
    })
    for (const { el, by } of moves)
      el.animate([{ transform: `translateX(${by}px)` }, { transform: "none" }], {
        duration: SLIDE_MS,
        easing: "ease-out",
      })
    // Once the others have made room, the new word types in.
    for (const [word, el] of elements.current)
      if (!known.has(word))
        el.animate([{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }], {
          delay: moves.length ? SLIDE_MS : 0,
          duration: TYPE_MS * word.length,
          easing: `steps(${word.length}, jump-start)`,
          fill: "backwards",
        })
  }, [found, open])

  return (word: string) => (el: HTMLElement | null) => {
    if (el) elements.current.set(word, el)
    else elements.current.delete(word)
  }
}

/** A word with its first letter capitalized. */
function capitalize(
  /** The word. */
  word: string,
) {
  return word[0].toUpperCase() + word.slice(1)
}

// CONSTANTS

/** How long each letter of a newly found word takes to appear in the bar. */
const TYPE_MS = 40

/** How long the older words take to slide over for a new one. */
const SLIDE_MS = 250

/** Rows a column holds before the list starts its second column. */
const MIN_ROWS = 10

type Props = {
  /** Words found so far, lowercase. */
  found: string[]
  /** The puzzle's pangrams, shown bold. */
  pangrams: string[]
}
