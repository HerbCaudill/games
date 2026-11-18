import type { GameId } from "@/types"

/** A small drawing that stands for a game. */
export function GameGlyph(
  /** The component props. */
  { game, className }: Props,
) {
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
const STROKE_WIDTH = 2

/** Glyph shapes by game. */
const GLYPHS: Record<GameId, React.ReactNode> = {
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
      <path d="M16 9v14" fill="none" />
      <circle cx="9" cy="16" r="2" stroke="none" />
      <circle cx="22" cy="13" r="1.8" stroke="none" />
      <circle cx="26" cy="19" r="1.8" stroke="none" />
    </>
  ),
  "spelling-bee": <path d="M16 3 27.3 9.5v13L16 29 4.7 22.5v-13z" fill="#fff" />,
  connections: (
    <>
      <rect x="4" y="4" width="10" height="10" rx="2" />
      <rect x="18" y="4" width="10" height="10" rx="2" fill="#fff" />
      <rect x="4" y="18" width="10" height="10" rx="2" fill="#fff" />
      <rect x="18" y="18" width="10" height="10" rx="2" />
    </>
  ),
  "letter-boxed": (
    <>
      <rect x="5" y="5" width="22" height="22" fill="#fff" />
      <path d="M10 5 27 16 16 27 5 12" fill="none" />
      <circle cx="10" cy="5" r="2.5" stroke="none" />
      <circle cx="27" cy="16" r="2.5" stroke="none" />
      <circle cx="16" cy="27" r="2.5" stroke="none" />
      <circle cx="5" cy="12" r="2.5" stroke="none" />
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
