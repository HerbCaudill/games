import { IconCircleCheckFilled } from "@tabler/icons-react"
import { formatDuration } from "@/lib/formatDuration"

/** The message every game shows once its puzzle is solved: how long it took, and maybe a detail. */
export function SolvedMessage(
  /** The component props. */
  { seconds, detail }: Props,
) {
  return (
    <div
      role="status"
      data-solved-message
      className="bg-card text-foreground animate-in fade-in motion-safe:zoom-in-90 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold whitespace-nowrap shadow-sm duration-300"
    >
      <IconCircleCheckFilled className="size-5 text-(--solved)" aria-hidden="true" />
      <span>
        Solved in {formatDuration(seconds)}
        {detail && <span className="text-muted-foreground font-normal"> · {detail}</span>}
      </span>
    </div>
  )
}

type Props = {
  /** Seconds the puzzle took. */
  seconds: number
  /** A short note about how it went, such as "Perfect". */
  detail?: string
}
