import { IconChevronLeft } from "@tabler/icons-react"
import type { GameInfo } from "@/constants"
import { Connections } from "@/games/connections/Connections"
import { Crossword } from "@/games/crossword/Crossword"
import { LetterBoxed } from "@/games/letter-boxed/LetterBoxed"
import { Pips } from "@/games/pips/Pips"
import { SpellingBee } from "@/games/spelling-bee/SpellingBee"
import { formatDate } from "@/lib/formatDate"
import { usePuzzle } from "@/lib/usePuzzle"
import { navigate } from "@/lib/navigate"
import type { GameId, PuzzleFor } from "@/types"
import { GameGlyph } from "./GameGlyph"
import { ShortcutsButton } from "./ShortcutsButton"
import { Button } from "./ui/button"

/** A game with its header, loading and error states. */
export function GameScreen(
  /** The component props. */
  { game, date, isToday }: Props,
) {
  const load = usePuzzle(game.id, date)
  return (
    <div className="app-shell">
      <header className="app-header">
        <Button
          variant="ghost"
          size="icon"
          aria-label="All games"
          title="All games"
          onClick={() => navigate(isToday ? "/" : `/?date=${date}`)}
        >
          <IconChevronLeft />
        </Button>
        <GameGlyph game={game.id} className="size-6 shrink-0" />
        <h1
          className="min-w-0 truncate font-semibold"
          style={{ color: `color-mix(in srgb, ${game.color}, var(--foreground) 55%)` }}
        >
          {game.name}
        </h1>
        <span className="text-muted-foreground ml-auto truncate text-sm">
          {formatDate(date, "short")}
        </span>
        <ShortcutsButton context={game.id} />
      </header>
      <main className="app-content">
        {load.status === "loading" && (
          <p className="text-muted-foreground p-8 text-center">Loading…</p>
        )}
        {load.status === "error" && (
          <p className="text-destructive p-8 text-center">
            Couldn’t load the puzzle: {load.message}
          </p>
        )}
        {load.status === "ready" && <GameBody game={game.id} puzzle={load.puzzle} date={date} />}
      </main>
    </div>
  )
}

/** The game itself; keyed by date so each puzzle starts with fresh component state. */
function GameBody({
  game,
  puzzle,
  date,
}: {
  game: GameId
  puzzle: PuzzleFor[GameId]
  date: string
}) {
  switch (game) {
    case "crossword":
      return <Crossword key={date} puzzle={puzzle as PuzzleFor["crossword"]} />
    case "pips":
      return <Pips key={date} puzzle={puzzle as PuzzleFor["pips"]} />
    case "spelling-bee":
      return <SpellingBee key={date} puzzle={puzzle as PuzzleFor["spelling-bee"]} />
    case "connections":
      return <Connections key={date} puzzle={puzzle as PuzzleFor["connections"]} />
    case "letter-boxed":
      return <LetterBoxed key={date} puzzle={puzzle as PuzzleFor["letter-boxed"]} />
  }
}

type Props = {
  /** The game. */
  game: GameInfo
  /** Puzzle date as YYYY-MM-DD. */
  date: string
  /** Whether the date is today's. */
  isToday: boolean
}
