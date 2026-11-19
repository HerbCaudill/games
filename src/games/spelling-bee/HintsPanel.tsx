import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useApi } from "@/lib/useApi"
import { cn } from "@/lib/utils"
import type { SpellingBeeHints } from "@/types"
import { hintGroups } from "./logic/hintGroups"
import { hintsRequest } from "./hintsRequest"
import { WordDots } from "./WordDots"

/** AI-written clues for the answers, grouped by first two letters, with found answers hidden by default. */
export function HintsPanel(
  /** The component props. */
  { date, token, found }: Props,
) {
  const { path, storageKey } = hintsRequest(date)
  const load = useApi<SpellingBeeHints>(path, token, { storageKey })
  const [showFound, setShowFound] = useState(false)

  if (load.status === "idle" || load.status === "loading")
    return (
      <p className="text-muted-foreground py-8 text-center">
        Writing hints… this takes a few seconds.
      </p>
    )
  if (load.status !== "ready")
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-destructive">Couldn’t get hints: {load.message}</p>
        <Button variant="outline" onClick={load.retry}>
          Try again
        </Button>
      </div>
    )

  const groups = hintGroups(load.data.hints, found).filter(
    group => showFound || group.found < group.hints.length,
  )
  return (
    <div className="flex flex-col gap-3">
      <label className="flex cursor-pointer items-center gap-2 self-end text-sm">
        <input
          type="checkbox"
          checked={showFound}
          onChange={event => setShowFound(event.target.checked)}
          className="accent-primary size-4"
        />
        Show found words
      </label>
      {groups.length === 0 && (
        <p className="text-muted-foreground py-8 text-center">You’ve found every word.</p>
      )}
      <div className="flex flex-col gap-1">
        {groups.map(group => (
          <details key={group.prefix} className="rounded-lg border">
            <summary className="flex cursor-pointer items-center gap-3 px-3 py-2">
              <span className="w-8 font-semibold uppercase">{group.prefix}</span>
              <WordDots count={{ found: group.found, total: group.hints.length }} />
              <span className="text-muted-foreground ml-auto text-xs">
                {group.found}/{group.hints.length}
              </span>
            </summary>
            <ul className="divide-y border-t">
              {group.hints
                .filter(hint => showFound || !hint.found)
                .map(hint => (
                  <li
                    key={hint.word}
                    className={cn(
                      "flex gap-3 px-3 py-2 text-sm",
                      hint.found && "text-muted-foreground",
                    )}
                  >
                    <span className="text-muted-foreground w-5 shrink-0 text-right font-mono text-xs leading-5">
                      {hint.word.length}
                    </span>
                    <span>
                      {hint.clue}
                      {hint.found && (
                        <span className="ml-2 font-semibold uppercase">{hint.word}</span>
                      )}
                    </span>
                  </li>
                ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  )
}

type Props = {
  /** Puzzle date as YYYY-MM-DD. */
  date: string
  /** The NYT-S cookie value saved on this device. */
  token: string
  /** Answers found so far. */
  found: string[]
}
