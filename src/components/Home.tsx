import { GAMES } from "@/constants"
import { useKeydown } from "@/lib/useKeydown"
import { navigate } from "@/lib/navigate"
import { HomeTile } from "./HomeTile"
import { readHomeTile } from "./readHomeTile"
import { ShortcutsButton } from "./ShortcutsButton"

/** The menu of today's games. */
export function Home(
  /** The component props. */
  { date, isToday }: Props,
) {
  const query = isToday ? "" : `?date=${date}`
  useKeydown(event => {
    const game = GAMES[Number(event.key) - 1]
    if (!game) return
    event.preventDefault()
    navigate(`/${game.id}${query}`)
  })

  return (
    <div className="app-shell">
      <h1 className="sr-only">Games</h1>
      <ShortcutsButton context="home" showButton={false} />
      <main className="app-content">
        <ul className="mx-auto grid max-w-xl gap-3 p-4 sm:pt-8">
          {GAMES.map((game, i) => (
            <li key={game.id}>
              <HomeTile
                game={game}
                href={`/${game.id}${query}`}
                shortcut={i + 1}
                tile={readHomeTile(game.id, date)}
              />
            </li>
          ))}
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
