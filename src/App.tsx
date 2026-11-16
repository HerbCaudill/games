import { GameScreen } from "./components/GameScreen"
import { Home } from "./components/Home"
import { GAMES } from "./constants"
import { nytToday } from "./lib/nytToday"
import { useRoute } from "./lib/useRoute"

/** Route between the game menu and each game. */
export function App(
  /** No external configuration. */
  _props: Props,
) {
  const { path, params } = useRoute()
  const today = nytToday()
  const date = params.get("date") ?? today
  const game = GAMES.find(g => path === `/${g.id}`)
  if (game) return <GameScreen game={game} date={date} isToday={date === today} />
  return <Home date={date} isToday={date === today} />
}

type Props = Record<string, never>
