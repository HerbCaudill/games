import type { GameId } from "@/types"

/** A small drawing that stands for a game. */
export function GameGlyph({ game, className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      {GLYPHS[game]}
    </svg>
  )
}

// CONSTANTS

/** Glyph shapes by game. */
const GLYPHS: Record<GameId, React.ReactNode> = {
  crossword: (
    <>
      <path d="M3 3h18v18H3z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 3h6v6H3zM15 15h6v6h-6z" />
    </>
  ),
  pips: (
    <>
      <rect
        x="2"
        y="7"
        width="20"
        height="10"
        rx="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M12 7v10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="12" r="1.6" />
      <circle cx="15" cy="10" r="1.4" />
      <circle cx="19" cy="14" r="1.4" />
    </>
  ),
  "spelling-bee": (
    <path
      d="M12 2.5 20.2 7.25v9.5L12 21.5l-8.2-4.75v-9.5zM12 7.5 8.1 9.75v4.5L12 16.5l3.9-2.25v-4.5z"
      fillRule="evenodd"
    />
  ),
  connections: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" opacity="0.55" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" opacity="0.55" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </>
  ),
  "letter-boxed": (
    <>
      <rect x="4" y="4" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 4 20 12 12 20 4 9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="4" r="2" />
      <circle cx="20" cy="12" r="2" />
      <circle cx="12" cy="20" r="2" />
      <circle cx="4" cy="9" r="2" />
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
