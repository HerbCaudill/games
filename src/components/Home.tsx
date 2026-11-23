import { useState } from "react"
import { GAMES, type GameInfo } from "@/constants"
import { useKeydown } from "@/lib/useKeydown"
import { navigate } from "@/lib/navigate"
import { newYorkTime } from "@/lib/newYorkTime"
import { useEverySecond } from "@/lib/useEverySecond"
import type { GameId } from "@/types"
import { HomeTile } from "./HomeTile"
import { readHomeTile } from "./readHomeTile"
import { ShortcutsButton } from "./ShortcutsButton"

/** The menu of today's games. */
export function Home(
  /** The component props. */
  { date, isToday }: Props,
) {
  const query = isToday ? "" : `?date=${date}`
  const now = Date.now()
  const waits = GAMES.map(game => waitFor(game, date, now))
  useEverySecond(waits.some(wait => wait > 0))
  // The game whose tile is shaking no, because its puzzle isn't out yet.
  const [shaking, setShaking] = useState<GameId>()

  /** Open a game, or shake its tile if its puzzle isn't out yet. */
  const open = (index: number) => {
    const game = GAMES[index]
    if (waits[index] > 0) setShaking(game.id)
    else navigate(`/${game.id}${query}`)
  }

  useKeydown(event => {
    const index = Number(event.key) - 1
    if (!GAMES[index]) return
    event.preventDefault()
    open(index)
  })

  return (
    <div className="app-shell">
      {/* No visible header, but iOS only keeps the status bar clear of blur above an opaque sticky one. */}
      <header className="app-header app-header-bare">
        <h1 className="sr-only">Games</h1>
      </header>
      <ShortcutsButton context="home" showButton={false} />
      <main className="app-content">
        <ul className="mx-auto grid max-w-xl gap-3 px-4 pb-4 sm:pt-4">
          {GAMES.map((game, i) => (
            <li key={game.id}>
              <HomeTile
                game={game}
                href={`/${game.id}${query}`}
                shortcut={i + 1}
                tile={readHomeTile(game.id, date)}
                wait={waits[i]}
                shaking={shaking === game.id}
                onOpen={() => open(i)}
                onShakeEnd={() => setShaking(undefined)}
              />
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

/** Milliseconds until a game's puzzle for a date comes out, or 0 once it's out. */
function waitFor(
  /** The game. */
  game: GameInfo,
  /** Puzzle date as YYYY-MM-DD. */
  date: string,
  /** The current time, in milliseconds since 1970. */
  now: number,
) {
  if (game.releaseHour === undefined) return 0
  return Math.max(0, newYorkTime(date, game.releaseHour) - now)
}

type Props = {
  /** Puzzle date as YYYY-MM-DD. */
  date: string
  /** Whether the date is today's. */
  isToday: boolean
}
