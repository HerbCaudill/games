import { GameScreen } from "./components/GameScreen"
import { Home } from "./components/Home"
import { CompletionCelebration } from "./components/CompletionCelebration"
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
  return (
    <>
      {game ? (
        <GameScreen game={game} date={date} isToday={date === today} />
      ) : (
        <Home date={date} isToday={date === today} />
      )}
      <CompletionCelebration />
    </>
  )
}

type Props = Record<string, never>
