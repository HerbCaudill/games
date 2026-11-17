import { IconChevronLeft } from "@tabler/icons-react"
import { useState } from "react"
import type { GameInfo } from "@/constants"
import { Connections } from "@/games/connections/Connections"
import { Crossword } from "@/games/crossword/Crossword"
import { LetterBoxed } from "@/games/letter-boxed/LetterBoxed"
import { Pips } from "@/games/pips/Pips"
import { SpellingBee } from "@/games/spelling-bee/SpellingBee"
import { formatDate } from "@/lib/formatDate"
import { usePersistentState } from "@/lib/usePersistentState"
import { usePuzzle } from "@/lib/usePuzzle"
import { navigate } from "@/lib/navigate"
import type { GameId, PuzzleFor } from "@/types"
import { GameGlyph } from "./GameGlyph"
import { ShortcutsButton } from "./ShortcutsButton"
import { TokenForm } from "./TokenForm"
import { Button } from "./ui/button"

/** A game with its header, loading and error states. */
export function GameScreen(
  /** The component props. */
  { game, date, isToday }: Props,
) {
  const [token, setToken] = usePersistentState("nyt-token", () => "")
  const load = usePuzzle(game.id, date, token)
  const [toolbar, setToolbar] = useState<HTMLElement | null>(null)
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
        <GameGlyph game={game.id} className="game-title size-6 shrink-0" />
        <h1
          className="game-title min-w-0 truncate font-semibold"
          style={{ color: `color-mix(in srgb, ${game.color}, var(--foreground) 55%)` }}
        >
          {game.name}
        </h1>
        <span className="game-title text-muted-foreground ml-auto truncate text-sm">
          {formatDate(date, "short")}
        </span>
        <ShortcutsButton context={game.id} />
        <div ref={setToolbar} className="game-toolbar contents" />
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
        {load.status === "needs-token" && <TokenForm message={load.message} onSave={setToken} />}
        {load.status === "ready" && (
          <GameBody game={game.id} puzzle={load.puzzle} date={date} toolbar={toolbar} />
        )}
      </main>
    </div>
  )
}

/** The game itself; keyed by date so each puzzle starts with fresh component state. */
function GameBody({ game, puzzle, date, toolbar }: GameBodyProps) {
  switch (game) {
    case "crossword":
      return <Crossword key={date} puzzle={puzzle as PuzzleFor["crossword"]} toolbar={toolbar} />
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

type GameBodyProps = {
  /** The game. */
  game: GameId
  /** Its puzzle. */
  puzzle: PuzzleFor[GameId]
  /** Puzzle date as YYYY-MM-DD. */
  date: string
  /** Header element a game can render touch controls into. */
  toolbar: HTMLElement | null
}

type Props = {
  /** The game. */
  game: GameInfo
  /** Puzzle date as YYYY-MM-DD. */
  date: string
  /** Whether the date is today's. */
  isToday: boolean
}
