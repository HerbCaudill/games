import { IconCheck, IconClock, IconX } from "@tabler/icons-react"
import type { GameInfo } from "@/constants"
import { GroupsProgress } from "@/games/connections/GroupsProgress"
import { GridProgress } from "@/games/crossword/GridProgress"
import { HiveProgress } from "@/games/spelling-bee/HiveProgress"
import { formatDuration } from "@/lib/formatDuration"
import { navigate } from "@/lib/navigate"
import { GameGlyph } from "./GameGlyph"
import type { HomeProgress, HomeTile as Tile } from "./readHomeTile"

/** A game's tile on the home menu: its name, the time spent, and a picture of progress. */
export function HomeTile(
  /** The component props. */
  { game, href, shortcut, tile }: Props,
) {
  const { status, elapsed, progress } = tile
  const time = elapsed === undefined ? "" : formatDuration(elapsed)
  return (
    <a
      href={href}
      onClick={event => {
        event.preventDefault()
        navigate(href)
      }}
      className="text-foreground grid min-h-38 grid-cols-[1fr_auto] gap-4 rounded-[20px] py-5 pr-5 pl-[22px] transition-[filter] outline-none hover:brightness-95"
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
          {status === "solved" && (
            <>
              <IconCheck className="size-4" stroke={2.5} aria-hidden="true" />
              {time ? `Solved in ${time}` : "Solved"}
            </>
          )}
          {status === "failed" && (
            <>
              <IconX className="size-4" stroke={2.5} aria-hidden="true" />
              Out of guesses
            </>
          )}
          {status === "started" && (
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
          <ProgressPicture progress={progress} failed={status === "failed"} />
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
  { progress, failed }: { progress: HomeProgress; failed: boolean },
) {
  const className = "size-22"
  switch (progress.game) {
    case "crossword":
      return <GridProgress filled={progress.filled} className={className} />
    case "spelling-bee":
      return <HiveProgress rank={progress.rank} className={className} />
    case "connections":
      return <GroupsProgress {...progress} failed={failed} className={className} />
  }
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
}
