import { IconChevronLeft } from "@tabler/icons-react"
import { useState, type CSSProperties } from "react"
import type { GameInfo } from "@/constants"
import { Connections } from "@/games/connections/Connections"
import { Crossword } from "@/games/crossword/Crossword"
import { LetterBoxed } from "@/games/letter-boxed/LetterBoxed"
import { Pips } from "@/games/pips/Pips"
import { SpellingBee } from "@/games/spelling-bee/SpellingBee"
import { usePuzzle } from "@/lib/usePuzzle"
import { navigate } from "@/lib/navigate"
import type { GameId, PuzzleFor } from "@/types"
import { ShortcutsButton } from "./ShortcutsButton"
import { TokenForm } from "./TokenForm"
import { Button } from "./ui/button"

/** A game with its header, loading and error states. */
export function GameScreen(
  /** The component props. */
  { game, date, isToday, token, onToken }: Props,
) {
  const load = usePuzzle(game.id, date, token)
  const [toolbar, setToolbar] = useState<HTMLElement | null>(null)
  return (
    <div className="app-shell" data-game={game.id}>
      <header
        className="app-header app-header-game"
        style={
          {
            "--header-background": game.color,
            ...(game.reversed && { "--foreground": "#ffffff" }),
          } as CSSProperties
        }
      >
        <Button
          variant="ghost"
          size="icon"
          className="size-10"
          aria-label="All games"
          title="All games"
          onClick={() => navigate(isToday ? "/" : `/?date=${date}`)}
        >
          <IconChevronLeft className="size-7" stroke={2.5} />
        </Button>
        <h1 className="sr-only">{game.name}</h1>
        {/* Each game puts its own controls here. */}
        <div ref={setToolbar} className="flex min-w-0 flex-1 items-center gap-2" />
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
        {load.status === "needs-token" && <TokenForm message={load.message} onSave={onToken} />}
        {load.status === "ready" && (
          <GameBody game={game.id} puzzle={load.data} date={date} token={token} toolbar={toolbar} />
        )}
      </main>
    </div>
  )
}

/** The game itself; keyed by date so each puzzle starts with fresh component state. */
function GameBody({ game, puzzle, date, token, toolbar }: GameBodyProps) {
  switch (game) {
    case "crossword":
      return (
        <Crossword
          key={date}
          puzzle={puzzle as PuzzleFor["crossword"]}
          token={token}
          toolbar={toolbar}
        />
      )
    case "pips":
      return <Pips key={date} puzzle={puzzle as PuzzleFor["pips"]} toolbar={toolbar} />
    case "spelling-bee":
      return (
        <SpellingBee
          key={date}
          puzzle={puzzle as PuzzleFor["spelling-bee"]}
          token={token}
          toolbar={toolbar}
        />
      )
    case "connections":
      return <Connections key={date} puzzle={puzzle as PuzzleFor["connections"]} token={token} />
    case "letter-boxed":
      return (
        <LetterBoxed key={date} puzzle={puzzle as PuzzleFor["letter-boxed"]} toolbar={toolbar} />
      )
  }
}

type GameBodyProps = {
  /** The game. */
  game: GameId
  /** Its puzzle. */
  puzzle: PuzzleFor[GameId]
  /** Puzzle date as YYYY-MM-DD. */
  date: string
  /** The NYT-S cookie value saved on this device. */
  token: string
  /** Header element a game can render its controls into. */
  toolbar: HTMLElement | null
}

type Props = {
  /** The game. */
  game: GameInfo
  /** Puzzle date as YYYY-MM-DD. */
  date: string
  /** Whether the date is today's. */
  isToday: boolean
  /** The NYT-S cookie value saved on this device. */
  token: string
  /** Save a new token, when NYT rejects the saved one. */
  onToken: (token: string) => void
}
