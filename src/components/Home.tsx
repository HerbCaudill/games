import { IconCheck } from "@tabler/icons-react"
import { GAMES } from "@/constants"
import { formatDate } from "@/lib/formatDate"
import { readGameStatus } from "@/lib/useGameStatus"
import { useKeydown } from "@/lib/useKeydown"
import { navigate } from "@/lib/useRoute"
import { GameGlyph } from "./GameGlyph"
import { ShortcutsButton } from "./ShortcutsButton"

/** The menu of today's games. */
export function Home({ date, isToday }: Props) {
  const query = isToday ? "" : `?date=${date}`
  useKeydown(event => {
    const game = GAMES[Number(event.key) - 1]
    if (!game) return
    event.preventDefault()
    navigate(`/${game.id}${query}`)
  })

  return (
    <div className="app-shell">
      <header className="app-header">
        <img src="/icon.svg" alt="" className="size-8 shrink-0 rounded-md" />
        <h1 className="min-w-0 truncate font-semibold">Games</h1>
        <span className="text-muted-foreground ml-auto truncate text-sm">{formatDate(date)}</span>
        <ShortcutsButton context="home" />
      </header>
      <main className="app-content">
        <ul className="mx-auto grid max-w-xl gap-3 p-4 sm:pt-8">
          {GAMES.map((game, i) => {
            const status = readGameStatus(game.id, date)
            return (
              <li key={game.id}>
                <a
                  href={`/${game.id}${query}`}
                  onClick={event => {
                    event.preventDefault()
                    navigate(`/${game.id}${query}`)
                  }}
                  className="bg-card hover:bg-muted focus-visible:ring-ring/50 flex items-center gap-4 rounded-xl border p-4 transition-colors outline-none focus-visible:ring-3"
                >
                  <span
                    className="grid size-12 shrink-0 place-items-center rounded-lg text-white"
                    style={{ background: game.color }}
                  >
                    <GameGlyph game={game.id} className="size-7" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{game.name}</span>
                    <span className="text-muted-foreground block truncate text-sm">
                      {game.blurb}
                    </span>
                  </span>
                  {status === "solved" && (
                    <IconCheck
                      className="text-muted-foreground size-5 shrink-0"
                      aria-label="Solved"
                    />
                  )}
                  {status === "started" && (
                    <span className="text-muted-foreground shrink-0 text-xs">In progress</span>
                  )}
                  <kbd className="text-muted-foreground hidden shrink-0 rounded border px-1.5 font-mono text-xs pointer-fine:inline">
                    {i + 1}
                  </kbd>
                </a>
              </li>
            )
          })}
        </ul>
      </main>
    </div>
  )
}

type Props = {
  /** Puzzle date as YYYY-MM-DD. */
  date: string
  /** Whether the date is today's. */
  isToday: boolean
}
