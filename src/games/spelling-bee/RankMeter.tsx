import { cn } from "@/lib/utils"
import type { Rank, WordCount } from "./logic/types"

/** The player's rank, pangrams found, score, and a bar of progress toward the top rank. */
export function RankMeter(
  /** The component props. */
  { score, rank, pangrams }: Props,
) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <span className="mr-auto text-lg font-semibold">{rank.name}</span>
        {pangrams.total > 0 && (
          <span
            className="inline-flex items-center gap-1"
            aria-label={`${pangrams.found} of ${pangrams.total} ${pangrams.total === 1 ? "pangram" : "pangrams"} found`}
          >
            {Array.from({ length: pangrams.total }, (_, i) => (
              <PangramMark key={i} found={i < pangrams.found} />
            ))}
          </span>
        )}
        <span className="text-muted-foreground text-sm">
          {score} / {rank.max} points
        </span>
      </div>
      <div className="bg-muted relative h-3 overflow-hidden rounded-full" aria-hidden="true">
        <div
          className="h-full rounded-full bg-(--game-spelling-bee) transition-[width] duration-300"
          style={{ width: `${Math.min((score / rank.max) * 100, 100)}%` }}
        />
        {/* A mark at each rank between the first and the last. */}
        {rank.ranks.slice(1, -1).map(step => (
          <span
            key={step.name}
            title={`${step.name}: ${step.score}`}
            className="absolute inset-y-0 w-0.5 rounded-full bg-white/70"
            style={{ left: `${(step.score / rank.max) * 100}%` }}
          />
        ))}
      </div>
      {rank.next && (
        <p className="text-muted-foreground text-sm">
          <span className="font-semibold">{rank.next.score - score}</span>{" "}
          {rank.next.score - score === 1 ? "point" : "points"} to{" "}
          <span className="font-semibold">{rank.next.name}</span>
        </p>
      )}
    </div>
  )
}

/** A small hexagon: filled for a found pangram, outlined for one still to find. */
function PangramMark(
  /** The component props. */
  { found }: { found: boolean },
) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-4", found ? "text-(--game-spelling-bee)" : "text-muted-foreground/50")}
      fill={found ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z" />
    </svg>
  )
}

type Props = {
  /** Current score. */
  score: number
  /** The player's rank. */
  rank: Rank
  /** How many pangrams there are and how many are found. */
  pangrams: WordCount
}
