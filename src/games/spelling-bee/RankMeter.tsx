import { cn } from "@/lib/utils"
import type { Rank } from "./logic/types"

/** The player's rank, score and progress toward the top rank. */
export function RankMeter(
  /** The component props. */
  { score, rank }: Props,
) {
  // The last rank needs every word, so the track stops one rank short of it, like the original.
  const steps = rank.ranks.slice(0, -1)
  const reached = steps.filter(r => score >= r.score).length - 1
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold">{rank.name}</span>
        <span className="text-muted-foreground text-sm">
          {score} {score === 1 ? "point" : "points"}
          {rank.next && ` · ${rank.next.score - score} to ${rank.next.name}`}
        </span>
      </div>
      <div className="relative mt-3 flex h-4 items-center justify-between" aria-hidden="true">
        <div className="bg-border absolute inset-x-0 h-0.5" />
        {steps.map((step, i) => (
          <span
            key={step.name}
            title={`${step.name}: ${step.score}`}
            className={cn(
              "relative size-2.5 rounded-full",
              i <= reached ? "bg-(--game-spelling-bee)" : "bg-border",
              i === reached && "size-4",
            )}
          />
        ))}
      </div>
    </div>
  )
}

type Props = {
  /** Current score. */
  score: number
  /** The player's rank. */
  rank: Rank
}
