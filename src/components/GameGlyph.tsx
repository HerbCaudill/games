import { PICTURE_STROKE } from "@/constants"
import { GroupsProgress } from "@/games/connections/GroupsProgress"
import { HiveProgress } from "@/games/spelling-bee/HiveProgress"
import type { GameId } from "@/types"

/** A small drawing that stands for a game. Spelling Bee and Connections show their progress pictures with nothing done yet. */
export function GameGlyph(
  /** The component props. */
  { game, className }: Props,
) {
  if (game === "spelling-bee") return <HiveProgress rank={0} className={className} />
  if (game === "connections")
    return <GroupsProgress levels={[]} mistakes={0} failed={false} className={className} />
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      color="#000"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={STROKE_WIDTH}
    >
      {GLYPHS[game]}
    </svg>
  )
}

// CONSTANTS

/** Stroke width, in the glyphs' 32-unit drawing. */
const STROKE_WIDTH = PICTURE_STROKE * 32

/** Glyph shapes by game. */
const GLYPHS: Record<Exclude<GameId, "spelling-bee" | "connections">, React.ReactNode> = {
  crossword: (
    <>
      <path d="M4 4h24v24H4z" fill="#fff" />
      <path d="M4 12h24M4 20h24M12 4v24M20 4v24" fill="none" />
      <path d="M4 4h8v8H4zM20 20h8v8h-8z" stroke="none" />
    </>
  ),
  pips: (
    <>
      <rect x="2" y="9" width="28" height="14" rx="3.5" fill="#fff" />
      {/* The divider stops short of the edges. */}
      <path d="M16 12.5v7" fill="none" strokeLinecap="round" />
      <circle cx="9" cy="16" r="2" stroke="none" />
      <circle cx="22" cy="13" r="1.8" stroke="none" />
      <circle cx="26" cy="19" r="1.8" stroke="none" />
    </>
  ),
  "letter-boxed": (
    <>
      <rect x="5" y="5" width="22" height="22" fill="#fff" />
      {/* Top, bottom, left, right: the first and last strokes cross in the middle. */}
      <path d="M11 5 21 27 5 19 27 11" fill="none" strokeLinejoin="round" />
      <circle cx="11" cy="5" r="2.2" stroke="none" />
      <circle cx="21" cy="27" r="2.2" stroke="none" />
      <circle cx="5" cy="19" r="2.2" stroke="none" />
      <circle cx="27" cy="11" r="2.2" stroke="none" />
    </>
  ),
}

// TYPES

type Props = {
  /** Which game. */
  game: GameId
  /** Size and color classes. */
  className?: string
}
