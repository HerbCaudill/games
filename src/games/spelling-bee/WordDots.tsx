import type { WordCount } from "./logic/types"

/** One dot per answer: filled for each found, hollow for each still to find. */
export function WordDots(
  /** The component props. */
  { count }: Props,
) {
  return (
    <span className="inline-flex flex-wrap gap-0.5" aria-hidden="true">
      {Array.from({ length: count.total }, (_, i) => (
        <span
          key={i}
          className={
            i < count.found
              ? "size-2 rounded-full bg-(--game-spelling-bee)"
              : "border-muted-foreground/50 size-2 rounded-full border"
          }
        />
      ))}
    </span>
  )
}

type Props = {
  /** How many answers there are and how many are found. */
  count: WordCount
}
