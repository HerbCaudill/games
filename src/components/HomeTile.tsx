import { IconCheck, IconClock, IconX } from "@tabler/icons-react"
import type { GameInfo } from "@/constants"
import { GroupsProgress } from "@/games/connections/GroupsProgress"
import { GridProgress } from "@/games/crossword/GridProgress"
import { StarBadge } from "@/games/crossword/StarBadge"
import { HiveProgress } from "@/games/spelling-bee/HiveProgress"
import { formatDuration } from "@/lib/formatDuration"
import { cn } from "@/lib/utils"
import { GameGlyph } from "./GameGlyph"
import type { HomeProgress, HomeTile as Tile } from "./readHomeTile"

/** A game's tile on the home menu: its name, the time spent, and a picture of progress; or, before its puzzle is out, how long until it is. */
export function HomeTile(
  /** The component props. */
  { game, href, shortcut, tile, wait, shaking, onOpen, onShakeEnd }: Props,
) {
  const { status, elapsed, progress } = tile
  const time = elapsed === undefined ? "" : formatDuration(elapsed)
  const locked = wait > 0
  return (
    <a
      href={href}
      aria-disabled={locked || undefined}
      onClick={event => {
        event.preventDefault()
        onOpen()
      }}
      onAnimationEnd={onShakeEnd}
      className={cn(
        "text-foreground grid min-h-38 grid-cols-[1fr_auto] gap-4 rounded-[20px] py-5 pr-5 pl-[22px] transition-[filter] outline-none",
        locked ? "cursor-default" : "hover:brightness-95",
        shaking && "motion-safe:animate-shake",
      )}
      style={{ background: game.color }}
    >
      <span className="flex min-w-0 flex-col justify-between">
        <span className="font-condensed text-[28px] leading-[1.05] font-bold sm:text-[32px]">
          {game.name}
          <kbd className="ml-2 hidden rounded border border-current px-1.5 align-[6px] font-mono text-xs font-normal opacity-45 pointer-fine:inline">
            {shortcut}
          </kbd>
        </span>
        <span className="flex items-center gap-1.5 text-sm font-medium tabular-nums opacity-75">
          {locked && (
            <>
              <IconClock className="size-4" aria-hidden="true" />
              Available in {formatWait(wait)}
            </>
          )}
          {!locked && status === "solved" && (
            <>
              <IconCheck className="size-4" stroke={2.5} aria-hidden="true" />
              {time ? `Solved in ${time}` : "Solved"}
            </>
          )}
          {!locked && status === "failed" && (
            <>
              <IconX className="size-4" stroke={2.5} aria-hidden="true" />
              Out of guesses
            </>
          )}
          {!locked && status === "started" && (
            <>
              <span className="sr-only">In progress</span>
              {time && (
                <>
                  <IconClock className="size-4" aria-hidden="true" />
                  {time}
                </>
              )}
            </>
          )}
        </span>
      </span>
      <span className="flex w-26 flex-col items-center gap-2">
        {progress ? (
          <ProgressPicture progress={progress} status={status} />
        ) : (
          <GameGlyph game={game.id} className="size-22" />
        )}
        {progress && (
          <span className="text-[11px] font-bold tracking-widest whitespace-nowrap uppercase">
            {label(progress, status === "solved")}
          </span>
        )}
      </span>
    </a>
  )
}

/** The picture of a game's progress. */
function ProgressPicture(
  /** The component props. */
  { progress, status }: { progress: HomeProgress; status: Tile["status"] },
) {
  const className = "size-22"
  switch (progress.game) {
    case "crossword":
      return status === "solved" ? (
        <StarBadge className={className} />
      ) : (
        <GridProgress filled={progress.filled} className={className} />
      )
    case "spelling-bee":
      return <HiveProgress rank={progress.rank} className={className} />
    case "connections":
      return <GroupsProgress {...progress} failed={status === "failed"} className={className} />
  }
}

/** How long until a puzzle comes out, rounded up to the minute, such as "1 hour 54 minutes". */
function formatWait(
  /** Milliseconds to wait. */
  wait: number,
) {
  const minutes = Math.ceil(wait / 60_000)
  const hours = Math.floor(minutes / 60)
  return [plural(hours, "hour"), plural(minutes % 60, "minute")].filter(Boolean).join(" ")
}

/** A count and its unit, such as "2 hours", or nothing for zero. */
function plural(
  /** How many. */
  count: number,
  /** The unit, singular. */
  unit: string,
) {
  if (!count) return ""
  return `${count} ${unit}${count === 1 ? "" : "s"}`
}

/** Words under the picture of progress. */
function label(
  /** The progress shown. */
  progress: HomeProgress,
  /** Whether the puzzle is solved. */
  solved: boolean,
) {
  switch (progress.game) {
    case "crossword":
      return solved ? "" : `${Math.round(progress.filled * 100)}% filled`
    case "spelling-bee":
      return progress.name
    case "connections": {
      const { mistakes, levels } = progress
      if (!solved) return `${levels.length} of 4`
      return mistakes ? `${mistakes} mistake${mistakes === 1 ? "" : "s"}` : "No mistakes"
    }
  }
}

// TYPES

type Props = {
  /** The game. */
  game: GameInfo
  /** Where the tile goes. */
  href: string
  /** The number key that opens the game. */
  shortcut: number
  /** What to show about the puzzle. */
  tile: Tile
  /** Milliseconds until the puzzle comes out, or 0 once it's out. */
  wait: number
  /** Whether the tile is shaking no. */
  shaking: boolean
  /** Called when the tile is clicked. */
  onOpen: () => void
  /** Called when the tile stops shaking. */
  onShakeEnd: () => void
}
